import Matter from 'matter-js';
import { BOARD_CONFIG } from './physics.js';
import { soundManager } from './audio.js';

export const LEVEL_CONFIGS = [
  {
    level: 1,
    name: 'Çaylak Can',
    title: '1. Bölüm: Acemi Çırak',
    desc: 'Oyunu yeni öğrenen sevimli acemi. Sık sık yan bantlara çarpar.',
    avatarKey: 'opponent_1',
    angleVariance: 0.28,
    powerVariance: 0.25,
    minPull: 42,
    maxPull: 58,
    bankShotChance: 0.05,
    thinkDelay: 750,
    badge: '🌱 Kolay',
  },
  {
    level: 2,
    name: 'Buz Prensi Deniz',
    title: '2. Bölüm: Ateş & Buz',
    desc: 'Hafifçe deliğe nişan alıyor ancak heyecandan hata yapabiliyor.',
    avatarKey: 'opponent_2',
    angleVariance: 0.22,
    powerVariance: 0.20,
    minPull: 45,
    maxPull: 62,
    bankShotChance: 0.1,
    thinkDelay: 700,
    badge: '🌱 Kolay',
  },
  {
    level: 3,
    name: 'Siber Samet',
    title: '3. Bölüm: Matrix Terminali',
    desc: 'Daha kontrollü atışlar yapıyor, deliği tutturma şansı %50 civarında.',
    avatarKey: 'opponent_3',
    angleVariance: 0.17,
    powerVariance: 0.18,
    minPull: 48,
    maxPull: 64,
    bankShotChance: 0.15,
    thinkDelay: 650,
    badge: '🌿 Dengeli',
  },
  {
    level: 4,
    name: 'Astronot Ali',
    title: '4. Bölüm: Kozmik Galaksi',
    desc: 'Yerçekimsiz atış tekniğiyle kararlı atışlar yapar.',
    avatarKey: 'opponent_4',
    angleVariance: 0.13,
    powerVariance: 0.15,
    minPull: 50,
    maxPull: 66,
    bankShotChance: 0.2,
    thinkDelay: 600,
    badge: '🌿 Dengeli',
  },
  {
    level: 5,
    name: 'Piksel Pamir',
    title: '5. Bölüm: Retro Arcade',
    desc: '8-Bit ustası! Taşlar çarpışınca sekmelere dikkat etmelisin.',
    avatarKey: 'opponent_5',
    angleVariance: 0.095,
    powerVariance: 0.12,
    minPull: 52,
    maxPull: 68,
    bankShotChance: 0.25,
    thinkDelay: 550,
    badge: '⚡ Orta',
  },
  {
    level: 6,
    name: 'Plazma Pelin',
    title: '6. Bölüm: Plazma Laboratuvarı',
    desc: 'Açıları iyi hesaplar, kenar taşlarını ortaya doğru sürer.',
    avatarKey: 'opponent_6',
    angleVariance: 0.075,
    powerVariance: 0.10,
    minPull: 54,
    maxPull: 70,
    bankShotChance: 0.3,
    thinkDelay: 500,
    badge: '⚡ Orta',
  },
  {
    level: 7,
    name: 'Ejder Mert',
    title: '7. Bölüm: Ejder Tapınağı',
    desc: 'Tek bant banko atışlarını hedefler, geçilmez değildir.',
    avatarKey: 'opponent_7',
    angleVariance: 0.055,
    powerVariance: 0.08,
    minPull: 56,
    maxPull: 70,
    bankShotChance: 0.35,
    thinkDelay: 480,
    badge: '🔥 Zor',
  },
  {
    level: 8,
    name: 'Çarkçı Rüstem',
    title: '8. Bölüm: Buhar & Çarklar',
    desc: 'Kuvvetli ve düzgün atışlar yapar, taşları itmeye çalışır.',
    avatarKey: 'opponent_8',
    angleVariance: 0.040,
    powerVariance: 0.07,
    minPull: 58,
    maxPull: 72,
    bankShotChance: 0.4,
    thinkDelay: 450,
    badge: '🔥 Zor',
  },
  {
    level: 9,
    name: 'Fırtına Kemal',
    title: '9. Bölüm: Şimşek & Fırtına',
    desc: 'Neredeyse her atışı deliğin yakınından geçer, akıllı oyna!',
    avatarKey: 'opponent_9',
    angleVariance: 0.026,
    powerVariance: 0.05,
    minPull: 60,
    maxPull: 72,
    bankShotChance: 0.45,
    thinkDelay: 420,
    badge: '👑 Usta',
  },
  {
    level: 10,
    name: 'Büyük Usta Kerem',
    title: '10. Bölüm: Efsanevi Final',
    desc: 'Büyük final! Şampiyon hızlıdır, ancak dikkatli bant atışlarıyla yenebilirsin!',
    avatarKey: 'opponent_10',
    angleVariance: 0.016,
    powerVariance: 0.04,
    minPull: 62,
    maxPull: 74,
    bankShotChance: 0.5,
    thinkDelay: 400,
    badge: '🏆 Şampiyon',
  },
];

export class AiOpponent {
  constructor(physics, renderer, callbacks = {}) {
    this.physics = physics;
    this.renderer = renderer;
    this.callbacks = callbacks;
    this.isActing = false;
    this.selectedPuck = null;
    this.step = 'idle'; // 'idle' | 'aim_sweep' | 'aim_locked' | 'fired'
    this.stepTime = 0;
    this.desiredPull = 50;
    this.targetAngle = 0;
    this.startAngle = 0;
    this.overshootAngle = 0;
    this.currentAngle = 0;
    this.currentPullDist = 18;
    this.sweepDuration = 1.1;
    this.lockDuration = 0.28;
    this.pullVector = { x: 0, y: 0 };
    this.config = LEVEL_CONFIGS[0];
  }

  setLevel(levelIndex) {
    const idx = Math.max(0, Math.min(LEVEL_CONFIGS.length - 1, levelIndex));
    this.config = LEVEL_CONFIGS[idx];
  }

  // Choose the best puck on AI side
  chooseBestPuck() {
    const aiPucks = this.physics.getAiPucks();
    if (aiPucks.length === 0) return null;

    const { WIDTH, DIVIDER_Y } = BOARD_CONFIG;
    const gateX = WIDTH / 2;
    const gateY = DIVIDER_Y;

    let bestPuck = null;
    let bestScore = -Infinity;

    aiPucks.forEach((puck) => {
      const pos = puck.body.position;
      const distToGate = Math.hypot(gateX - pos.x, gateY - pos.y);
      const angleToGate = Math.abs(Math.atan2(gateY - pos.y, gateX - pos.x) - Math.PI / 2);

      // Score: closer to center and clear direct line preferred
      let score = -distToGate * 0.7 - angleToGate * 40 + (Math.random() * 30 - 15);

      if (score > bestScore) {
        bestScore = score;
        bestPuck = puck;
      }
    });

    return bestPuck || aiPucks[0];
  }

  // Start AI turn
  startTurn(levelIndex) {
    this.setLevel(levelIndex);
    this.isActing = true;
    this.step = 'idle';
    this.stepTime = 0;

    const puck = this.chooseBestPuck();
    if (!puck) {
      this.isActing = false;
      return;
    }

    this.selectedPuck = puck;

    setTimeout(() => {
      if (!this.isActing) return;
      this.beginAiming();
    }, this.config.thinkDelay);
  }

  // Realistic human-like aiming:
  // Starts with an imperfect initial pull, sweeps & rotates the arrow towards the hole,
  // overshoots slightly, aligns with the gate, hesitates, and then releases!
  beginAiming() {
    const { WIDTH, DIVIDER_Y, BORDER_SIZE } = BOARD_CONFIG;
    const puck = this.selectedPuck;
    if (!puck) return;

    const puckX = puck.body.position.x;
    const puckY = puck.body.position.y;

    // 1. Target determination: Direct shot vs Bank shot
    let targetX = WIDTH / 2;
    let targetY = DIVIDER_Y;

    const useBank = Math.random() < this.config.bankShotChance;
    if (useBank) {
      const aimLeftWall = puckX < WIDTH / 2;
      const wallX = aimLeftWall ? BORDER_SIZE : WIDTH - BORDER_SIZE;
      targetX = 2 * wallX - WIDTH / 2;
      targetY = DIVIDER_Y;
    }

    // 2. Ideal target angle
    const idealAngle = Math.atan2(targetY - puckY, targetX - puckX);

    // 3. Final target angle with skill variance
    // Level 1 has higher variance (often hits barrier/side), higher levels are sharper
    const variance = (Math.random() - 0.5) * 2 * this.config.angleVariance;
    this.targetAngle = idealAngle + variance;

    // 4. Initial touch angle (human starts pulling ~20° to 45° off target)
    const sweepDir = Math.random() > 0.5 ? 1 : -1;
    const initialOffset = sweepDir * (0.35 + Math.random() * 0.45);
    this.startAngle = this.targetAngle + initialOffset;

    // 5. Overshoot angle (human sweeps past target by 3-6 degrees, then corrects back)
    this.overshootAngle = this.targetAngle - sweepDir * (0.06 + Math.random() * 0.08);

    // 6. Dynamic durations based on difficulty:
    // Beginners sweep slower and hesitate longer, experts are swift & decisive
    this.sweepDuration = 0.95 + Math.random() * 0.45; // ~1.1s rotation/alignment
    this.lockDuration = 0.22 + Math.random() * 0.18;  // ~0.3s locked pause

    // Desired pull tension
    this.desiredPull =
      this.config.minPull +
      Math.random() * (this.config.maxPull - this.config.minPull);

    this.currentAngle = this.startAngle;
    this.currentPullDist = 18; // starts with gentle touch
    this.step = 'aim_sweep';
    this.stepTime = 0;
    soundManager.playSlingStretch(0.4);
  }

  update(deltaMs) {
    if (!this.isActing || !this.selectedPuck) return;

    const deltaSec = deltaMs / 1000;
    this.stepTime += deltaSec;
    const puck = this.selectedPuck;

    if (this.step === 'aim_sweep') {
      const progress = Math.min(this.stepTime / this.sweepDuration, 1.0);

      // Phase 1 (0 to 65%): Sweep from startAngle past the target to overshootAngle
      // Phase 2 (65% to 100%): Correct back from overshootAngle and lock onto targetAngle
      if (progress < 0.65) {
        const p1 = progress / 0.65;
        const ease = Math.sin((p1 * Math.PI) / 2); // smooth ease-out sweep
        this.currentAngle = this.startAngle + (this.overshootAngle - this.startAngle) * ease;
        this.currentPullDist = 18 + (this.desiredPull * 0.85 - 18) * ease;
      } else {
        const p2 = (progress - 0.65) / 0.35;
        const ease = (1 - Math.cos(p2 * Math.PI)) / 2; // smooth S-curve correction
        this.currentAngle = this.overshootAngle + (this.targetAngle - this.overshootAngle) * ease;
        this.currentPullDist = this.desiredPull * 0.85 + (this.desiredPull * 0.15) * ease;
      }

      // Convert current angle and distance to pull vector (pull is opposite of shot vector)
      const pullX = -Math.cos(this.currentAngle) * this.currentPullDist;
      const pullY = -Math.sin(this.currentAngle) * this.currentPullDist;
      this.pullVector = { x: pullX, y: pullY };

      if (this.callbacks.onAiAiming) {
        this.callbacks.onAiAiming(puck, this.pullVector);
      }

      if (progress >= 1.0) {
        this.step = 'aim_locked';
        this.stepTime = 0;
      }
    } else if (this.step === 'aim_locked') {
      // Subtle human breathing micro-wobble during final lock
      const microWobble = Math.sin(this.stepTime * 18) * 0.006;
      const angle = this.targetAngle + microWobble;
      const pullX = -Math.cos(angle) * this.desiredPull;
      const pullY = -Math.sin(angle) * this.desiredPull;
      this.pullVector = { x: pullX, y: pullY };

      if (this.callbacks.onAiAiming) {
        this.callbacks.onAiAiming(puck, this.pullVector);
      }

      if (this.stepTime >= this.lockDuration) {
        this.releaseShot();
      }
    }
  }

  releaseShot() {
    const puck = this.selectedPuck;
    if (!puck) return;

    this.step = 'fired';
    this.isActing = false;

    // Calculate impulse from targetAngle and desiredPull
    const speed = (this.desiredPull / BOARD_CONFIG.MAX_PULL) * BOARD_CONFIG.MAX_IMPULSE;
    const impulse = {
      x: Math.cos(this.targetAngle) * speed,
      y: Math.sin(this.targetAngle) * speed,
    };

    soundManager.playSlingSnap();
    this.physics.launchPuck(puck, impulse);

    if (this.callbacks.onAiShotFired) {
      this.callbacks.onAiShotFired(puck);
    }

    this.selectedPuck = null;
    this.pullVector = { x: 0, y: 0 };
  }

  cancel() {
    this.isActing = false;
    this.selectedPuck = null;
    this.step = 'idle';
    this.pullVector = { x: 0, y: 0 };
  }

  easeOutQuad(t) {
    return t * (2 - t);
  }
}
