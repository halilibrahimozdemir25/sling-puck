import Matter from 'matter-js';
import { soundManager } from './audio.js';

if (typeof window !== 'undefined') {
  window.Matter = Matter;
}

export const BOARD_CONFIG = {
  WIDTH: 440,
  HEIGHT: 740,
  BORDER_SIZE: 24,
  DIVIDER_Y: 370,
  DIVIDER_THICKNESS: 16,
  PUCK_RADIUS: 16,
  GATE_WIDTH: 52,
  MAX_PULL: 75,
  MAX_IMPULSE: 27,
};

export class PhysicsWorld {
  constructor(callbacks = {}) {
    this.callbacks = callbacks; // onGoalPass, onCollision
    this.pucks = [];
    this.staticBodies = [];
    this.init();
  }

  init() {
    const { Engine, World } = Matter;

    this.engine = Engine.create({
      gravity: { x: 0, y: 0, scale: 0 },
      positionIterations: 16,
      velocityIterations: 16,
      constraintIterations: 6,
    });
    this.world = this.engine.world;

    this.createBoardBoundaries();
    this.setupCollisionEvents();
  }

  createBoardBoundaries() {
    const { Bodies, Composite } = Matter;
    const {
      WIDTH,
      HEIGHT,
      BORDER_SIZE,
      DIVIDER_Y,
      DIVIDER_THICKNESS,
      GATE_WIDTH,
    } = BOARD_CONFIG;

    const wallOptions = {
      isStatic: true,
      restitution: 0.96, // High elasticity for crisp bank & ricochet shots
      friction: 0.005,   // Slick varnished wooden perimeter cushions
      frictionStatic: 0,
      slop: 0,           // Zero penetration tolerance on boundaries
      label: 'wall',
    };

    // Outer frame cushions
    const topWall = Bodies.rectangle(WIDTH / 2, BORDER_SIZE / 2, WIDTH, BORDER_SIZE, wallOptions);
    const bottomWall = Bodies.rectangle(
      WIDTH / 2,
      HEIGHT - BORDER_SIZE / 2,
      WIDTH,
      BORDER_SIZE,
      wallOptions
    );
    const leftWall = Bodies.rectangle(BORDER_SIZE / 2, HEIGHT / 2, BORDER_SIZE, HEIGHT, wallOptions);
    const rightWall = Bodies.rectangle(
      WIDTH - BORDER_SIZE / 2,
      HEIGHT / 2,
      BORDER_SIZE,
      HEIGHT,
      wallOptions
    );

    // Center divider with center gate opening
    // Gate spans from (WIDTH/2 - GATE_WIDTH/2) to (WIDTH/2 + GATE_WIDTH/2)
    const gateLeft = WIDTH / 2 - GATE_WIDTH / 2; // e.g. 220 - 26 = 194
    const gateRight = WIDTH / 2 + GATE_WIDTH / 2; // e.g. 220 + 26 = 246

    const leftPartWidth = gateLeft - BORDER_SIZE; // 194 - 24 = 170
    const leftPartCenterX = BORDER_SIZE + leftPartWidth / 2;
    const leftDivider = Bodies.rectangle(
      leftPartCenterX,
      DIVIDER_Y,
      leftPartWidth,
      DIVIDER_THICKNESS,
      { ...wallOptions, label: 'divider' }
    );

    const rightPartWidth = WIDTH - BORDER_SIZE - gateRight; // 440 - 24 - 246 = 170
    const rightPartCenterX = gateRight + rightPartWidth / 2;
    const rightDivider = Bodies.rectangle(
      rightPartCenterX,
      DIVIDER_Y,
      rightPartWidth,
      DIVIDER_THICKNESS,
      { ...wallOptions, label: 'divider' }
    );

    // Rounded gate caps for smooth glancing deflections
    const capRadius = DIVIDER_THICKNESS / 2;
    const leftCap = Bodies.circle(gateLeft, DIVIDER_Y, capRadius, {
      ...wallOptions,
      label: 'gate_cap',
    });
    const rightCap = Bodies.circle(gateRight, DIVIDER_Y, capRadius, {
      ...wallOptions,
      label: 'gate_cap',
    });

    this.staticBodies = [
      topWall,
      bottomWall,
      leftWall,
      rightWall,
      leftDivider,
      rightDivider,
      leftCap,
      rightCap,
    ];

    Composite.add(this.world, this.staticBodies);
  }

  setupCollisionEvents() {
    Matter.Events.on(this.engine, 'collisionStart', (event) => {
      event.pairs.forEach((pair) => {
        const { bodyA, bodyB } = pair;
        const isA = bodyA.label === 'puck';
        const isB = bodyB.label === 'puck';

        const vx = (bodyA.velocity?.x || 0) - (bodyB.velocity?.x || 0);
        const vy = (bodyA.velocity?.y || 0) - (bodyB.velocity?.y || 0);
        const relSpeed = Math.hypot(vx, vy);

        if (isA && isB) {
          const intensity = Math.min(relSpeed / 12, 1.0);
          soundManager.playPuckHit(intensity);
          if (this.callbacks.onCollision) {
            const midpoint = {
              x: (bodyA.position.x + bodyB.position.x) / 2,
              y: (bodyA.position.y + bodyB.position.y) / 2,
            };
            this.callbacks.onCollision(midpoint, intensity, 'puck');
          }
        } else if (isA || isB) {
          const puck = isA ? bodyA : bodyB;
          const other = isA ? bodyB : bodyA;
          const intensity = Math.min(relSpeed / 14, 1.0);
          soundManager.playWallHit(intensity);
          if (this.callbacks.onCollision) {
            this.callbacks.onCollision(puck.position, intensity, other.label);
          }
        }
      });
    });
  }

  // Spawn the 5 white (player) and 5 black (AI) pucks
  spawnPucks() {
    const { Bodies, Composite } = Matter;
    const { WIDTH, PUCK_RADIUS } = BOARD_CONFIG;

    // Remove existing pucks from world
    if (this.pucks.length > 0) {
      Composite.remove(
        this.world,
        this.pucks.map((p) => p.body)
      );
      this.pucks = [];
    }

    // Starting positions: 5 on AI side, 5 on Player side
    // Player side layout (bottom):
    const playerPositions = [
      { x: 90, y: 560 },
      { x: 350, y: 560 },
      { x: 150, y: 480 },
      { x: 290, y: 480 },
      { x: 220, y: 590 },
    ];

    // AI side layout (top):
    const aiPositions = [
      { x: 90, y: 180 },
      { x: 350, y: 180 },
      { x: 150, y: 260 },
      { x: 290, y: 260 },
      { x: 220, y: 150 },
    ];

    const createPuck = (pos, team, index) => {
      const body = Bodies.circle(pos.x, pos.y, PUCK_RADIUS, {
        restitution: 0.94,   // High elasticity for lively and bouncy bank shots
        friction: 0.006,     // Smooth gliding on polished board
        frictionAir: 0.016,  // Dynamic, snappy, and realistic glide decay
        frictionStatic: 0.01,
        density: 0.003,
        slop: 0,             // Zero penetration tolerance - circles never sink into each other
        label: 'puck',
      });

      const puck = {
        id: `${team}_${index}`,
        team, // 'white' (player) or 'black' (AI)
        body,
        radius: PUCK_RADIUS,
        previousY: pos.y,
        isHeld: false,
        trail: [],
      };

      body.puckRef = puck;
      return puck;
    };

    playerPositions.forEach((pos, idx) => {
      const p = createPuck(pos, 'white', idx);
      this.pucks.push(p);
      Composite.add(this.world, p.body);
    });

    aiPositions.forEach((pos, idx) => {
      const p = createPuck(pos, 'black', idx);
      this.pucks.push(p);
      Composite.add(this.world, p.body);
    });

    // Ensure initial placement has zero overlap
    this.resolvePuckOverlaps(4);
  }

  // Rigorous geometric overlap resolution & perimeter cushion enforcement
  // Guarantees pucks NEVER overlap each other or sink into walls under any velocity/wedging condition
  resolvePuckOverlaps(iterations = 4) {
    const { WIDTH, HEIGHT, BORDER_SIZE, DIVIDER_Y, DIVIDER_THICKNESS, GATE_WIDTH, PUCK_RADIUS } = BOARD_CONFIG;
    const minX = BORDER_SIZE + PUCK_RADIUS + 0.2;
    const maxX = WIDTH - BORDER_SIZE - PUCK_RADIUS - 0.2;
    const minY = BORDER_SIZE + PUCK_RADIUS + 0.2;
    const maxY = HEIGHT - BORDER_SIZE - PUCK_RADIUS - 0.2;

    const gateLeft = WIDTH / 2 - GATE_WIDTH / 2;
    const gateRight = WIDTH / 2 + GATE_WIDTH / 2;
    const capRadius = DIVIDER_THICKNESS / 2;
    const minPostDist = capRadius + PUCK_RADIUS + 0.2;
    const maxTopDividerY = DIVIDER_Y - capRadius - PUCK_RADIUS - 0.2;
    const minBottomDividerY = DIVIDER_Y + capRadius + PUCK_RADIUS + 0.2;

    const count = this.pucks.length;

    for (let iter = 0; iter < iterations; iter++) {
      // 1. Circle-to-Circle hard non-penetration constraint
      for (let i = 0; i < count; i++) {
        const puckA = this.pucks[i];
        const posA = puckA.body.position;

        for (let j = i + 1; j < count; j++) {
          const puckB = this.pucks[j];
          const posB = puckB.body.position;

          const dx = posB.x - posA.x;
          const dy = posB.y - posA.y;
          const distSq = dx * dx + dy * dy;
          const minDist = puckA.radius + puckB.radius + 0.4; // 32.4px minimum safe separation

          if (distSq < minDist * minDist) {
            const dist = Math.sqrt(distSq);
            const overlap = minDist - dist;
            let nx = 1;
            let ny = 0;
            if (dist > 0.0001) {
              nx = dx / dist;
              ny = dy / dist;
            } else {
              const angle = ((i + j) * 1.6180339887) % (Math.PI * 2);
              nx = Math.cos(angle);
              ny = Math.sin(angle);
            }

            // Distribute separation depending on held state
            let ratioA = 0.5;
            let ratioB = 0.5;
            if (puckA.isHeld) {
              ratioA = 0;
              ratioB = 1.0;
            } else if (puckB.isHeld) {
              ratioA = 1.0;
              ratioB = 0;
            }

            Matter.Body.setPosition(puckA.body, {
              x: posA.x - nx * overlap * ratioA,
              y: posA.y - ny * overlap * ratioA,
            });
            Matter.Body.setPosition(puckB.body, {
              x: posB.x + nx * overlap * ratioB,
              y: posB.y + ny * overlap * ratioB,
            });

            // Rebound velocity along contact normal
            const relVx = puckB.body.velocity.x - puckA.body.velocity.x;
            const relVy = puckB.body.velocity.y - puckA.body.velocity.y;
            const velAlongNormal = relVx * nx + relVy * ny;
            if (velAlongNormal < 0) {
              const impulse = -(1 + 0.85) * velAlongNormal * 0.5;
              if (!puckA.isHeld) {
                Matter.Body.setVelocity(puckA.body, {
                  x: puckA.body.velocity.x - nx * impulse,
                  y: puckA.body.velocity.y - ny * impulse,
                });
              }
              if (!puckB.isHeld) {
                Matter.Body.setVelocity(puckB.body, {
                  x: puckB.body.velocity.x + nx * impulse,
                  y: puckB.body.velocity.y + ny * impulse,
                });
              }
            }
          }
        }
      }

      // 2. Circle-to-Wall and Divider boundary clamp
      for (let i = 0; i < count; i++) {
        const puck = this.pucks[i];
        let px = puck.body.position.x;
        let py = puck.body.position.y;
        let modified = false;

        // Perimeter bounds
        if (px < minX) { px = minX; modified = true; if (puck.body.velocity.x < 0) puck.body.velocity.x = 0; }
        else if (px > maxX) { px = maxX; modified = true; if (puck.body.velocity.x > 0) puck.body.velocity.x = 0; }

        if (py < minY) { py = minY; modified = true; if (puck.body.velocity.y < 0) puck.body.velocity.y = 0; }
        else if (py > maxY) { py = maxY; modified = true; if (puck.body.velocity.y > 0) puck.body.velocity.y = 0; }

        // Divider barrier slabs (left and right of the passage gate)
        if (px < gateLeft) {
          if (py > maxTopDividerY && py < DIVIDER_Y) {
            py = maxTopDividerY;
            modified = true;
            if (puck.body.velocity.y > 0) puck.body.velocity.y = 0;
          } else if (py < minBottomDividerY && py >= DIVIDER_Y) {
            py = minBottomDividerY;
            modified = true;
            if (puck.body.velocity.y < 0) puck.body.velocity.y = 0;
          }
        } else if (px > gateRight) {
          if (py > maxTopDividerY && py < DIVIDER_Y) {
            py = maxTopDividerY;
            modified = true;
            if (puck.body.velocity.y > 0) puck.body.velocity.y = 0;
          } else if (py < minBottomDividerY && py >= DIVIDER_Y) {
            py = minBottomDividerY;
            modified = true;
            if (puck.body.velocity.y < 0) puck.body.velocity.y = 0;
          }
        }

        // Rounded post caps at gate threshold
        for (const postX of [gateLeft, gateRight]) {
          const dx = px - postX;
          const dy = py - DIVIDER_Y;
          const d = Math.hypot(dx, dy);
          if (d < minPostDist) {
            const overlap = minPostDist - d;
            const nx = dx / (d || 1);
            const ny = dy / (d || 1);
            px += nx * overlap;
            py += ny * overlap;
            modified = true;
          }
        }

        if (modified) {
          Matter.Body.setPosition(puck.body, { x: px, y: py });
        }
      }
    }
  }

  // Update physics with sub-stepping for smooth, continuous, anti-tunneling motion
  update(deltaMs = 16.66) {
    const { DIVIDER_Y, WIDTH, HEIGHT, BORDER_SIZE } = BOARD_CONFIG;

    const clampedDelta = Math.min(deltaMs, 33.33);
    const subSteps = 2;
    const subDelta = clampedDelta / subSteps;

    for (let s = 0; s < subSteps; s++) {
      Matter.Engine.update(this.engine, subDelta);
      this.resolvePuckOverlaps(3);
    }

    // Track crossing through center hole & bounds safeguard
    for (const puck of this.pucks) {
      const currentY = puck.body.position.y;
      const currentX = puck.body.position.x;
      const prevY = puck.previousY;

      // Check if crossing divider
      if (prevY >= DIVIDER_Y && currentY < DIVIDER_Y) {
        // Player side -> AI side
        soundManager.playGoal();
        if (this.callbacks.onGoalPass) {
          this.callbacks.onGoalPass(puck, 'player_to_ai');
        }
      } else if (prevY <= DIVIDER_Y && currentY > DIVIDER_Y) {
        // AI side -> Player side
        soundManager.playGoal();
        if (this.callbacks.onGoalPass) {
          this.callbacks.onGoalPass(puck, 'ai_to_player');
        }
      }

      puck.previousY = currentY;

      // Store velocity trail history for high-speed dynamic speed ribbon effect
      const speed = Math.hypot(puck.body.velocity.x, puck.body.velocity.y);
      if (speed > 1.2) {
        puck.trail.push({
          x: currentX,
          y: currentY,
          vx: puck.body.velocity.x,
          vy: puck.body.velocity.y,
          speed,
        });
        const maxTrail = Math.min(24, Math.max(6, Math.floor(speed * 1.8)));
        while (puck.trail.length > maxTrail) {
          puck.trail.shift();
        }
      } else if (puck.trail.length > 0) {
        puck.trail.shift();
      }

      // Extreme out-of-bounds safeguard (only if a puck glitched completely through walls outside canvas)
      if (currentX < 0 || currentX > WIDTH || currentY < 0 || currentY > HEIGHT) {
        const safeX = Math.max(BORDER_SIZE + puck.radius + 2, Math.min(WIDTH - BORDER_SIZE - puck.radius - 2, currentX));
        const safeY = Math.max(BORDER_SIZE + puck.radius + 2, Math.min(HEIGHT - BORDER_SIZE - puck.radius - 2, currentY));
        Matter.Body.setPosition(puck.body, { x: safeX, y: safeY });
        Matter.Body.setVelocity(puck.body, { x: 0, y: 0 });
      }
    }
  }

  // Check if all pucks are basically still (speed < threshold)
  arePucksAtRest(threshold = 0.55) {
    for (const p of this.pucks) {
      if (p.isHeld) return false;
      const speed = Math.hypot(p.body.velocity.x, p.body.velocity.y);
      if (speed > threshold) {
        return false;
      }
    }
    return true;
  }

  // Stop tiny residual jitter once settled and enforce non-penetration
  settlePucks() {
    this.resolvePuckOverlaps(6);

    for (const p of this.pucks) {
      if (!p.isHeld) {
        const speed = Math.hypot(p.body.velocity.x, p.body.velocity.y);
        if (speed < 0.6) {
          Matter.Body.setVelocity(p.body, { x: 0, y: 0 });
          Matter.Body.setAngularVelocity(p.body, 0);
        }
      }
    }

    this.resolvePuckOverlaps(4);
  }

  // Count player's remaining white pucks and AI's remaining black pucks to clear
  getPuckCounts() {
    const { DIVIDER_Y } = BOARD_CONFIG;
    // Player wins when ALL 5 white pucks are on opponent's side (white on player side === 0)
    const whiteOnPlayerSide = this.pucks.filter(
      (p) => p.team === 'white' && p.body.position.y > DIVIDER_Y
    ).length;

    // AI wins when ALL 5 black pucks are on player's side (black on AI side === 0)
    const blackOnAiSide = this.pucks.filter(
      (p) => p.team === 'black' && p.body.position.y < DIVIDER_Y
    ).length;

    return {
      playerCount: whiteOnPlayerSide,
      aiCount: blackOnAiSide,
    };
  }

  // Active player's own pucks on player's half (WHITE only)
  getPlayerPucks() {
    const { DIVIDER_Y } = BOARD_CONFIG;
    return this.pucks.filter(
      (p) => p.team === 'white' && p.body.position.y > DIVIDER_Y
    );
  }

  // AI's own pucks on AI's half (BLACK only)
  getAiPucks() {
    const { DIVIDER_Y } = BOARD_CONFIG;
    return this.pucks.filter(
      (p) => p.team === 'black' && p.body.position.y < DIVIDER_Y
    );
  }

  // Launch a puck with an impulse vector
  launchPuck(puck, impulse) {
    puck.isHeld = false;
    Matter.Body.setStatic(puck.body, false);
    Matter.Sleeping.set(puck.body, false);
    Matter.Body.setVelocity(puck.body, { x: impulse.x, y: impulse.y });
  }
}
