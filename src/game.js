import confetti from 'canvas-confetti';
import Matter from 'matter-js';
import { BOARD_CONFIG, PhysicsWorld } from './physics.js';
import { GameRenderer } from './renderer.js';
import { AiOpponent, LEVEL_CONFIGS } from './ai.js';
import { soundManager } from './audio.js';

export class SlingPuckGame {
  constructor(canvas, uiCallbacks = {}) {
    this.canvas = canvas;
    this.uiCallbacks = uiCallbacks;

    // Load progress from localStorage safely
    const hasStorage = typeof localStorage !== 'undefined';
    this.currentLevel = parseInt(hasStorage ? localStorage.getItem('sling_puck_level') || '1' : '1', 10);
    this.unlockedLevel = parseInt(hasStorage ? localStorage.getItem('sling_puck_unlocked') || '1' : '1', 10);
    this.stars = JSON.parse(hasStorage ? localStorage.getItem('sling_puck_stars') || '{}' : '{}');

    this.mode = 'campaign'; // 'campaign' | 'pvp' (pass & play) | 'online' | 'practice'
    this.state = 'IDLE'; // 'IDLE' | 'AIMING' | 'SHOT_MOVING' | 'AI_TURN' | 'ROUND_OVER'
    this.turn = 'player'; // 'player' | 'ai' | 'player2'
    this.turnCount = 0;
    this.playerShotCount = 0; // Number of shots taken by the active player

    this.aimPuck = null;
    this.aimPull = { x: 0, y: 0 };
    this.aimStartPos = { x: 0, y: 0 };
    this.isDragging = false;

    // AI aiming state for rendering
    this.aiPuck = null;
    this.aiAiming = false;

    // Remote / Multiplayer state
    this.multiplayerClient = null;
    this.myRole = 'host'; // 'host' (player 1, bottom) | 'guest' (player 2, top)
    this.isFlipped = false; // true for guest in online mode to rotate perspective 180°
    this.isAuthoritativeShooter = false;
    this.lastSyncTime = 0;
    this.remoteAimPuck = null;
    this.remoteAiming = false;
    this.remotePull = { x: 0, y: 0 };
    this.multiplayerOpponent = null;
    this.roomCode = null;

    // Timer tracking for physics settling
    this.shotMoveTime = 0;

    // Turn countdown timer (12s per shot)
    this.turnTimeLimit = 12;
    this.turnTimeRemaining = 12;
    this.lastTimerSecond = 12;

    // Initialize subsystems
    this.initRenderer();
    this.initPhysics();
    this.initAi();
    this.setupInputHandlers();

    // Start render/game loop
    this.lastFrameTime = performance.now();
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  initRenderer() {
    this.renderer = new GameRenderer(this.canvas);
    this.setupCornerAnchors();
  }

  // Set up 4 invisible corner anchors for exact homography coordinate unprojection
  setupCornerAnchors() {
    const container = this.canvas.parentElement;
    if (!container) return;

    this.cornerTL = document.createElement('div');
    this.cornerTR = document.createElement('div');
    this.cornerBR = document.createElement('div');
    this.cornerBL = document.createElement('div');

    const anchors = [this.cornerTL, this.cornerTR, this.cornerBR, this.cornerBL];
    anchors.forEach((a) => {
      a.style.position = 'absolute';
      a.style.width = '0px';
      a.style.height = '0px';
      a.style.pointerEvents = 'none';
      a.style.visibility = 'hidden';
    });

    this.cornerTL.style.top = '0';
    this.cornerTL.style.left = '0';

    this.cornerTR.style.top = '0';
    this.cornerTR.style.right = '0';

    this.cornerBR.style.bottom = '0';
    this.cornerBR.style.right = '0';

    this.cornerBL.style.bottom = '0';
    this.cornerBL.style.left = '0';

    anchors.forEach((a) => container.appendChild(a));
  }

  initPhysics() {
    this.physics = new PhysicsWorld({
      onGoalPass: (puck, direction) => {
        const { x, y } = puck.body.position;
        this.renderer.addParticles(x, y, '#f39c12', 16);
        if (this.uiCallbacks.onGoalPass) {
          this.uiCallbacks.onGoalPass(puck, direction);
        }
        this.updatePuckCounters();
      },
      onCollision: (pos, intensity, type) => {
        if (intensity > 0.4) {
          const color = type === 'puck' ? '#ecf0f1' : '#d35400';
          this.renderer.addParticles(pos.x, pos.y, color, Math.floor(intensity * 6));
        }
      },
    });
  }

  initAi() {
    this.ai = new AiOpponent(this.physics, this.renderer, {
      onAiAiming: (puck, pullVector) => {
        this.aiPuck = puck;
        this.aiPull = pullVector;
        this.aiAiming = true;
      },
      onAiShotFired: (puck) => {
        this.aiAiming = false;
        this.aiPuck = null;
        this.aiPull = null;
        this.state = 'SHOT_MOVING';
        this.shotMoveTime = 0;
        this.turnCount++;
        this.notifyStateChange();
      },
    });
  }

  // Initialize online multiplayer client
  initMultiplayer(multiplayerClient) {
    this.multiplayerClient = multiplayerClient;
    const existingCallbacks = { ...this.multiplayerClient.callbacks };
    this.multiplayerClient.callbacks = {
      ...existingCallbacks,
      onMatchStart: ({ roomCode, level, myRole, opponent, firstTurn }) => {
        if (existingCallbacks.onMatchStart) {
          existingCallbacks.onMatchStart({ roomCode, level, myRole, opponent, firstTurn });
        } else {
          this.startOnlineMatch({ roomCode, myRole, opponent, level, firstTurn });
        }
      },
      onMatchStartSimulated: ({ roomCode, opponent, level, firstTurn }) => {
        if (existingCallbacks.onMatchStartSimulated) {
          existingCallbacks.onMatchStartSimulated({ roomCode, opponent, level, firstTurn });
        } else {
          this.startSimulatedOnlineMatch({ roomCode, opponent, level, firstTurn });
        }
      },
      onOpponentAim: (aiming, pull, puckId) => {
        if (existingCallbacks.onOpponentAim) existingCallbacks.onOpponentAim(aiming, pull, puckId);
        this.handleRemoteAim(aiming, pull, puckId);
      },
      onOpponentShot: (puckId, impulse, origin, puckStates) => {
        if (existingCallbacks.onOpponentShot) existingCallbacks.onOpponentShot(puckId, impulse, origin, puckStates);
        this.handleRemoteShot(puckId, impulse, origin, puckStates);
      },
      onPuckSync: (pucks) => {
        if (existingCallbacks.onPuckSync) existingCallbacks.onPuckSync(pucks);
        this.handlePuckSync(pucks);
      },
      onShotSettled: (data) => {
        if (existingCallbacks.onShotSettled) existingCallbacks.onShotSettled(data);
        this.handleShotSettled(data);
      },
      onRematchStart: (level) => {
        if (existingCallbacks.onRematchStart) existingCallbacks.onRematchStart(level);
        this.startOnlineMatch({
          roomCode: this.roomCode,
          myRole: this.myRole,
          opponent: this.multiplayerOpponent,
          level,
        });
      },
      onOpponentLeft: (message) => {
        if (existingCallbacks.onOpponentLeft) existingCallbacks.onOpponentLeft(message);
        this.handleOpponentLeft(message);
      },
    };
  }

  // Start online multiplayer match
  startOnlineMatch({ roomCode, myRole, opponent, level = 1, firstTurn = 'player' }) {
    this.mode = 'online';
    this.myRole = myRole; // 'host' | 'guest'
    this.isFlipped = (myRole === 'guest'); // Rotate 180° so Guest is always at the bottom of their screen
    this.multiplayerOpponent = opponent;
    this.roomCode = roomCode;
    this.currentLevel = level || 1;
    this.turn = firstTurn || 'player'; // host starts
    this.turnCount = 0;
    this.playerShotCount = 0;
    this.state = 'IDLE';
    this.aimPuck = null;
    this.isDragging = false;
    this.remoteAimPuck = null;
    this.remoteAiming = false;
    this.remotePull = { x: 0, y: 0 };
    this.isAuthoritativeShooter = false;
    this.lastSyncTime = 0;
    if (this.ai) this.ai.cancel();

    this.physics.spawnPucks();
    this.updatePuckCounters();
    this.resetTurnTimer();
    this.notifyStateChange();

    if (this.uiCallbacks.onOnlineMatchStart) {
      this.uiCallbacks.onOnlineMatchStart({
        roomCode,
        myRole,
        opponent,
        level: this.currentLevel,
        isSimulated: false,
      });
    }
  }

  // Start simulated online match with dynamic realistic bot (SBMM)
  startSimulatedOnlineMatch({ roomCode, opponent, level = 1, firstTurn = 'player' }) {
    this.mode = 'online_simulated';
    this.myRole = 'host';
    this.isFlipped = false;
    this.multiplayerOpponent = opponent;
    this.roomCode = roomCode || ('ONLINE_' + Math.floor(1000 + Math.random() * 9000));
    this.currentLevel = Math.max(1, Math.min(10, level || 1));
    this.turn = firstTurn || 'player';
    this.turnCount = 0;
    this.playerShotCount = 0;
    this.state = this.turn === 'player' ? 'IDLE' : 'AI_TURN';
    this.aimPuck = null;
    this.isDragging = false;
    this.remoteAimPuck = null;
    this.remoteAiming = false;
    this.remotePull = { x: 0, y: 0 };
    this.isAuthoritativeShooter = false;
    this.lastSyncTime = 0;
    if (this.ai) this.ai.cancel();

    this.physics.spawnPucks();
    this.updatePuckCounters();
    this.resetTurnTimer();
    this.notifyStateChange();

    if (this.uiCallbacks.onOnlineMatchStart) {
      this.uiCallbacks.onOnlineMatchStart({
        roomCode: this.roomCode,
        myRole: 'host',
        opponent,
        level: this.currentLevel,
        isSimulated: true,
      });
    }

    if (this.turn === 'ai') {
      setTimeout(() => {
        if (this.mode === 'online_simulated' && this.turn === 'ai') {
          this.ai.startTurn(this.currentLevel - 1);
        }
      }, 500);
    }
  }

  handleRemoteAim(aiming, pull, puckId) {
    this.remoteAiming = aiming;
    if (aiming) {
      const puck =
        this.physics.pucks.find((p) => p.id === puckId) ||
        (this.myRole === 'host' ? this.physics.getAiPucks()[0] : this.physics.getPlayerPucks()[0]);
      this.remoteAimPuck = puck;
      this.remotePull = pull || { x: 0, y: 0 };

      // Real-time visual tactile spring stretch on receiver's phone
      if (puck && pull) {
        if (!puck.remoteBasePos) {
          puck.remoteBasePos = { x: puck.body.position.x, y: puck.body.position.y };
        }
        const dist = Math.hypot(pull.x, pull.y);
        if (dist > 2) {
          const nudge = Math.min(dist / BOARD_CONFIG.MAX_PULL, 1.0) * 8;
          Matter.Body.setPosition(puck.body, {
            x: puck.remoteBasePos.x + (pull.x / dist) * nudge,
            y: puck.remoteBasePos.y + (pull.y / dist) * nudge,
          });
          Matter.Body.setVelocity(puck.body, { x: 0, y: 0 });
        }
      }
    } else {
      if (this.remoteAimPuck && this.remoteAimPuck.remoteBasePos) {
        Matter.Body.setPosition(this.remoteAimPuck.body, this.remoteAimPuck.remoteBasePos);
        this.remoteAimPuck.remoteBasePos = null;
      }
      this.remoteAimPuck = null;
      this.remotePull = { x: 0, y: 0 };
    }
  }

  handleRemoteShot(puckId, impulse, origin, puckStates) {
    this.isAuthoritativeShooter = false;

    if (this.remoteAimPuck && this.remoteAimPuck.remoteBasePos) {
      Matter.Body.setPosition(this.remoteAimPuck.body, this.remoteAimPuck.remoteBasePos);
      this.remoteAimPuck.remoteBasePos = null;
    }

    // Synchronize all puck positions if provided to eliminate any physics drift
    if (puckStates && Array.isArray(puckStates)) {
      puckStates.forEach((ps) => {
        const p = this.physics.pucks.find((item) => item.id === ps.id);
        if (p && p.body) {
          Matter.Body.setPosition(p.body, { x: ps.x, y: ps.y });
          Matter.Body.setVelocity(p.body, { x: ps.vx, y: ps.vy });
          Matter.Sleeping.set(p.body, false);
          Matter.Body.setStatic(p.body, false);
        }
      });
    }

    const puck =
      this.physics.pucks.find((p) => p.id === puckId) ||
      (this.myRole === 'host' ? this.physics.getAiPucks()[0] : this.physics.getPlayerPucks()[0]);

    if (puck) {
      if (origin) {
        Matter.Body.setPosition(puck.body, origin);
      }
      soundManager.playSlingSnap();
      this.physics.launchPuck(puck, impulse);

      this.remoteAiming = false;
      this.remoteAimPuck = null;
      this.remotePull = { x: 0, y: 0 };
      this.state = 'SHOT_MOVING';
      this.shotMoveTime = 0;
      this.turnCount++;
      this.notifyStateChange();
    }
  }

  // Handle continuous live puck motion streaming from shooter
  handlePuckSync(puckList) {
    if (!puckList || !Array.isArray(puckList)) return;
    puckList.forEach((ps) => {
      const p = this.physics.pucks.find((item) => item.id === ps.id);
      if (p && p.body) {
        Matter.Body.setPosition(p.body, { x: ps.x, y: ps.y });
        Matter.Body.setVelocity(p.body, { x: ps.vx, y: ps.vy });
        Matter.Sleeping.set(p.body, false);
      }
    });
    this.physics.resolvePuckOverlaps(3);
  }

  // Handle authoritative settle event from shooter
  handleShotSettled(data) {
    if (data.puckStates && Array.isArray(data.puckStates)) {
      data.puckStates.forEach((ps) => {
        const p = this.physics.pucks.find((item) => item.id === ps.id);
        if (p && p.body) {
          Matter.Body.setPosition(p.body, { x: ps.x, y: ps.y });
          Matter.Body.setVelocity(p.body, { x: 0, y: 0 });
        }
      });
    }
    this.physics.settlePucks();
    this.checkWinLossOrNextTurn(data.nextTurn);
  }

  resetTurnTimer() {
    this.turnTimeRemaining = this.turnTimeLimit;
    this.lastTimerSecond = this.turnTimeLimit;
    if (this.uiCallbacks.onTimerTick) {
      this.uiCallbacks.onTimerTick(this.turnTimeLimit);
    }
  }

  handleTurnTimeout() {
    // If aiming, cleanly cancel puck
    if (this.aimPuck) {
      Matter.Body.setPosition(this.aimPuck.body, this.dragOrigin);
      Matter.Body.setVelocity(this.aimPuck.body, { x: 0, y: 0 });
      this.aimPuck.isHeld = false;
      this.physics.resolvePuckOverlaps(4);
      this.aimPuck = null;
      this.isDragging = false;
      this.aimPull = { x: 0, y: 0 };
    }
    if (this.mode === 'online') {
      this.multiplayerClient?.sendAim(false, { x: 0, y: 0 }, null);
    }

    soundManager.playLose();
    this.resetTurnTimer();

    if (this.uiCallbacks.onTurnTimeout) {
      this.uiCallbacks.onTurnTimeout(this.turn);
    }

    // Switch turn to opponent!
    if (this.mode === 'campaign' || this.mode === 'online_simulated') {
      if (this.turn === 'player') {
        this.turn = 'ai';
        this.state = 'AI_TURN';
        this.notifyStateChange();
        this.ai.startTurn(this.currentLevel - 1);
      } else {
        this.turn = 'player';
        this.state = 'IDLE';
        this.notifyStateChange();
      }
    } else {
      // 'pvp' or 'online'
      this.turn = this.turn === 'player' ? 'player2' : 'player';
      this.state = 'IDLE';
      this.notifyStateChange();
    }
  }

  handleOpponentLeft(message) {
    this.state = 'ROUND_OVER';
    if (this.uiCallbacks.onOpponentLeft) {
      this.uiCallbacks.onOpponentLeft(message);
    }
  }

  // Start or reset a match for a given level
  startLevel(levelNumber) {
    this.currentLevel = Math.max(1, Math.min(10, levelNumber));
    this.state = 'IDLE';
    this.turn = 'player';
    this.turnCount = 0;
    this.playerShotCount = 0;
    this.aimPuck = null;
    this.isDragging = false;
    this.ai.cancel();
    this.aiPuck = null;
    this.aiAiming = false;

    // Spawn 5 black and 5 white pucks
    this.physics.spawnPucks();
    this.updatePuckCounters();
    this.resetTurnTimer();
    this.notifyStateChange();

    if (this.uiCallbacks.onLevelStart) {
      const config = LEVEL_CONFIGS[this.currentLevel - 1];
      this.uiCallbacks.onLevelStart(this.currentLevel, config);
    }
  }

  // Switch game mode
  setMode(mode) {
    this.mode = mode; // 'campaign' | 'pvp' | 'practice'
    this.startLevel(this.currentLevel);
  }

  // Update live counts on UI
  updatePuckCounters() {
    const counts = this.physics.getPuckCounts();
    if (this.uiCallbacks.onPuckCountChange) {
      this.uiCallbacks.onPuckCountChange(counts.playerCount, counts.aiCount);
    }
  }

  notifyStateChange() {
    if (this.uiCallbacks.onStateChange) {
      this.uiCallbacks.onStateChange({
        state: this.state,
        turn: this.turn,
        turnCount: this.turnCount,
        level: this.currentLevel,
        mode: this.mode,
      });
    }
  }

  // Main game & animation loop
  loop(currentTime) {
    const deltaMs = Math.min(currentTime - this.lastFrameTime, 33.33); // max 30fps step clamp
    const deltaSec = deltaMs / 1000;
    this.lastFrameTime = currentTime;

    // Update physics
    this.physics.update(deltaMs);

    // Update AI state
    if (this.turn === 'ai' && (this.mode === 'campaign' || this.mode === 'online_simulated')) {
      this.ai.update(deltaMs);
    }

    // Update renderer effects
    this.renderer.update(deltaSec);

    // Update turn countdown timer during aiming / thinking
    if (this.state === 'IDLE' || this.state === 'AIMING') {
      this.turnTimeRemaining = Math.max(0, this.turnTimeRemaining - deltaSec);
      const curSec = Math.ceil(this.turnTimeRemaining);
      if (curSec !== this.lastTimerSecond) {
        this.lastTimerSecond = curSec;
        if (this.uiCallbacks.onTimerTick) {
          this.uiCallbacks.onTimerTick(curSec);
        }
      }
      if (this.turnTimeRemaining <= 0) {
        this.handleTurnTimeout();
      }
    }

    // Handle shot movement & settling
    if (this.state === 'SHOT_MOVING') {
      this.shotMoveTime += deltaSec;

      // In online mode, if local player fired, stream live puck sync to opponent
      if (this.mode === 'online' && this.isAuthoritativeShooter) {
        if (currentTime - this.lastSyncTime >= 40) { // ~25 fps sync rate
          this.lastSyncTime = currentTime;
          const syncPucks = this.physics.pucks.map((p) => ({
            id: p.id,
            x: p.body.position.x,
            y: p.body.position.y,
            vx: p.body.velocity.x,
            vy: p.body.velocity.y,
          }));
          this.multiplayerClient?.sendPuckSync(syncPucks);
        }
      }

      // Check settling
      if (this.shotMoveTime > 0.35) {
        const atRest = this.physics.arePucksAtRest(0.55);
        if (atRest || this.shotMoveTime > 2.6) {
          if (this.mode === 'online') {
            if (this.isAuthoritativeShooter) {
              this.physics.settlePucks();
              const nextTurn = this.turn === 'player' ? 'player2' : 'player';
              const finalStates = this.physics.pucks.map((p) => ({
                id: p.id,
                x: p.body.position.x,
                y: p.body.position.y,
              }));
              const { playerCount, aiCount } = this.physics.getPuckCounts();
              this.multiplayerClient?.sendShotSettled(finalStates, playerCount, aiCount, nextTurn);
              this.checkWinLossOrNextTurn(nextTurn);
            } else if (this.shotMoveTime > 3.6) {
              // Safety fallback if receiver missed settled packet
              this.physics.settlePucks();
              this.checkWinLossOrNextTurn();
            }
          } else {
            this.physics.settlePucks();
            this.checkWinLossOrNextTurn();
          }
        }
      }
    }

    // Render frame
    const shooterRole = this.turn === 'player' ? 'player' : 'player2';
    const remoteShooterRole = this.turn === 'player' ? 'player' : 'player2';

    this.renderer.render({
      physics: this.physics,
      turn: this.turn,
      aiming: this.state === 'AIMING',
      aimPuck: this.aimPuck,
      aimPull: this.aimPull,
      shooterRole,
      remoteAiming: this.remoteAiming,
      remoteAimPuck: this.remoteAimPuck,
      remotePull: this.remotePull,
      remoteShooterRole,
      aiPuck: this.aiPuck,
      aiAiming: this.aiAiming,
      aiPull: this.aiPull,
      isMoving: this.state === 'SHOT_MOVING',
      level: this.currentLevel,
      isFlipped: this.isFlipped,
      isOnline: this.mode === 'online' || this.mode === 'online_simulated',
      myRole: this.myRole,
    });

    requestAnimationFrame(this.loop);
  }

  // Evaluate victory / defeat or pass to next turn
  checkWinLossOrNextTurn(forcedNextTurn = null) {
    const { playerCount, aiCount } = this.physics.getPuckCounts();
    this.updatePuckCounters();

    // Check Victory (Player side cleared: 0 white pucks on player side)
    if (playerCount === 0) {
      this.state = 'ROUND_OVER';
      const isLocalWinner = this.mode === 'online' ? this.myRole === 'host' : true;

      if (isLocalWinner) {
        soundManager.playWin();
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } else {
        soundManager.playLose();
      }

      // Star Rating evaluated by player's actual shot count:
      // 5-7 shots: 3 Full Stars (★★★)
      // 8-10 shots: 2 Stars (★★☆)
      // 11+ shots: 1 Star (★☆☆)
      const shots = Math.max(1, this.playerShotCount);
      let stars = 3;
      if (shots > 10) {
        stars = 1;
      } else if (shots > 7) {
        stars = 2;
      } else {
        stars = 3;
      }

      if (this.mode === 'campaign') {
        this.stars[this.currentLevel] = Math.max(this.stars[this.currentLevel] || 0, stars);
        localStorage.setItem('sling_puck_stars', JSON.stringify(this.stars));

        if (this.currentLevel >= this.unlockedLevel && this.currentLevel < 10) {
          this.unlockedLevel = this.currentLevel + 1;
          localStorage.setItem('sling_puck_unlocked', this.unlockedLevel);
        }
      }

      if (this.uiCallbacks.onGameOver) {
        this.uiCallbacks.onGameOver({
          winner: 'player',
          isLocalWinner,
          stars,
          shotCount: shots,
          turnCount: this.turnCount,
          level: this.currentLevel,
          mode: this.mode,
          opponent: this.multiplayerOpponent,
        });
      }
      return;
    }

    // Check Defeat (AI side cleared: 0 black pucks on AI side)
    if (aiCount === 0) {
      this.state = 'ROUND_OVER';
      const isLocalWinner = this.mode === 'online' ? this.myRole === 'guest' : false;

      if (isLocalWinner) {
        soundManager.playWin();
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } else {
        soundManager.playLose();
      }

      const shots = Math.max(1, this.playerShotCount);
      let stars = 3;
      if (shots > 10) stars = 1;
      else if (shots > 7) stars = 2;
      else stars = 3;

      if (this.uiCallbacks.onGameOver) {
        this.uiCallbacks.onGameOver({
          winner: 'ai',
          isLocalWinner,
          stars: isLocalWinner ? stars : 0,
          shotCount: shots,
          turnCount: this.turnCount,
          level: this.currentLevel,
          mode: this.mode,
          opponent: this.multiplayerOpponent,
        });
      }
      return;
    }

    // Neither won yet -> Switch turn!
    this.resetTurnTimer();
    if (this.mode === 'campaign' || this.mode === 'online_simulated') {
      if (this.turn === 'player') {
        this.turn = 'ai';
        this.state = 'AI_TURN';
        this.notifyStateChange();
        this.ai.startTurn(this.currentLevel - 1);
      } else {
        this.turn = 'player';
        this.state = 'IDLE';
        this.notifyStateChange();
      }
    } else {
      // 'pvp' or 'online'
      this.turn = forcedNextTurn || (this.turn === 'player' ? 'player2' : 'player');
      this.state = 'IDLE';
      this.notifyStateChange();
    }
  }

  // Compute 3x3 perspective homography matrix mapping src (4 screen points) to dst (4 virtual canvas points)
  computeHomography(src, dst) {
    const A = [];
    const b = [];
    for (let i = 0; i < 4; i++) {
      const sx = src[i].x;
      const sy = src[i].y;
      const dx = dst[i].x;
      const dy = dst[i].y;
      A.push([sx, sy, 1, 0, 0, 0, -dx * sx, -dx * sy]);
      b.push(dx);
      A.push([0, 0, 0, sx, sy, 1, -dy * sx, -dy * sy]);
      b.push(dy);
    }

    // Gaussian elimination for 8x8 system
    for (let i = 0; i < 8; i++) {
      let maxRow = i;
      for (let r = i + 1; r < 8; r++) {
        if (Math.abs(A[r][i]) > Math.abs(A[maxRow][i])) maxRow = r;
      }
      [A[i], A[maxRow]] = [A[maxRow], A[i]];
      [b[i], b[maxRow]] = [b[maxRow], b[i]];

      const pivot = A[i][i];
      if (Math.abs(pivot) < 1e-8) return null;

      for (let j = i; j < 8; j++) A[i][j] /= pivot;
      b[i] /= pivot;

      for (let r = 0; r < 8; r++) {
        if (r !== i) {
          const factor = A[r][i];
          for (let j = i; j < 8; j++) A[r][j] -= factor * A[i][j];
          b[r] -= factor * b[i];
        }
      }
    }

    return [b[0], b[1], b[2], b[3], b[4], b[5], b[6], b[7], 1];
  }

  // Map client mouse/touch/pointer coordinates to internal 440x740 virtual canvas coords with exact 3D unprojection
  getCanvasCoords(e) {
    let clientX = e.clientX;
    let clientY = e.clientY;

    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if (e.changedTouches && e.changedTouches.length > 0) {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    }

    let vx = 0;
    let vy = 0;

    // Exact homography unprojection using 4 corner anchors
    if (this.cornerTL && this.cornerTR && this.cornerBR && this.cornerBL) {
      const rTL = this.cornerTL.getBoundingClientRect();
      const rTR = this.cornerTR.getBoundingClientRect();
      const rBR = this.cornerBR.getBoundingClientRect();
      const rBL = this.cornerBL.getBoundingClientRect();

      const src = [
        { x: rTL.left, y: rTL.top },
        { x: rTR.left, y: rTR.top },
        { x: rBR.left, y: rBR.top },
        { x: rBL.left, y: rBL.top },
      ];
      const dst = [
        { x: 0, y: 0 },
        { x: BOARD_CONFIG.WIDTH, y: 0 },
        { x: BOARD_CONFIG.WIDTH, y: BOARD_CONFIG.HEIGHT },
        { x: 0, y: BOARD_CONFIG.HEIGHT },
      ];

      const H = this.computeHomography(src, dst);
      if (H) {
        const w = H[6] * clientX + H[7] * clientY + H[8];
        if (Math.abs(w) > 0.0001) {
          vx = (H[0] * clientX + H[1] * clientY + H[2]) / w;
          vy = (H[3] * clientX + H[4] * clientY + H[5]) / w;
        }
      }
    } else {
      // Reliable fallback: standard canvas bounding rect
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = BOARD_CONFIG.WIDTH / rect.width;
      const scaleY = BOARD_CONFIG.HEIGHT / rect.height;
      vx = (clientX - rect.left) * scaleX;
      vy = (clientY - rect.top) * scaleY;
    }

    vx = Math.max(0, Math.min(BOARD_CONFIG.WIDTH, vx));
    vy = Math.max(0, Math.min(BOARD_CONFIG.HEIGHT, vy));

    // When guest perspective is flipped 180°, invert virtual coords to map to physical world coords
    if (this.isFlipped) {
      return {
        x: BOARD_CONFIG.WIDTH - vx,
        y: BOARD_CONFIG.HEIGHT - vy,
      };
    }

    return { x: vx, y: vy };
  }

  setupInputHandlers() {
    this.activePointerId = null;
    this.dragOrigin = { x: 0, y: 0 };

    const onPointerDown = (e) => {
      if (e.cancelable) e.preventDefault();
      soundManager.ensureContext();

      // Allow selecting/aiming a puck if IDLE or already AIMING (to switch target puck!)
      if (this.state !== 'IDLE' && this.state !== 'AIMING') return;

      // Online mode: enforce local player's turn
      if (this.mode === 'online') {
        const isMyTurn =
          (this.myRole === 'host' && this.turn === 'player') ||
          (this.myRole === 'guest' && this.turn === 'player2');
        if (!isMyTurn) return;
      }

      const pos = this.getCanvasCoords(e);
      const isPlayerTurn = this.turn === 'player';
      const isPlayer2Turn = this.turn === 'player2';

      if (!isPlayerTurn && !isPlayer2Turn) return;

      // Eligible pucks for active player
      const eligiblePucks = isPlayerTurn
        ? this.physics.getPlayerPucks()
        : this.physics.getAiPucks();

      if (eligiblePucks.length === 0) return;

      let targetPuck = null;
      let closestDist = Infinity;

      // 1. Direct hit on puck (touch within 3.5x radius: ~56px)
      eligiblePucks.forEach((puck) => {
        const pPos = puck.body.position;
        const dist = Math.hypot(pPos.x - pos.x, pPos.y - pos.y);
        if (dist < puck.radius * 3.5 && dist < closestDist) {
          closestDist = dist;
          targetPuck = puck;
        }
      });

      // 2. Forgiving proximity hit: if user tapped on their side of board, auto-lock to nearest puck within 150px
      if (!targetPuck) {
        eligiblePucks.forEach((puck) => {
          const pPos = puck.body.position;
          const dist = Math.hypot(pPos.x - pos.x, pPos.y - pos.y);
          if (dist < 150 && dist < closestDist) {
            closestDist = dist;
            targetPuck = puck;
          }
        });
      }

      if (targetPuck) {
        // If already aiming another puck, cleanly reset previous puck to allow switching!
        if (this.aimPuck && this.aimPuck !== targetPuck) {
          Matter.Body.setPosition(this.aimPuck.body, this.dragOrigin);
          Matter.Body.setVelocity(this.aimPuck.body, { x: 0, y: 0 });
          this.aimPuck.isHeld = false;
          if (this.mode === 'online') {
            this.multiplayerClient?.sendAim(false, { x: 0, y: 0 }, null);
          }
        }

        if (e.pointerId !== undefined && this.canvas.setPointerCapture) {
          try {
            this.canvas.setPointerCapture(e.pointerId);
            this.activePointerId = e.pointerId;
          } catch (err) {}
        }

        this.aimPuck = targetPuck;
        this.aimPuck.isHeld = true;
        this.isDragging = true;
        this.state = 'AIMING';

        // Anchor is the puck's current physical position
        this.dragOrigin = {
          x: targetPuck.body.position.x,
          y: targetPuck.body.position.y,
        };

        this.aimPull = { x: 0, y: 0 };
        this.notifyStateChange();
      }
    };

    const onPointerMove = (e) => {
      if (!this.isDragging || !this.aimPuck || this.state !== 'AIMING') return;
      if (e.cancelable) e.preventDefault();

      const pos = this.getCanvasCoords(e);
      const { MAX_PULL } = BOARD_CONFIG;

      // Pull vector is from the puck's origin to current pointer
      let pullX = pos.x - this.dragOrigin.x;
      let pullY = pos.y - this.dragOrigin.y;

      // Clamp to maximum pull distance
      const dist = Math.hypot(pullX, pullY);
      if (dist > MAX_PULL) {
        const factor = MAX_PULL / dist;
        pullX *= factor;
        pullY *= factor;
      }

      this.aimPull = { x: pullX, y: pullY };

      // Relay real-time aim to remote opponent
      if (this.mode === 'online' && this.aimPuck) {
        this.multiplayerClient?.sendAim(true, this.aimPull, this.aimPuck.id);
      }

      // Subtle tactile spring shift of the puck in drag direction
      if (dist > 2) {
        const nudge = Math.min(dist / MAX_PULL, 1.0) * 8;
        const curDist = Math.hypot(pullX, pullY);
        Matter.Body.setPosition(this.aimPuck.body, {
          x: this.dragOrigin.x + (pullX / curDist) * nudge,
          y: this.dragOrigin.y + (pullY / curDist) * nudge,
        });
        Matter.Body.setVelocity(this.aimPuck.body, { x: 0, y: 0 });
        this.physics.resolvePuckOverlaps(3);
      }

      if (window.navigator && window.navigator.vibrate && Math.random() < 0.12) {
        window.navigator.vibrate(6);
      }
    };

    const onPointerUp = (e) => {
      if (!this.isDragging || !this.aimPuck || this.state !== 'AIMING') return;
      if (e.cancelable) e.preventDefault();

      if (this.activePointerId !== null && this.canvas.releasePointerCapture) {
        try {
          this.canvas.releasePointerCapture(this.activePointerId);
        } catch (err) {}
        this.activePointerId = null;
      }

      let pullX = this.aimPull.x;
      let pullY = this.aimPull.y;
      let dist = Math.hypot(pullX, pullY);

      // Fallback check from release coords
      if (dist < 4) {
        const pos = this.getCanvasCoords(e);
        const rawX = pos.x - this.dragOrigin.x;
        const rawY = pos.y - this.dragOrigin.y;
        const rawDist = Math.hypot(rawX, rawY);
        if (rawDist > dist) {
          pullX = rawX;
          pullY = rawY;
          dist = rawDist;
        }
      }

      // Launch if pulled at least 22 pixels! (Pulls under 22px are cancelled cleanly)
      const MIN_FIRE_DISTANCE = 22;
      if (dist >= MIN_FIRE_DISTANCE) {
        const pullFraction = Math.min(dist / BOARD_CONFIG.MAX_PULL, 1.0);
        const impulseMag = pullFraction * BOARD_CONFIG.MAX_IMPULSE;

        // Launch vector is opposite of drag pull
        const dirX = -pullX / dist;
        const dirY = -pullY / dist;

        const impulse = {
          x: dirX * impulseMag,
          y: dirY * impulseMag,
        };

        // Reset puck to origin before applying impulse
        Matter.Body.setPosition(this.aimPuck.body, this.dragOrigin);
        this.aimPuck.isHeld = false;
        this.physics.resolvePuckOverlaps(4);
        soundManager.playSlingSnap();

        if (window.navigator && window.navigator.vibrate) {
          window.navigator.vibrate(25);
        }

        this.isAuthoritativeShooter = true;
        this.lastSyncTime = performance.now();
        this.physics.launchPuck(this.aimPuck, impulse);

        // Relay shot to remote opponent with all current puck states for absolute synchronization
        if (this.mode === 'online') {
          const puckStates = this.physics.pucks.map((p) => ({
            id: p.id,
            x: p.body.position.x,
            y: p.body.position.y,
            vx: p.body.velocity.x,
            vy: p.body.velocity.y,
          }));
          this.multiplayerClient?.sendShot(this.aimPuck.id, impulse, this.dragOrigin, puckStates);
        }

        this.resetTurnTimer();
        this.state = 'SHOT_MOVING';
        this.shotMoveTime = 0;
        this.turnCount++;
        this.playerShotCount++;
      } else {
        // CANCELED: restore puck cleanly to original position without shooting!
        Matter.Body.setPosition(this.aimPuck.body, this.dragOrigin);
        Matter.Body.setVelocity(this.aimPuck.body, { x: 0, y: 0 });
        this.aimPuck.isHeld = false;
        this.physics.resolvePuckOverlaps(4);
        this.state = 'IDLE';

        if (this.mode === 'online') {
          this.multiplayerClient?.sendAim(false, { x: 0, y: 0 }, null);
        }
      }

      this.isDragging = false;
      this.aimPuck = null;
      this.aimPull = { x: 0, y: 0 };
      this.notifyStateChange();
    };

    this.canvas.addEventListener('pointerdown', onPointerDown);
    this.canvas.addEventListener('pointermove', onPointerMove);
    this.canvas.addEventListener('pointerup', onPointerUp);
    this.canvas.addEventListener('pointercancel', onPointerUp);

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    this.canvas.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
    this.canvas.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
  }
}
