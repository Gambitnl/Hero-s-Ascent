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
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }
  }

  // Draw Monsters
  for (const m of state.monsters) {
    if (m.isFriendly) {
      switch (m.allyType) {
        case 'Gargantua': ctx.fillStyle = '#78716c'; break; // Stone
        case 'Shadow Weaver': ctx.fillStyle = '#4c1d95'; break; // Dark purple
        case 'Arcane Turret': ctx.fillStyle = '#0ea5e9'; break; // Light blue
        case 'Light Spirit': ctx.fillStyle = '#fef08a'; break; // Yellow
        case 'Void Fiend': ctx.fillStyle = '#1e1b4b'; break; // Very dark purple
        default: ctx.fillStyle = '#a855f7'; // Purple default
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

    // Draw ally name
    if (m.isFriendly && m.allyType) {
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(m.allyType, m.pos.x, m.pos.y + m.radius + 12);
    }
  }
  // Draw Aiming Line
  if (state.status === 'playing' && state.archetype === 'archer') {
    ctx.beginPath();
    ctx.moveTo(state.hero.pos.x, state.hero.pos.y);
    ctx.lineTo(state.mousePos.x, state.mousePos.y);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }


  // Draw Hero
  const { hero } = state;
  ctx.fillStyle = state.invulnerabilityTimer > 0 ? '#fcd34d' : (state.archetype === 'archer' ? '#3b82f6' : '#f97316');
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
