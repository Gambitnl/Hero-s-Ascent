import { GameState } from '../types';

export const draw = (state: GameState, ctx: CanvasRenderingContext2D) => {
  // Clear background
  ctx.fillStyle = '#1e1e24'; // Dark slate
  ctx.fillRect(0, 0, state.canvasWidth, state.canvasHeight);

  // Draw Grid (optional, for aesthetics)
  ctx.strokeStyle = '#2d2d36';
  ctx.lineWidth = 1;
  const gridSize = 40;
  for (let x = 0; x < state.canvasWidth; x += gridSize) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, state.canvasHeight); ctx.stroke();
  }
  for (let y = 0; y < state.canvasHeight; y += gridSize) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(state.canvasWidth, y); ctx.stroke();
  }

  // Draw Rupture Paths
  for (const path of state.rupturePaths) {
    ctx.strokeStyle = `rgba(220, 38, 38, ${Math.min(1, path.timer / 2)})`; // Fade out
    ctx.lineWidth = 20;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(path.start.x, path.start.y);
    ctx.lineTo(path.end.x, path.end.y);
    ctx.stroke();
    
    // Inner core
    ctx.strokeStyle = `rgba(252, 165, 165, ${Math.min(1, path.timer / 2)})`;
    ctx.lineWidth = 8;
    ctx.stroke();
  }

  // Draw Effects
  for (const effect of state.effects) {
    const progress = effect.timer / effect.maxTimer;
    const alpha = 1 - progress;
    
    if (effect.type === 'slash' && effect.angle !== undefined && effect.radius !== undefined) {
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(effect.pos.x, effect.pos.y, effect.radius, effect.angle - 0.5, effect.angle + 0.5);
      ctx.stroke();
    } else if (effect.type === 'circle' && effect.radius !== undefined) {
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(effect.pos.x, effect.pos.y, effect.radius * progress, 0, Math.PI * 2);
      ctx.stroke();
    } else if (effect.type === 'dash') {
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
      ctx.beginPath();
      ctx.arc(effect.pos.x, effect.pos.y, 15, 0, Math.PI * 2);
      ctx.fill();
    } else if (effect.type === 'royalCross' && effect.angle !== undefined && effect.radius !== undefined) {
      const angle = effect.angle;
      const len = effect.radius;
      const cx = effect.pos.x;
      const cy = effect.pos.y;
      const endX = cx + Math.cos(angle) * len;
      const endY = cy + Math.sin(angle) * len;
      const crossCx = cx + Math.cos(angle) * len * 0.6;
      const crossCy = cy + Math.sin(angle) * len * 0.6;
      const perpAngle = angle + Math.PI / 2;
      const crossHalfLen = len * 0.4;

      // Outer glow
      ctx.strokeStyle = `rgba(251, 191, 36, ${alpha * 0.5})`;
      ctx.lineWidth = 20;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(endX, endY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(crossCx - Math.cos(perpAngle) * crossHalfLen, crossCy - Math.sin(perpAngle) * crossHalfLen);
      ctx.lineTo(crossCx + Math.cos(perpAngle) * crossHalfLen, crossCy + Math.sin(perpAngle) * crossHalfLen);
      ctx.stroke();

      // Main gold arm
      ctx.strokeStyle = `rgba(251, 191, 36, ${alpha})`;
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(endX, endY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(crossCx - Math.cos(perpAngle) * crossHalfLen, crossCy - Math.sin(perpAngle) * crossHalfLen);
      ctx.lineTo(crossCx + Math.cos(perpAngle) * crossHalfLen, crossCy + Math.sin(perpAngle) * crossHalfLen);
      ctx.stroke();

      // White inner core
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(endX, endY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(crossCx - Math.cos(perpAngle) * crossHalfLen, crossCy - Math.sin(perpAngle) * crossHalfLen);
      ctx.lineTo(crossCx + Math.cos(perpAngle) * crossHalfLen, crossCy + Math.sin(perpAngle) * crossHalfLen);
      ctx.stroke();
    } else if (effect.type === 'blackHole' && effect.radius !== undefined) {
      // Draw black hole
      ctx.beginPath();
      ctx.arc(effect.pos.x, effect.pos.y, effect.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 0, 0, ${0.5 * alpha})`; // Fading black aura
      ctx.fill();
      ctx.closePath();
      
      // Core
      ctx.beginPath();
      ctx.arc(effect.pos.x, effect.pos.y, effect.radius * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = '#000000';
      ctx.fill();
      ctx.closePath();
    }
  }

  // Draw Money Drops
  for (const drop of state.moneyDrops) {
    ctx.fillStyle = '#fbbf24'; // Amber-400
    ctx.beginPath();
    ctx.arc(drop.pos.x, drop.pos.y, drop.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#d97706'; // Amber-600
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Inner detail
    ctx.fillStyle = '#fef3c7';
    ctx.beginPath();
    ctx.arc(drop.pos.x - 2, drop.pos.y - 2, drop.radius * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Draw Projectiles
  for (const proj of state.projectiles) {
    ctx.beginPath();
    ctx.arc(proj.pos.x, proj.pos.y, proj.radius, 0, Math.PI * 2);
    if (proj.isEnemy) {
      ctx.fillStyle = '#ef4444'; // Red
      ctx.fill();
    } else if (proj.isLoveArrow) {
      ctx.fillStyle = '#ec4899'; // Pink
      ctx.fill();
      // Draw a small heart shape instead of circle (simplified as pink circle for now)
    } else if (proj.isBoomerang) {
      ctx.fillStyle = '#171717'; // Black
      ctx.fill();
      ctx.strokeStyle = '#a855f7'; // Purple outline
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (proj.isArrow) {
      ctx.fillStyle = '#60a5fa'; // Blue
      ctx.fill();
      // Draw arrow line
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(proj.pos.x, proj.pos.y);
      ctx.lineTo(proj.pos.x - proj.vel.x * 0.05, proj.pos.y - proj.vel.y * 0.05);
      ctx.stroke();
    } else if (proj.isCannonball) {
      // Gold cannonball with dark core
      ctx.fillStyle = '#b45309';
      ctx.fill();
      ctx.strokeStyle = '#fcd34d';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(proj.pos.x, proj.pos.y, proj.radius * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = '#78350f';
      ctx.fill();
    } else if (proj.isShrapnel) {
      ctx.fillStyle = '#fbbf24'; // Amber shrapnel
      ctx.fill();
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }
  }

  // Draw Monsters
  for (const m of state.monsters) {
    if (m.isFriendly) {
      switch (m.allyType) {
        case 'Gargantua': ctx.fillStyle = '#78716c'; break;
        case 'Shadow Weaver': ctx.fillStyle = '#4c1d95'; break;
        case 'Arcane Turret': ctx.fillStyle = '#0ea5e9'; break;
        case 'Light Spirit': ctx.fillStyle = '#fef08a'; break;
        case 'Void Fiend': ctx.fillStyle = '#1e1b4b'; break;
        // Chess pieces
        case 'Pawn':   ctx.fillStyle = '#9ca3af'; break;
        case 'Knight': ctx.fillStyle = '#92400e'; break;
        case 'Rook':   ctx.fillStyle = '#4b5563'; break;
        case 'Bishop': ctx.fillStyle = '#fbbf24'; break;
        case 'Queen':  ctx.fillStyle = '#a855f7'; break;
        default: ctx.fillStyle = '#a855f7';
      }
    } else {
      ctx.fillStyle = m.isCharmed ? '#ec4899' : m.color;
    }
    ctx.beginPath();
    ctx.arc(m.pos.x, m.pos.y, m.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Boss indicator
    if (m.isBoss) {
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 4;
      ctx.stroke();
    }

    // HP Bar
    const hpPercent = Math.max(0, m.hp / m.maxHp);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(m.pos.x - m.radius, m.pos.y - m.radius - 10, m.radius * 2, 4);
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(m.pos.x - m.radius, m.pos.y - m.radius - 10, m.radius * 2 * hpPercent, 4);

    // Draw ally label
    if (m.isFriendly && m.allyType) {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      // Chess pieces show single letter inside circle
      const chessLabels: Record<string, string> = { Pawn: 'P', Knight: 'N', Rook: 'R', Bishop: 'B', Queen: 'Q' };
      if (chessLabels[m.allyType]) {
        ctx.fillText(chessLabels[m.allyType], m.pos.x, m.pos.y + 4);
      } else {
        ctx.fillText(m.allyType, m.pos.x, m.pos.y + m.radius + 12);
      }
    }
  }

  // Draw crown above king hero
  if (state.archetype === 'king') {
    const hx = state.hero.pos.x;
    const hy = state.hero.pos.y - state.hero.radius - 10;
    ctx.fillStyle = '#fcd34d';
    ctx.beginPath();
    // Simple crown: 3 points
    ctx.moveTo(hx - 8, hy + 6);
    ctx.lineTo(hx - 8, hy - 2);
    ctx.lineTo(hx - 4, hy + 2);
    ctx.lineTo(hx, hy - 6);
    ctx.lineTo(hx + 4, hy + 2);
    ctx.lineTo(hx + 8, hy - 2);
    ctx.lineTo(hx + 8, hy + 6);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  // Draw Aiming Line (archer and king)
  if (state.status === 'playing' && (state.archetype === 'archer' || state.archetype === 'king')) {
    ctx.beginPath();
    ctx.moveTo(state.hero.pos.x, state.hero.pos.y);
    ctx.lineTo(state.mousePos.x, state.mousePos.y);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Draw Ultra Spin scepter (king)
  if (state.archetype === 'king' && state.kingAbilities.ultraSpinActiveTimer > 0) {
    const spinAngle = state.kingAbilities.ultraSpinAngle;
    const spinRadius = state.kingAbilities.ultraSpinRadius;
    const tipX = state.hero.pos.x + Math.cos(spinAngle) * spinRadius;
    const tipY = state.hero.pos.y + Math.sin(spinAngle) * spinRadius;
    const spinAlpha = Math.min(1, state.kingAbilities.ultraSpinActiveTimer / 2);

    // Scepter shaft
    ctx.beginPath();
    ctx.moveTo(state.hero.pos.x, state.hero.pos.y);
    ctx.lineTo(tipX, tipY);
    ctx.strokeStyle = `rgba(180, 130, 20, ${spinAlpha})`;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Orb at tip
    ctx.beginPath();
    ctx.arc(tipX, tipY, 8, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(253, 224, 71, ${spinAlpha})`;
    ctx.fill();
    ctx.strokeStyle = `rgba(255, 255, 255, ${spinAlpha * 0.7})`;
    ctx.lineWidth = 2;
    ctx.stroke();
  }


  // Draw Hero
  const { hero } = state;
  const heroColor = state.invulnerabilityTimer > 0 ? '#fcd34d'
    : state.archetype === 'archer' ? '#3b82f6'
    : state.archetype === 'king' ? '#b45309'
    : '#f97316';
  ctx.fillStyle = heroColor;
  ctx.beginPath();
  ctx.arc(hero.pos.x, hero.pos.y, hero.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Draw Attack Boost Indicator
  if (state.attackBoostTimer > 0) {
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(hero.pos.x, hero.pos.y, hero.radius + 5, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Draw Hero HP Bar (below hero)
  const heroHpPercent = Math.max(0, hero.hp / hero.maxHp);
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(hero.pos.x - hero.radius, hero.pos.y + hero.radius + 5, hero.radius * 2, 4);
  ctx.fillStyle = '#22c55e';
  ctx.fillRect(hero.pos.x - hero.radius, hero.pos.y + hero.radius + 5, hero.radius * 2 * heroHpPercent, 4);

  // Draw Hero Mana Bar (below HP)
  const heroManaPercent = Math.max(0, hero.mana / hero.maxMana);
  ctx.fillStyle = '#1e3a8a';
  ctx.fillRect(hero.pos.x - hero.radius, hero.pos.y + hero.radius + 12, hero.radius * 2, 4);
  ctx.fillStyle = '#3b82f6';
  ctx.fillRect(hero.pos.x - hero.radius, hero.pos.y + hero.radius + 12, hero.radius * 2 * heroManaPercent, 4);

  // Draw Inventory
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(10, state.canvasHeight - 100, 180, 90);
  ctx.fillStyle = '#ffffff';
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`[1] Health Potion: ${state.inventory.healthPotions}`, 20, state.canvasHeight - 80);
  ctx.fillText(`[2] Attack Potion: ${state.inventory.attackPotions}`, 20, state.canvasHeight - 60);
  ctx.fillText(`[3] Mana Potion: ${state.inventory.manaPotions}`, 20, state.canvasHeight - 40);
  ctx.fillText(`[4] Invulnerability: ${state.inventory.invulnerabilityPotions}`, 20, state.canvasHeight - 20);

  // Draw Damage Texts
  for (const dt of state.damageTexts) {
    ctx.fillStyle = dt.color;
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.globalAlpha = dt.timer; // Fade out
    ctx.fillText(dt.text, dt.pos.x, dt.pos.y);
    ctx.globalAlpha = 1.0;
  }
};
