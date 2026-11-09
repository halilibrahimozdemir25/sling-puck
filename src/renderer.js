import { BOARD_CONFIG } from './physics.js';
import { getThemeForLevel } from './themes.js';

// Helper to convert hex / rgb / rgba strings to rgba with custom opacity
function colorWithAlpha(color, alpha = 1) {
  if (!color) return `rgba(46, 204, 113, ${alpha})`;
  if (color.startsWith('rgba(')) {
    return color.replace(/[\d\.]+\)$/, `${alpha})`);
  }
  if (color.startsWith('rgb(')) {
    return color.replace('rgb(', 'rgba(').replace(')', `, ${alpha})`);
  }
  if (color.startsWith('#')) {
    let hex = color.slice(1);
    if (hex.length === 3) {
      hex = hex.split('').map((c) => c + c).join('');
    }
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 0;
    const b = parseInt(hex.substring(4, 6), 16) || 0;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return color;
}

export class GameRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.cometParticles = [];
    this.pitchCanvas = null;
    this.cachedPitchW = 0;
    this.cachedPitchH = 0;
    this.cachedLevel = null;
  }

  // Spawn visual collision or goal sparkles
  addParticles(x, y, color = '#ffd700', count = 12) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 4.0;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 2 + Math.random() * 2.5,
        color,
        alpha: 1.0,
        decay: 0.025 + Math.random() * 0.03,
      });
    }
  }

  // Add high-speed velocity turf sparks / grass blade particles
  addCometSparks(x, y, vx, vy, color = '#2ecc71', count = 2) {
    for (let i = 0; i < count; i++) {
      const spread = (Math.random() - 0.5) * 1.4;
      const speed = 0.5 + Math.random() * 2.5;
      this.cometParticles.push({
        x: x + (Math.random() - 0.5) * 8,
        y: y + (Math.random() - 0.5) * 8,
        vx: -vx * 0.25 + Math.cos(spread) * speed,
        vy: -vy * 0.25 + Math.sin(spread) * speed,
        radius: 1.5 + Math.random() * 2.2,
        color,
        alpha: 0.95,
        decay: 0.035 + Math.random() * 0.035,
      });
    }
  }

  update(deltaSeconds) {
    // Update collision particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Update comet trail particles
    for (let i = this.cometParticles.length - 1; i >= 0; i--) {
      const p = this.cometParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;
      if (p.alpha <= 0) {
        this.cometParticles.splice(i, 1);
      }
    }
  }

  // Helper to draw text right-side up even when canvas is rotated 180° for guest view
  drawRotatedText(ctx, text, x, y, isFlipped = false) {
    if (isFlipped) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.PI);
      ctx.fillText(text, 0, 0);
      ctx.restore();
    } else {
      ctx.fillText(text, x, y);
    }
  }

  // Pre-render realistic tournament manicured football turf pitch with grass stripes and white lines
  buildPitchSurface(width, height, theme) {
    const cache = document.createElement('canvas');
    cache.width = width;
    cache.height = height;
    const cctx = cache.getContext('2d');

    const { BORDER_SIZE } = BOARD_CONFIG;
    const innerX = BORDER_SIZE;
    const innerY = BORDER_SIZE;
    const innerW = width - BORDER_SIZE * 2;
    const innerH = height - BORDER_SIZE * 2;
    const centerX = width / 2;
    const centerY = height / 2;

    const pitchInset = 8;
    const pitchX = innerX + pitchInset;
    const pitchY = innerY + pitchInset;
    const pitchW = innerW - pitchInset * 2;
    const pitchH = innerH - pitchInset * 2;

    const turfBase = theme?.pitch?.turfBase || '#13461b';
    const turfLight = theme?.pitch?.turfLight || 'rgba(28, 92, 38, 0.95)';
    const turfDark = theme?.pitch?.turfDark || 'rgba(18, 65, 25, 0.95)';
    const mowPattern = theme?.pitch?.mowPattern || 'horizontal';
    const stripeCount = theme?.pitch?.stripeCount || 12;
    const lineColor = theme?.pitch?.lineColor || 'rgba(255, 255, 255, 0.90)';
    const floodlightGlow = theme?.pitch?.floodlightGlow || 'rgba(255, 255, 255, 0.16)';

    // 1. Natural Base Turf Gradient
    const baseGrad = cctx.createLinearGradient(0, innerY, 0, innerY + innerH);
    baseGrad.addColorStop(0, turfBase);
    baseGrad.addColorStop(0.5, turfBase);
    baseGrad.addColorStop(1, turfBase);
    cctx.fillStyle = baseGrad;
    cctx.fillRect(innerX, innerY, innerW, innerH);

    // 2. Alternating Professional Lawn-Mowing Patterns
    if (mowPattern === 'checker') {
      // Checkerboard mowing pattern (e.g. Volcano / Magma pitch)
      const rows = stripeCount;
      const cols = Math.max(6, Math.round(stripeCount * 0.7));
      const cellW = innerW / cols;
      const cellH = innerH / rows;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const isEven = (r + c) % 2 === 0;
          cctx.fillStyle = isEven ? turfLight : turfDark;
          cctx.fillRect(innerX + c * cellW, innerY + r * cellH, cellW + 0.5, cellH + 0.5);

          // Subtle organic texture
          cctx.save();
          cctx.beginPath();
          cctx.rect(innerX + c * cellW, innerY + r * cellH, cellW, cellH);
          cctx.clip();
          cctx.strokeStyle = isEven ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.04)';
          cctx.lineWidth = 1;
          for (let x = innerX + c * cellW; x <= innerX + (c + 1) * cellW; x += 4) {
            cctx.beginPath();
            cctx.moveTo(x, innerY + r * cellH);
            cctx.lineTo(x + 1.2, innerY + (r + 1) * cellH);
            cctx.stroke();
          }
          cctx.restore();
        }
      }
    } else if (mowPattern === 'vertical') {
      // Vertical roller mowing pattern (e.g. Cyber Matrix)
      const stripeW = innerW / stripeCount;
      for (let col = 0; col < stripeCount; col++) {
        const sx = innerX + col * stripeW;
        const isEven = col % 2 === 0;

        cctx.fillStyle = isEven ? turfLight : turfDark;
        cctx.fillRect(sx, innerY, stripeW + 0.5, innerH);

        cctx.save();
        cctx.beginPath();
        cctx.rect(sx, innerY, stripeW, innerH);
        cctx.clip();
        cctx.strokeStyle = isEven ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.04)';
        cctx.lineWidth = 1;
        for (let y = innerY; y <= innerY + innerH; y += 4.5) {
          cctx.beginPath();
          cctx.moveTo(sx, y);
          cctx.lineTo(sx + stripeW, y + Math.sin(y * 11 + col) * 1.5);
          cctx.stroke();
        }
        cctx.restore();
      }
    } else {
      // Horizontal lawn-mowing stripes (Classic Stadiums)
      const stripeH = innerH / stripeCount;
      for (let i = 0; i < stripeCount; i++) {
        const sy = innerY + i * stripeH;
        const isEven = i % 2 === 0;

        cctx.fillStyle = isEven ? turfLight : turfDark;
        cctx.fillRect(innerX, sy, innerW, stripeH + 0.5);

        cctx.save();
        cctx.beginPath();
        cctx.rect(innerX, sy, innerW, stripeH);
        cctx.clip();
        cctx.strokeStyle = isEven ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.04)';
        cctx.lineWidth = 1;
        for (let x = innerX; x <= innerX + innerW; x += 3.5) {
          cctx.beginPath();
          cctx.moveTo(x, sy);
          cctx.lineTo(x + Math.sin(x * 17 + i) * 1.8, sy + stripeH);
          cctx.stroke();
        }
        cctx.restore();
      }
    }

    // 3. Dense Organic Turf Texture (Micro-fibers & earth speckles)
    cctx.save();
    for (let i = 0; i < 1100; i++) {
      const gx = innerX + Math.random() * innerW;
      const gy = innerY + Math.random() * innerH;
      const rVal = Math.random();
      if (rVal < 0.35) {
        cctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      } else if (rVal < 0.70) {
        cctx.fillStyle = 'rgba(8, 28, 12, 0.07)';
      } else {
        cctx.fillStyle = 'rgba(76, 175, 80, 0.06)';
      }
      cctx.fillRect(gx, gy, 1.2, 1.2);
    }
    cctx.restore();

    // 4. Stadium Floodlight Cones (4 corners + center glow)
    const flTL = cctx.createRadialGradient(innerX, innerY, 10, innerX + 120, innerY + 140, 260);
    flTL.addColorStop(0, floodlightGlow);
    flTL.addColorStop(1, 'rgba(0, 0, 0, 0)');
    cctx.fillStyle = flTL;
    cctx.fillRect(innerX, innerY, innerW, innerH);

    const flTR = cctx.createRadialGradient(innerX + innerW, innerY, 10, innerX + innerW - 120, innerY + 140, 260);
    flTR.addColorStop(0, floodlightGlow);
    flTR.addColorStop(1, 'rgba(0, 0, 0, 0)');
    cctx.fillStyle = flTR;
    cctx.fillRect(innerX, innerY, innerW, innerH);

    const flBL = cctx.createRadialGradient(innerX, innerY + innerH, 10, innerX + 120, innerY + innerH - 140, 260);
    flBL.addColorStop(0, floodlightGlow);
    flBL.addColorStop(1, 'rgba(0, 0, 0, 0)');
    cctx.fillStyle = flBL;
    cctx.fillRect(innerX, innerY, innerW, innerH);

    const flBR = cctx.createRadialGradient(innerX + innerW, innerY + innerH, 10, innerX + innerW - 120, innerY + innerH - 140, 260);
    flBR.addColorStop(0, floodlightGlow);
    flBR.addColorStop(1, 'rgba(0, 0, 0, 0)');
    cctx.fillStyle = flBR;
    cctx.fillRect(innerX, innerY, innerW, innerH);

    // Central spotlight wash
    const centralGlow = cctx.createRadialGradient(
      centerX, centerY, 30,
      centerX, centerY, innerH * 0.55
    );
    centralGlow.addColorStop(0, colorWithAlpha(floodlightGlow, 0.12));
    centralGlow.addColorStop(0.6, colorWithAlpha(floodlightGlow, 0.03));
    centralGlow.addColorStop(1, 'rgba(0, 10, 5, 0.40)');
    cctx.fillStyle = centralGlow;
    cctx.fillRect(innerX, innerY, innerW, innerH);

    // Perimeter Turf Cushioned Shadows
    const addShadow = (x, y, w, h, grad) => {
      cctx.fillStyle = grad;
      cctx.fillRect(x, y, w, h);
    };
    const topShadow = cctx.createLinearGradient(0, innerY, 0, innerY + 16);
    topShadow.addColorStop(0, 'rgba(0, 10, 4, 0.75)');
    topShadow.addColorStop(1, 'rgba(0, 10, 4, 0)');
    addShadow(innerX, innerY, innerW, 16, topShadow);

    const bottomShadow = cctx.createLinearGradient(0, innerY + innerH, 0, innerY + innerH - 16);
    bottomShadow.addColorStop(0, 'rgba(0, 10, 4, 0.75)');
    bottomShadow.addColorStop(1, 'rgba(0, 10, 4, 0)');
    addShadow(innerX, innerY + innerH - 16, innerW, 16, bottomShadow);

    const leftShadow = cctx.createLinearGradient(innerX, 0, innerX + 16, 0);
    leftShadow.addColorStop(0, 'rgba(0, 10, 4, 0.75)');
    leftShadow.addColorStop(1, 'rgba(0, 10, 4, 0)');
    addShadow(innerX, innerY, 16, innerH, leftShadow);

    const rightShadow = cctx.createLinearGradient(innerX + innerW, 0, innerX + innerW - 16, 0);
    rightShadow.addColorStop(0, 'rgba(0, 10, 4, 0.75)');
    rightShadow.addColorStop(1, 'rgba(0, 10, 4, 0)');
    addShadow(innerX + innerW - 16, innerY, 16, innerH, rightShadow);

    // 5. Crisp Football Pitch Lines
    cctx.save();
    cctx.strokeStyle = lineColor;
    cctx.lineWidth = 2.4;
    cctx.lineCap = 'round';
    cctx.lineJoin = 'round';
    cctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
    cctx.shadowBlur = 1.5;

    // A. Outer Touchlines & Goal Lines
    cctx.strokeRect(pitchX, pitchY, pitchW, pitchH);

    // B. Halfway Line
    cctx.beginPath();
    cctx.moveTo(pitchX, centerY);
    cctx.lineTo(pitchX + pitchW, centerY);
    cctx.stroke();

    // C. Center Circle & Center Spot
    cctx.beginPath();
    cctx.arc(centerX, centerY, 52, 0, Math.PI * 2);
    cctx.stroke();

    cctx.beginPath();
    cctx.arc(centerX, centerY, 3.6, 0, Math.PI * 2);
    cctx.fillStyle = lineColor;
    cctx.fill();

    // D. Penalty Areas (Top & Bottom Ceza Sahaları)
    const penW = 190;
    const penH = 88;
    const sixW = 96;
    const sixH = 32;

    // Top Penalty Area (Opponent Box)
    cctx.strokeRect(centerX - penW / 2, pitchY, penW, penH);
    cctx.strokeRect(centerX - sixW / 2, pitchY, sixW, sixH);
    cctx.beginPath();
    cctx.arc(centerX, pitchY + 58, 3, 0, Math.PI * 2);
    cctx.fillStyle = lineColor;
    cctx.fill();

    // Top Penalty Arc
    cctx.save();
    cctx.beginPath();
    cctx.rect(centerX - penW / 2 - 10, pitchY + penH, penW + 20, 50);
    cctx.clip();
    cctx.beginPath();
    cctx.arc(centerX, pitchY + 58, 34, 0, Math.PI * 2);
    cctx.stroke();
    cctx.restore();

    // Bottom Penalty Area (Player Box)
    cctx.strokeRect(centerX - penW / 2, pitchY + pitchH - penH, penW, penH);
    cctx.strokeRect(centerX - sixW / 2, pitchY + pitchH - sixH, sixW, sixH);
    cctx.beginPath();
    cctx.arc(centerX, pitchY + pitchH - 58, 3, 0, Math.PI * 2);
    cctx.fillStyle = lineColor;
    cctx.fill();

    // Bottom Penalty Arc
    cctx.save();
    cctx.beginPath();
    cctx.rect(centerX - penW / 2 - 10, pitchY + pitchH - penH - 50, penW + 20, 50);
    cctx.clip();
    cctx.beginPath();
    cctx.arc(centerX, pitchY + pitchH - 58, 34, 0, Math.PI * 2);
    cctx.stroke();
    cctx.restore();

    // E. 4 Corner Arcs
    const cr = 14;
    cctx.beginPath(); cctx.arc(pitchX, pitchY, cr, 0, Math.PI / 2); cctx.stroke();
    cctx.beginPath(); cctx.arc(pitchX + pitchW, pitchY, cr, Math.PI / 2, Math.PI); cctx.stroke();
    cctx.beginPath(); cctx.arc(pitchX, pitchY + pitchH, cr, (Math.PI * 3) / 2, Math.PI * 2); cctx.stroke();
    cctx.beginPath(); cctx.arc(pitchX + pitchW, pitchY + pitchH, cr, Math.PI, (Math.PI * 3) / 2); cctx.stroke();

    cctx.restore();

    return cache;
  }

  render(gameState) {
    const { ctx } = this;
    const { WIDTH, HEIGHT } = BOARD_CONFIG;
    const currentLevel = gameState.level || 1;
    const theme = getThemeForLevel(currentLevel);
    const isFlipped = Boolean(gameState.isFlipped);

    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    ctx.save();
    if (isFlipped) {
      ctx.translate(WIDTH, HEIGHT);
      ctx.rotate(Math.PI);
    }

    // 1. Draw outer stadium night backdrop
    this.drawTableBackdrop(ctx, WIDTH, HEIGHT, theme);

    // 2. Draw Football Pitch Turf Surface (cached offscreen canvas, invalidated per level or dimensions)
    if (!this.pitchCanvas || this.cachedPitchW !== WIDTH || this.cachedPitchH !== HEIGHT || this.cachedLevel !== currentLevel) {
      this.pitchCanvas = this.buildPitchSurface(WIDTH, HEIGHT, theme);
      this.cachedPitchW = WIDTH;
      this.cachedPitchH = HEIGHT;
      this.cachedLevel = currentLevel;
    }
    ctx.drawImage(this.pitchCanvas, 0, 0);
    ctx.drawImage(this.pitchCanvas, 0, 0);

    // 3. Draw Center Stadium Divider with passage tunnel & floodlights
    this.drawCenterDivider(ctx, WIDTH, HEIGHT, theme, isFlipped);

    // 4. Draw Stadium Perimeter Frame / LED Ad Boards
    this.drawPerimeterFrame(ctx, WIDTH, HEIGHT, theme);

    // 5. Draw High-Speed Velocity Slipstream Trail (Efektif Hız Şeridi)
    this.drawPuckTrails(ctx, gameState, theme);

    // 6. Draw Trajectory Aim Guide (if local player is aiming)
    if (gameState.aiming && gameState.aimPuck && gameState.aimPull) {
      this.drawAimGuide(ctx, gameState.aimPuck, gameState.aimPull, gameState.shooterRole || 'player', theme, isFlipped);
    }

    // 7. Draw Remote Opponent Aim Guide (in online mode)
    if (gameState.remoteAiming && gameState.remoteAimPuck && gameState.remotePull) {
      this.drawAimGuide(ctx, gameState.remoteAimPuck, gameState.remotePull, gameState.remoteShooterRole || 'player2', theme, isFlipped);
    }

    // 8. Draw AI Aim Guide (in campaign mode)
    if (gameState.aiAiming && gameState.aiPuck && gameState.aiPull) {
      this.drawAimGuide(ctx, gameState.aiPuck, gameState.aiPull, 'ai', theme, isFlipped);
    }

    // 9. Draw 3D Soccer Match Balls (Football themed discs)
    this.drawPucks(ctx, gameState, theme, isFlipped);

    // 10. Draw Particles
    this.drawParticles(ctx);

    ctx.restore();
  }

  // Draw background stadium night atmosphere
  drawTableBackdrop(ctx, width, height, theme) {
    const bgTop = theme?.pitch?.bgTop || '#06170d';
    const bgBottom = theme?.pitch?.bgBottom || '#010503';
    const bgGrad = ctx.createRadialGradient(
      width / 2,
      height / 2,
      60,
      width / 2,
      height / 2,
      height * 0.82
    );
    bgGrad.addColorStop(0, bgTop);
    bgGrad.addColorStop(0.55, bgTop);
    bgGrad.addColorStop(1, bgBottom);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);
  }

  // Draw Center Stadium Divider with passage gate, LED boards, and guide arrows
  drawCenterDivider(ctx, width, height, theme, isFlipped = false) {
    const {
      BORDER_SIZE,
      DIVIDER_Y,
      DIVIDER_THICKNESS,
      GATE_WIDTH,
    } = BOARD_CONFIG;

    const gateLeft = width / 2 - GATE_WIDTH / 2;
    const gateRight = width / 2 + GATE_WIDTH / 2;
    const halfThick = DIVIDER_THICKNESS / 2;
    const topY = DIVIDER_Y - halfThick;
    const now = Date.now();

    ctx.save();

    // 1. Stadium Barrier Casing (Themed Metallic with turf padding)
    const bGrad = theme?.pitch?.barrierGrad || ['#2c3e50', '#1a252f', '#0d1318'];
    const barrierGrad = ctx.createLinearGradient(0, topY, 0, topY + DIVIDER_THICKNESS);
    barrierGrad.addColorStop(0, bGrad[0]);
    barrierGrad.addColorStop(0.4, bGrad[1]);
    barrierGrad.addColorStop(1, bGrad[2]);

    ctx.fillStyle = barrierGrad;

    // Left barrier
    ctx.fillRect(BORDER_SIZE, topY, gateLeft - BORDER_SIZE, DIVIDER_THICKNESS);
    // Right barrier
    ctx.fillRect(gateRight, topY, width - BORDER_SIZE - gateRight, DIVIDER_THICKNESS);

    const accent = theme?.pitch?.barrierAccent || '#2ecc71';

    // LED Billboard glow strip along top edge
    ctx.strokeStyle = accent;
    ctx.lineWidth = 1.5;
    ctx.shadowColor = accent;
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.moveTo(BORDER_SIZE, topY);
    ctx.lineTo(gateLeft, topY);
    ctx.moveTo(gateRight, topY);
    ctx.lineTo(width - BORDER_SIZE, topY);
    ctx.stroke();

    // 2. LED Matrix Ad Text on the barrier
    const bText = theme?.pitch?.barrierText || ['⚽ SLING PUCK ⚽', '★ CHAMPIONS ★'];
    ctx.font = 'bold 8.5px "Inter", sans-serif';
    ctx.fillStyle = accent;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = accent;
    ctx.shadowBlur = 4;
    const leftMidX = (BORDER_SIZE + gateLeft) / 2;
    const rightMidX = (gateRight + width - BORDER_SIZE) / 2;
    this.drawRotatedText(ctx, bText[0], leftMidX, DIVIDER_Y, isFlipped);
    this.drawRotatedText(ctx, bText[1], rightMidX, DIVIDER_Y, isFlipped);

    // 3. Rounded Gate Tunnel Posts
    const drawGatePost = (cx) => {
      ctx.beginPath();
      ctx.arc(cx, DIVIDER_Y, halfThick, 0, Math.PI * 2);
      ctx.fillStyle = '#1a252f';
      ctx.fill();
      ctx.strokeStyle = '#f1c40f'; // Golden metallic post cap
      ctx.lineWidth = 2;
      ctx.stroke();

      // Floodlight diode at post center
      ctx.beginPath();
      ctx.arc(cx, DIVIDER_Y, 3, 0, Math.PI * 2);
      ctx.fillStyle = accent;
      ctx.shadowColor = accent;
      ctx.shadowBlur = 8;
      ctx.fill();
    };

    drawGatePost(gateLeft);
    drawGatePost(gateRight);

    // 4. Glowing Gate Threshold Line
    const pulse = 0.5 + 0.5 * Math.sin(now * 0.007);
    ctx.strokeStyle = colorWithAlpha(accent, 0.4 + 0.4 * pulse);
    ctx.lineWidth = 2.4;
    ctx.setLineDash([4, 5]);
    ctx.beginPath();
    ctx.moveTo(gateLeft + 6, DIVIDER_Y);
    ctx.lineTo(gateRight - 6, DIVIDER_Y);
    ctx.stroke();
    ctx.setLineDash([]);

    // 5. Red directional guidance arrows pointing into center passage hole
    // Top arrow pointing down to gate
    ctx.fillStyle = '#e74c3c';
    ctx.shadowColor = '#e74c3c';
    ctx.shadowBlur = 5;
    ctx.beginPath();
    ctx.moveTo(width / 2, DIVIDER_Y - 12);
    ctx.lineTo(width / 2 - 7, DIVIDER_Y - 23);
    ctx.lineTo(width / 2 + 7, DIVIDER_Y - 23);
    ctx.closePath();
    ctx.fill();

    // Bottom arrow pointing up to gate
    ctx.beginPath();
    ctx.moveTo(width / 2, DIVIDER_Y + 12);
    ctx.lineTo(width / 2 - 7, DIVIDER_Y + 23);
    ctx.lineTo(width / 2 + 7, DIVIDER_Y + 23);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  // Draw 3D Stadium Perimeter Frame with turf-side cushions and floodlight brackets
  drawPerimeterFrame(ctx, width, height, theme) {
    const { BORDER_SIZE } = BOARD_CONFIG;

    ctx.save();

    // Stadium outer rim gradient (Dark Charcoal / Carbon)
    const frameGrad = ctx.createLinearGradient(0, 0, width, height);
    frameGrad.addColorStop(0, '#1e272e');
    frameGrad.addColorStop(0.5, '#141c22');
    frameGrad.addColorStop(1, '#0b0f13');

    ctx.lineWidth = BORDER_SIZE;
    ctx.strokeStyle = frameGrad;
    ctx.strokeRect(
      BORDER_SIZE / 2,
      BORDER_SIZE / 2,
      width - BORDER_SIZE,
      height - BORDER_SIZE
    );

    // Inner turf cushion line with stadium neon accent
    const frameColor = theme?.pitch?.frameColor || '#2ecc71';
    ctx.strokeStyle = frameColor;
    ctx.lineWidth = 1.8;
    ctx.shadowColor = frameColor;
    ctx.shadowBlur = 6;
    ctx.strokeRect(BORDER_SIZE, BORDER_SIZE, width - BORDER_SIZE * 2, height - BORDER_SIZE * 2);

    // Corner floodlight mounting brackets
    const drawCornerBracket = (cx, cy, rot) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      ctx.fillStyle = '#f1c40f'; // Gold corner hardware
      ctx.fillRect(0, 0, 16, 4.5);
      ctx.fillRect(0, 0, 4.5, 16);
      ctx.restore();
    };

    drawCornerBracket(3, 3, 0);
    drawCornerBracket(width - 3, 3, Math.PI / 2);
    drawCornerBracket(width - 3, height - 3, Math.PI);
    drawCornerBracket(3, height - 3, (Math.PI * 3) / 2);

    ctx.restore();
  }

  // Draw High-Speed Velocity Slipstream Trail (Efektif Hız Şeridi & Parçacıklar)
  drawPuckTrails(ctx, gameState, theme) {
    const { pucks } = gameState.physics;

    pucks.forEach((puck) => {
      const trail = puck.trail;
      if (!trail || trail.length < 2) return;

      const currentSpeed = Math.hypot(puck.body.velocity.x, puck.body.velocity.y);
      if (currentSpeed < 1.4) return;

      const speedFactor = Math.min(currentSpeed / 22, 1.0);
      const isPlayer = puck.team === 'white';

      // Team speed trail colors from level theme
      const pTrail = theme?.playerTrail || { ribbonColor: '#00ffc8', sparkColor: '#2ecc71', coreColor: '#ffffff' };
      const oTrail = theme?.opponentTrail || { ribbonColor: '#ff4757', sparkColor: '#ffa502', coreColor: '#ffffff' };
      const ribbonColor = isPlayer ? pTrail.ribbonColor : oTrail.ribbonColor;
      const sparkColor = isPlayer ? pTrail.sparkColor : oTrail.sparkColor;
      const coreColor = isPlayer ? (pTrail.coreColor || '#ffffff') : (oTrail.coreColor || '#ffffff');

      ctx.save();

      // 1. Aerodynamic Tapered Slipstream Ribbon
      for (let i = 0; i < trail.length - 1; i++) {
        const p1 = trail[i];
        const p2 = trail[i + 1];
        const frac = (i + 1) / trail.length;

        const ribWidth = puck.radius * (0.35 + 0.95 * frac) * (0.65 + 0.35 * speedFactor);
        const alpha = Math.min(0.95, frac * (0.3 + 0.7 * speedFactor));

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = colorWithAlpha(ribbonColor, alpha * 0.75);
        ctx.lineWidth = ribWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = ribbonColor;
        ctx.shadowBlur = 10 * speedFactor;
        ctx.stroke();

        // 2. White-hot energy core at high speeds
        if (speedFactor > 0.35) {
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = colorWithAlpha(coreColor, alpha * 0.9);
          ctx.lineWidth = ribWidth * 0.38;
          ctx.stroke();
        }
      }

      // 3. Parallel Laser Speed Lines (Rüzgar çizgileri / Flank Streaks)
      if (speedFactor > 0.45 && trail.length >= 4) {
        const latest = trail[trail.length - 1];
        const past = trail[Math.max(0, trail.length - 6)];
        const dirAngle = Math.atan2(latest.y - past.y, latest.x - past.x);
        const perpX = Math.cos(dirAngle + Math.PI / 2) * (puck.radius * 0.85);
        const perpY = Math.sin(dirAngle + Math.PI / 2) * (puck.radius * 0.85);

        ctx.strokeStyle = colorWithAlpha(ribbonColor, 0.65 * speedFactor);
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 4]);

        // Left flank streak
        ctx.beginPath();
        ctx.moveTo(past.x + perpX, past.y + perpY);
        ctx.lineTo(latest.x + perpX, latest.y + perpY);
        ctx.stroke();

        // Right flank streak
        ctx.beginPath();
        ctx.moveTo(past.x - perpX, past.y - perpY);
        ctx.lineTo(latest.x - perpX, latest.y - perpY);
        ctx.stroke();

        ctx.setLineDash([]);
      }

      // 4. Kicked-up turf particles & glowing speed sparks
      if (currentSpeed > 4.5 && Math.random() < 0.65) {
        this.addCometSparks(
          puck.body.position.x,
          puck.body.position.y,
          puck.body.velocity.x,
          puck.body.velocity.y,
          sparkColor,
          Math.floor(speedFactor * 3) + 1
        );
      }

      ctx.restore();
    });

    // Draw active comet spark particles
    this.cometParticles.forEach((sp) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, sp.radius, 0, Math.PI * 2);
      ctx.fillStyle = sp.color;
      ctx.globalAlpha = sp.alpha;
      ctx.shadowBlur = 6;
      ctx.shadowColor = sp.color;
      ctx.fill();
      ctx.restore();
    });
  }

  // Draw enhanced slingshot aiming guide with multi-surface trajectory, wall ricochets, and FULL BACK-WALL REBOUND PREDICTION
  // (Arka duvardan seken topun nereye gideceği de net olarak hesaplanıp gösterilir)
  drawAimGuide(ctx, puck, pull, shooter = 'player', theme, isFlipped = false) {
    const {
      WIDTH,
      HEIGHT,
      BORDER_SIZE,
      DIVIDER_Y,
      GATE_WIDTH,
      MAX_PULL,
      PUCK_RADIUS,
    } = BOARD_CONFIG;

    const pullDist = Math.hypot(pull.x, pull.y);
    if (pullDist < 14) return; // In cancel zone, draw nothing

    // Shooting direction is opposite of pull direction
    const dirX = -pull.x / pullDist;
    const dirY = -pull.y / pullDist;

    const startX = puck.body.position.x;
    const startY = puck.body.position.y;

    const now = Date.now();
    ctx.save();

    // Trajectory Boundaries
    const minX = BORDER_SIZE + PUCK_RADIUS;
    const maxX = WIDTH - BORDER_SIZE - PUCK_RADIUS;
    const bottomWallY = HEIGHT - BORDER_SIZE - PUCK_RADIUS;
    const topWallY = BORDER_SIZE + PUCK_RADIUS;
    const gateLeft = WIDTH / 2 - GATE_WIDTH / 2;
    const gateRight = WIDTH / 2 + GATE_WIDTH / 2;

    // Laser drawing helper with animated flow dots
    const drawLaser = (x1, y1, x2, y2, color, drawBeads = true, isDashed = false) => {
      ctx.save();
      ctx.shadowBlur = 7;
      ctx.shadowColor = color;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.4;
      if (isDashed) ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.setLineDash([]);

      if (drawBeads) {
        const dist = Math.hypot(x2 - x1, y2 - y1);
        if (dist > 8) {
          const dotSpacing = 18;
          const animOffset = (now * 0.04) % dotSpacing;
          const count = Math.floor(dist / dotSpacing);
          const dX = (x2 - x1) / dist;
          const dY = (y2 - y1) / dist;
          ctx.fillStyle = '#ffffff';
          for (let i = 1; i < count; i++) {
            const cd = i * dotSpacing + animOffset;
            if (cd < dist - 6) {
              ctx.beginPath();
              ctx.arc(x1 + dX * cd, y1 + dY * cd, 2.4, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      }
      ctx.restore();
    };

    const drawGhostPuck = (x, y, color) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, PUCK_RADIUS, 0, Math.PI * 2);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.8;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.fillStyle = colorWithAlpha(color, 0.14);
      ctx.fill();
      ctx.restore();
    };

    const drawContactRipple = (x, y, color) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.restore();
    };

    // Calculate time to side walls
    let tSide = Infinity;
    let sideWallX = 0;
    if (dirX < -0.0001) {
      tSide = (minX - startX) / dirX;
      sideWallX = minX;
    } else if (dirX > 0.0001) {
      tSide = (maxX - startX) / dirX;
      sideWallX = maxX;
    }

    // Calculate time to horizontal barrier (divider or back wall)
    let tHoriz = Infinity;
    let horizType = 'none';

    if (shooter === 'player') {
      if (dirY < -0.0001) {
        // Aiming forward towards divider
        tHoriz = (DIVIDER_Y - startY) / dirY;
        horizType = 'divider';
      } else if (dirY > 0.0001) {
        // Aiming backward towards bottom wall!
        tHoriz = (bottomWallY - startY) / dirY;
        horizType = 'bottom_wall';
      }
    } else {
      // AI or player2
      if (dirY > 0.0001) {
        tHoriz = (DIVIDER_Y - startY) / dirY;
        horizType = 'divider';
      } else if (dirY < -0.0001) {
        tHoriz = (topWallY - startY) / dirY;
        horizType = 'top_wall';
      }
    }

    // Determine first hit
    let firstHitType;
    let hitX, hitY;

    if (tSide < tHoriz && tSide > 0) {
      firstHitType = 'side_wall';
      hitX = sideWallX;
      hitY = startY + dirY * tSide;
    } else if (tHoriz > 0 && tHoriz < Infinity) {
      hitX = startX + dirX * tHoriz;
      if (horizType === 'divider') {
        hitY = DIVIDER_Y;
        if (hitX >= gateLeft + 4 && hitX <= gateRight - 4) {
          firstHitType = 'gate_pass';
        } else {
          firstHitType = 'divider_hit';
        }
      } else if (horizType === 'bottom_wall') {
        hitY = bottomWallY;
        firstHitType = 'bottom_wall';
      } else {
        hitY = topWallY;
        firstHitType = 'top_wall';
      }
    } else {
      hitX = startX + dirX * 150;
      hitY = startY + dirY * 150;
      firstHitType = 'none';
    }

    const isDirectPass = firstHitType === 'gate_pass';

    // Bank shot off side wall check heading towards center
    let bouncePasses = false;
    let bounceEndX = 0;

    if (firstHitType === 'side_wall') {
      const bounceDirX = -dirX;
      const bounceDirY = dirY;
      const headingToCenter = shooter === 'player' ? bounceDirY < 0 : bounceDirY > 0;
      if (headingToCenter) {
        const tDivider2 = (DIVIDER_Y - hitY) / bounceDirY;
        bounceEndX = hitX + bounceDirX * tDivider2;
        bouncePasses = bounceEndX >= gateLeft + 4 && bounceEndX <= gateRight - 4;
      }
    }

    const isAlignedWithHole = isDirectPass || bouncePasses;
    const primaryColor = isAlignedWithHole
      ? '#2ecc71' // Brilliant emerald when aiming directly into gate
      : '#f39c12'; // Warm football gold/amber when aiming at cushions or walls

    // Collision Corridor (subtle swath showing ball clearance width)
    ctx.save();
    ctx.beginPath();
    const swathNormX = -dirY * PUCK_RADIUS;
    const swathNormY = dirX * PUCK_RADIUS;
    ctx.moveTo(startX + swathNormX, startY + swathNormY);
    ctx.lineTo(hitX + swathNormX, hitY + swathNormY);
    ctx.lineTo(hitX - swathNormX, hitY - swathNormY);
    ctx.lineTo(startX - swathNormX, startY - swathNormY);
    ctx.closePath();
    ctx.fillStyle = isAlignedWithHole ? 'rgba(46, 204, 113, 0.12)' : 'rgba(243, 156, 18, 0.06)';
    ctx.fill();
    ctx.restore();

    // Primary Trajectory Laser Line
    drawLaser(startX, startY, hitX, hitY, primaryColor, true);
    drawGhostPuck(hitX, hitY, primaryColor);

    // =========================================================
    // MULTI-SURFACE REBOUND CALCULATIONS (ARKA DUVAR & YAN BANTLAR)
    // =========================================================

    // CASE 1: DIRECT BACK WALL HIT (Arka duvara doğrudan atış -> Arka duvardan sahaya sekme)
    if (firstHitType === 'bottom_wall' || firstHitType === 'top_wall') {
      const backWallY = firstHitType === 'bottom_wall' ? bottomWallY : topWallY;
      const rebDirX = dirX;
      const rebDirY = -dirY; // Reflects back into court!

      drawContactRipple(hitX, backWallY, '#f39c12');

      // Calculate where the back-wall rebound goes:
      // Can hit left/right side wall OR center divider
      let tSide2 = Infinity;
      if (rebDirX < -0.001) tSide2 = (minX - hitX) / rebDirX;
      else if (rebDirX > 0.001) tSide2 = (maxX - hitX) / rebDirX;

      const tDiv = (DIVIDER_Y - backWallY) / rebDirY;
      const tReb = Math.min(tSide2 > 0 ? tSide2 : Infinity, tDiv > 0 ? tDiv : Infinity);

      const rebEndX = hitX + rebDirX * tReb;
      const rebEndY = backWallY + rebDirY * tReb;

      // Check if back-wall rebound goes straight through the center gate!
      const rebPassesGate =
        Math.abs(rebEndY - DIVIDER_Y) < 4 &&
        rebEndX >= gateLeft + 4 &&
        rebEndX <= gateRight - 4;

      const backBounceColor = rebPassesGate ? '#2ecc71' : '#f39c12';

      drawLaser(hitX, backWallY, rebEndX, rebEndY, backBounceColor, true);
      drawGhostPuck(rebEndX, rebEndY, backBounceColor);

      if (rebPassesGate) {
        this.drawHoleTarget(ctx, rebEndX, DIVIDER_Y);
        // Continue ray through gate into opponent's half!
        const oppBack = shooter === 'player' ? topWallY : bottomWallY;
        const tOppBack = (oppBack - DIVIDER_Y) / rebDirY;
        const oppEndX = rebEndX + rebDirX * tOppBack;
        drawLaser(rebEndX, DIVIDER_Y, oppEndX, oppBack, '#2ecc71', true, true);
        drawGhostPuck(oppEndX, oppBack, '#2ecc71');
      } else if (tSide2 < tDiv) {
        // Rebound from back wall hits a side wall -> 3rd reflection off side wall towards divider!
        const reb2DirX = -rebDirX;
        const reb2DirY = rebDirY;
        const tDiv3 = (DIVIDER_Y - rebEndY) / reb2DirY;
        const reb3EndX = rebEndX + reb2DirX * tDiv3;
        const bankRebPasses = reb3EndX >= gateLeft + 4 && reb3EndX <= gateRight - 4;
        const c3 = bankRebPasses ? '#2ecc71' : '#f39c12';
        drawContactRipple(rebEndX, rebEndY, c3);
        drawLaser(rebEndX, rebEndY, reb3EndX, DIVIDER_Y, c3, true);
        drawGhostPuck(reb3EndX, DIVIDER_Y, c3);
        if (bankRebPasses) {
          this.drawHoleTarget(ctx, reb3EndX, DIVIDER_Y);
        }
      }
    }

    // CASE 2: SIDE WALL HIT (Yan duvardan sekme)
    else if (firstHitType === 'side_wall') {
      const bounceDirX = -dirX;
      const bounceDirY = dirY;

      drawContactRipple(hitX, hitY, primaryColor);

      // Sub-case 2A: Ricochet heading towards center divider (forward bank shot)
      if (shooter === 'player' ? bounceDirY < 0 : bounceDirY > 0) {
        const bounceColor = bouncePasses ? '#2ecc71' : '#f39c12';
        drawLaser(hitX, hitY, bounceEndX, DIVIDER_Y, bounceColor, true);
        drawGhostPuck(bounceEndX, DIVIDER_Y, bounceColor);

        if (bouncePasses) {
          this.drawHoleTarget(ctx, bounceEndX, DIVIDER_Y);
          const oppBack = shooter === 'player' ? topWallY : bottomWallY;
          const tOppBack = (oppBack - DIVIDER_Y) / bounceDirY;
          const oppEndX = bounceEndX + bounceDirX * tOppBack;
          drawLaser(bounceEndX, DIVIDER_Y, oppEndX, oppBack, '#2ecc71', true, true);
          drawGhostPuck(oppEndX, oppBack, '#2ecc71');
        }
      }
      // Sub-case 2B: Ricochet heading towards BACK WALL (Arka duvara doğru yan bant vuruşu)
      else {
        const targetBackWall = shooter === 'player' ? bottomWallY : topWallY;
        const tBackWall = (targetBackWall - hitY) / bounceDirY;
        const bounceEndX2 = hitX + bounceDirX * tBackWall;
        const bounceEndY2 = targetBackWall;

        // 1st reflection: Side wall -> Back wall
        drawLaser(hitX, hitY, bounceEndX2, bounceEndY2, '#f39c12', true);
        drawGhostPuck(bounceEndX2, bounceEndY2, '#f39c12');
        drawContactRipple(bounceEndX2, bounceEndY2, '#f39c12');

        // 2nd reflection: Rebound OFF BACK WALL upwards into court!
        const reb3DirX = bounceDirX;
        const reb3DirY = -bounceDirY; // Bounces forward from back wall!

        let tWall4 = Infinity;
        if (reb3DirX < -0.001) tWall4 = (minX - bounceEndX2) / reb3DirX;
        else if (reb3DirX > 0.001) tWall4 = (maxX - bounceEndX2) / reb3DirX;

        const tDividerUp = (DIVIDER_Y - bounceEndY2) / reb3DirY;
        const tReb4 = Math.min(tWall4 > 0 ? tWall4 : Infinity, tDividerUp > 0 ? tDividerUp : Infinity);
        const reb3EndX = bounceEndX2 + reb3DirX * tReb4;
        const reb3EndY = bounceEndY2 + reb3DirY * tReb4;

        const passesGateFromBack =
          Math.abs(reb3EndY - DIVIDER_Y) < 4 &&
          reb3EndX >= gateLeft + 4 &&
          reb3EndX <= gateRight - 4;

        const c4 = passesGateFromBack ? '#2ecc71' : '#f39c12';

        drawLaser(bounceEndX2, bounceEndY2, reb3EndX, reb3EndY, c4, true);
        drawGhostPuck(reb3EndX, reb3EndY, c4);

        if (passesGateFromBack) {
          this.drawHoleTarget(ctx, reb3EndX, DIVIDER_Y);
          const oppBack = shooter === 'player' ? topWallY : bottomWallY;
          const tOppBack2 = (oppBack - DIVIDER_Y) / reb3DirY;
          const oppEnd2 = reb3EndX + reb3DirX * tOppBack2;
          drawLaser(reb3EndX, DIVIDER_Y, oppEnd2, oppBack, '#2ecc71', true, true);
          drawGhostPuck(oppEnd2, oppBack, '#2ecc71');
        }
      }
    }

    // CASE 3: DIRECT GATE PASS (Doğrudan kapıdan geçen vuruş)
    else if (isDirectPass) {
      this.drawHoleTarget(ctx, hitX, DIVIDER_Y);
      const oppBackWall = shooter === 'player' ? topWallY : bottomWallY;
      let tOppWall = Infinity;
      if (dirX < -0.001) tOppWall = (minX - hitX) / dirX;
      else if (dirX > 0.001) tOppWall = (maxX - hitX) / dirX;
      let tOppBack = (oppBackWall - hitY) / dirY;
      const tOpp = Math.min(tOppWall > 0 ? tOppWall : Infinity, tOppBack > 0 ? tOppBack : Infinity);
      const oppEndX = hitX + dirX * tOpp;
      const oppEndY = hitY + dirY * tOpp;
      drawLaser(hitX, hitY, oppEndX, oppEndY, '#2ecc71', true, true);
      drawGhostPuck(oppEndX, oppEndY, '#2ecc71');
    }

    // CASE 4: DIRECT DIVIDER HIT (Bölmeye temas noktası)
    else if (firstHitType === 'divider_hit') {
      drawContactRipple(hitX, hitY, '#f39c12');
      drawGhostPuck(hitX, hitY, '#f39c12');
    }

    // Launch Vector Arrow Head pointing in forward shooting direction
    const distToHit = Math.hypot(hitX - startX, hitY - startY);
    const arrowDist = Math.min(38, distToHit);
    const arrowTipX = startX + dirX * arrowDist;
    const arrowTipY = startY + dirY * arrowDist;
    this.drawArrowTip(ctx, arrowTipX, arrowTipY, Math.atan2(dirY, dirX), primaryColor);

    ctx.restore();
  }

  // Draw glowing target crosshair at the center hole when aimed accurately
  drawHoleTarget(ctx, x, y, isFlipped = false) {
    ctx.save();
    const now = Date.now();
    const pulse = 0.85 + 0.25 * Math.sin(now * 0.012);
    const rot = (now * 0.003) % (Math.PI * 2);

    // 1. Ambient flare around the gate
    const glowGrad = ctx.createRadialGradient(x, y, 4, x, y, 28);
    glowGrad.addColorStop(0, 'rgba(46, 204, 113, 0.45)');
    glowGrad.addColorStop(1, 'rgba(46, 204, 113, 0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(x, y, 28, 0, Math.PI * 2);
    ctx.fill();

    // 2. Rotating crosshair brackets
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.strokeStyle = '#2ecc71';
    ctx.lineWidth = 2.2;
    const bSize = 14 * pulse;
    for (let i = 0; i < 4; i++) {
      ctx.rotate(Math.PI / 2);
      ctx.beginPath();
      ctx.moveTo(bSize - 4, -bSize);
      ctx.lineTo(bSize, -bSize);
      ctx.lineTo(bSize, -bSize + 4);
      ctx.stroke();
    }
    ctx.restore();

    // 3. Inner pulsing target circle
    ctx.beginPath();
    ctx.arc(x, y, 9 * pulse, 0, Math.PI * 2);
    ctx.strokeStyle = '#2ecc71';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Center reticle dot
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // 4. "HEDEF KİLİTLİ" pill badge
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const badgeText = 'GOL ROTASI 🎯';
    const textWidth = ctx.measureText(badgeText).width;

    ctx.fillStyle = 'rgba(10, 35, 18, 0.9)';
    ctx.strokeStyle = '#2ecc71';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x - textWidth / 2 - 5, y - 24, textWidth + 10, 13, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#2ecc71';
    this.drawRotatedText(ctx, badgeText, x, y - 18, isFlipped);

    ctx.restore();
  }

  // Helper to draw clean directional arrow tip
  drawArrowTip(ctx, x, y, angle, color) {
    const headLen = 10;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-headLen, -5);
    ctx.lineTo(-headLen * 0.7, 0);
    ctx.lineTo(-headLen, 5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Draw 3D Soccer Match Balls (Futbol Temalı Taşlar)
  drawPucks(ctx, gameState, theme, isFlipped = false) {
    const { pucks } = gameState.physics;

    const pBall = theme?.playerBall || {
      name: 'Klasik Telstar Beyaz',
      baseGrad: ['#ffffff', '#f8fafc', '#e2e8f0', '#94a3b8'],
      pentagonColor: '#1e293b',
      seamColor: 'rgba(71, 85, 105, 0.55)',
      rimColor: '#00ffc8',
      specular: 'rgba(255, 255, 255, 0.85)',
    };
    const oBall = theme?.opponentBall || {
      name: 'Şampiyonlar Kırmızı',
      baseGrad: ['#2d3748', '#1a202c', '#0f172a', '#020617'],
      pentagonColor: '#e74c3c',
      seamColor: 'rgba(255, 107, 107, 0.55)',
      rimColor: '#f1c40f',
      specular: 'rgba(255, 255, 255, 0.75)',
    };

    pucks.forEach((puck) => {
      const { x, y } = puck.body.position;
      const r = puck.radius;
      const isPlayer = puck.team === 'white';
      const ballDef = isPlayer ? pBall : oBall;

      // 1. Realistic turf drop shadow cast onto grass
      ctx.save();
      ctx.beginPath();
      ctx.arc(x + 2.5, y + 4.5, r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(5, 20, 10, 0.50)';
      ctx.shadowColor = 'rgba(0, 10, 5, 0.60)';
      ctx.shadowBlur = 5;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 4;
      ctx.fill();
      ctx.restore();

      ctx.save();

      // 2. Base 3D Spherical Soccer Ball Gradient
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);

      const ballGrad = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, 2, x, y, r);
      ballGrad.addColorStop(0, ballDef.baseGrad[0]);
      ballGrad.addColorStop(0.4, ballDef.baseGrad[1]);
      ballGrad.addColorStop(0.75, ballDef.baseGrad[2]);
      ballGrad.addColorStop(1, ballDef.baseGrad[3]);
      ctx.fillStyle = ballGrad;
      ctx.fill();

      // Outer Ball Rim Outline
      ctx.strokeStyle = ballDef.rimColor;
      ctx.lineWidth = 1.4;
      ctx.stroke();

      // 3. Soccer Ball Classic Pentagon / Hexagon Leather Panels
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, r - 0.5, 0, Math.PI * 2);
      ctx.clip(); // Keep leather patches strictly within the ball sphere

      const pentagonColor = ballDef.pentagonColor;
      const seamColor = ballDef.seamColor;

      // Center Pentagon
      const centerR = r * 0.44;
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const a = (i * Math.PI * 2) / 5 - Math.PI / 2;
        const px = x + Math.cos(a) * centerR;
        const py = y + Math.sin(a) * centerR;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fillStyle = pentagonColor;
      ctx.fill();
      ctx.strokeStyle = seamColor;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // 5 Radial Seam Lines from Center Pentagon Vertices outward to edge
      for (let i = 0; i < 5; i++) {
        const a = (i * Math.PI * 2) / 5 - Math.PI / 2;
        const px = x + Math.cos(a) * centerR;
        const py = y + Math.sin(a) * centerR;
        const outX = x + Math.cos(a) * r;
        const outY = y + Math.sin(a) * r;

        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(outX, outY);
        ctx.strokeStyle = seamColor;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // 5 Outer Partial Edge Pentagons
        const midA = a + Math.PI / 5;
        const edgePx = x + Math.cos(midA) * (r * 0.95);
        const edgePy = y + Math.sin(midA) * (r * 0.95);

        ctx.beginPath();
        ctx.arc(edgePx, edgePy, r * 0.32, 0, Math.PI * 2);
        ctx.fillStyle = colorWithAlpha(pentagonColor, 0.85);
        ctx.fill();
      }

      ctx.restore();

      // 4. Top-Left 3D Specular Highlight (Leather spherical sheen)
      ctx.beginPath();
      ctx.arc(x, y, r - 1.8, Math.PI * 1.1, Math.PI * 1.6);
      ctx.strokeStyle = ballDef.specular || 'rgba(255, 255, 255, 0.75)';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // 5. Team Accent Rim Ring
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.strokeStyle = ballDef.rimColor;
      ctx.lineWidth = 1.6;
      ctx.stroke();

      // 6. Selection Halo (Local player's own balls during their turn)
      const isLocalTurn = gameState.isOnline
        ? (gameState.myRole === 'host' ? gameState.turn === 'player' : gameState.turn === 'player2')
        : (gameState.turn === 'player' || gameState.turn === 'player2');

      const isEligible = isLocalTurn && (
        (gameState.turn === 'player' && puck.team === 'white' && puck.body.position.y > BOARD_CONFIG.DIVIDER_Y) ||
        (gameState.turn === 'player2' && puck.team === 'black' && puck.body.position.y < BOARD_CONFIG.DIVIDER_Y)
      );

      if (isEligible && !gameState.isMoving) {
        const isCurrentAim = gameState.aiming && gameState.aimPuck === puck;
        const pulse = 0.5 + 0.5 * Math.sin(Date.now() * 0.007 + x);

        ctx.beginPath();
        ctx.arc(x, y, r + (isCurrentAim ? 5.5 : 3.5), 0, Math.PI * 2);
        const haloColor = isCurrentAim
          ? '#2ecc71'
          : `rgba(46, 204, 113, ${0.45 + 0.45 * pulse})`;
        ctx.strokeStyle = haloColor;
        ctx.lineWidth = isCurrentAim ? 2.6 : 1.8;
        ctx.stroke();
      }

      ctx.restore();
    });
  }

  // Draw particle sparkles
  drawParticles(ctx) {
    this.particles.forEach((p) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();
      ctx.restore();
    });
  }
}
