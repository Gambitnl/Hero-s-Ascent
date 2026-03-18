
import { GameState } from '../../types';
import { getId } from '../../utils/id';

export const updateKingAttacks = (state: GameState, dt: number, damageMultiplier: number, critMultiplier: number) => {
  const { hero, kingAbilities, keys, mousePos, mouseDown } = state;

  // Tick cooldowns
  if (kingAbilities.kingBallTimer > 0) kingAbilities.kingBallTimer -= dt;
  if (kingAbilities.royalSmackTimer > 0) kingAbilities.royalSmackTimer -= dt;
  if (kingAbilities.royalHelpTimer > 0) kingAbilities.royalHelpTimer -= dt;
  if (kingAbilities.ultraSpinTimer > 0) kingAbilities.ultraSpinTimer -= dt;

  // --- LMB: King Ball (Cannonball) ---
  if (mouseDown.left && kingAbilities.kingBallTimer <= 0) {
    kingAbilities.kingBallTimer = kingAbilities.kingBallCooldown;
    const angleToMouse = Math.atan2(mousePos.y - hero.pos.y, mousePos.x - hero.pos.x);
    state.projectiles.push({
      id: getId(),
      pos: { x: hero.pos.x, y: hero.pos.y },
      vel: { x: Math.cos(angleToMouse) * 300, y: Math.sin(angleToMouse) * 300 },
      radius: 14,
      damage: kingAbilities.kingBallDamage * damageMultiplier * critMultiplier,
      pierceCount: 0,
      maxPierce: 1,
      hitMonsters: new Set(),
      isCannonball: true,
    });
  }

  // --- RMB: Royal Smack (Holy Cross) ---
  if (mouseDown.right && kingAbilities.royalSmackTimer <= 0 && hero.mana >= 15) {
    hero.mana -= 15;
    kingAbilities.royalSmackTimer = kingAbilities.royalSmackCooldown;

    const angleToMouse = Math.atan2(mousePos.y - hero.pos.y, mousePos.x - hero.pos.x);
    const len = kingAbilities.royalSmackLength;

    // End of main arm
    const endPos = {
      x: hero.pos.x + Math.cos(angleToMouse) * len,
      y: hero.pos.y + Math.sin(angleToMouse) * len,
    };

    // Cross bar centre (60% along main arm)
    const crossCx = hero.pos.x + Math.cos(angleToMouse) * len * 0.6;
    const crossCy = hero.pos.y + Math.sin(angleToMouse) * len * 0.6;
    const perpAngle = angleToMouse + Math.PI / 2;
    const crossHalfLen = len * 0.4; // 80 units each side

    state.effects.push({
      id: getId(),
      type: 'royalCross',
      pos: { ...hero.pos },
      angle: angleToMouse,
      radius: len,
      timer: 0,
      maxTimer: 0.6,
    });

    const dmg = kingAbilities.royalSmackDamage * damageMultiplier * critMultiplier;

    for (const m of state.monsters) {
      if (m.isFriendly || m.isCharmed) continue;

      // Check main arm: point-to-segment distance
      const l2 = len * len;
      let t = ((m.pos.x - hero.pos.x) * (endPos.x - hero.pos.x) + (m.pos.y - hero.pos.y) * (endPos.y - hero.pos.y)) / l2;
      t = Math.max(0, Math.min(1, t));
      const px = hero.pos.x + t * (endPos.x - hero.pos.x);
      const py = hero.pos.y + t * (endPos.y - hero.pos.y);
      const mainDist = Math.sqrt((m.pos.x - px) ** 2 + (m.pos.y - py) ** 2);

      // Check cross bar: point-to-segment distance
      const crossStartX = crossCx - Math.cos(perpAngle) * crossHalfLen;
      const crossStartY = crossCy - Math.sin(perpAngle) * crossHalfLen;
      const crossEndX = crossCx + Math.cos(perpAngle) * crossHalfLen;
      const crossEndY = crossCy + Math.sin(perpAngle) * crossHalfLen;
      const cl2 = (crossHalfLen * 2) ** 2;
      let ct = ((m.pos.x - crossStartX) * (crossEndX - crossStartX) + (m.pos.y - crossStartY) * (crossEndY - crossStartY)) / cl2;
      ct = Math.max(0, Math.min(1, ct));
      const cpx = crossStartX + ct * (crossEndX - crossStartX);
      const cpy = crossStartY + ct * (crossEndY - crossStartY);
      const crossDist = Math.sqrt((m.pos.x - cpx) ** 2 + (m.pos.y - cpy) ** 2);

      if (mainDist <= m.radius + 25 || crossDist <= m.radius + 25) {
        m.hp -= dmg;
        state.damageTexts.push({
          id: getId(),
          pos: { x: m.pos.x, y: m.pos.y - 20 },
          text: Math.floor(dmg).toString(),
          timer: 1,
          color: '#fcd34d',
        });
      }
    }
  }

  // --- Q: Ultra Spin (Scepter Sweep) ---
  if (keys['q'] && kingAbilities.ultraSpinTimer <= 0 && kingAbilities.ultraSpinActiveTimer <= 0 && hero.mana >= 30) {
    hero.mana -= 30;
    kingAbilities.ultraSpinTimer = kingAbilities.ultraSpinCooldown;
    kingAbilities.ultraSpinActiveTimer = kingAbilities.ultraSpinDuration;
  }

  if (kingAbilities.ultraSpinActiveTimer > 0) {
    kingAbilities.ultraSpinActiveTimer -= dt;
    kingAbilities.ultraSpinAngle += kingAbilities.ultraSpinSpeed * dt;

    const arcHalfWidth = Math.PI / 6; // 30° arc
    const scepterTipX = hero.pos.x + Math.cos(kingAbilities.ultraSpinAngle) * kingAbilities.ultraSpinRadius;
    const scepterTipY = hero.pos.y + Math.sin(kingAbilities.ultraSpinAngle) * kingAbilities.ultraSpinRadius;

    for (const m of state.monsters) {
      if (m.isFriendly || m.isCharmed) continue;
      const mdx = m.pos.x - hero.pos.x;
      const mdy = m.pos.y - hero.pos.y;
      const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
      if (mdist > kingAbilities.ultraSpinRadius + m.radius) continue;

      const mAngle = Math.atan2(mdy, mdx);
      let angleDiff = mAngle - kingAbilities.ultraSpinAngle;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

      if (Math.abs(angleDiff) <= arcHalfWidth) {
        const spinDmg = kingAbilities.ultraSpinDamage * damageMultiplier * dt;
        m.hp -= spinDmg;
        if (Math.random() < 0.08) {
          state.damageTexts.push({
            id: getId(),
            pos: { x: m.pos.x, y: m.pos.y - 20 },
            text: Math.floor(spinDmg * 10).toString(),
            timer: 0.8,
            color: '#fcd34d',
          });
        }
      }
    }
  }

  // --- E: Royal Help (Chess Piece Ally) ---
  if (keys['e'] && kingAbilities.royalHelpTimer <= 0 && hero.mana >= 40) {
    hero.mana -= 40;
    kingAbilities.royalHelpTimer = kingAbilities.royalHelpCooldown;

    const chessPieces = [
      { type: 'Pawn',   hp: 150, damage: 15, speed: 60,  radius: 12, color: '#9ca3af' },
      { type: 'Knight', hp: 200, damage: 30, speed: 100, radius: 13, color: '#92400e' },
      { type: 'Rook',   hp: 400, damage: 20, speed: 35,  radius: 18, color: '#4b5563' },
      { type: 'Bishop', hp: 180, damage: 40, speed: 70,  radius: 12, color: '#fbbf24' },
      { type: 'Queen',  hp: 500, damage: 60, speed: 75,  radius: 15, color: '#a855f7' },
    ];

    const piece = chessPieces[Math.floor(Math.random() * chessPieces.length)];
    const spawnOffset = { x: (Math.random() - 0.5) * 80, y: (Math.random() - 0.5) * 80 };

    state.monsters.push({
      id: getId(),
      pos: { x: hero.pos.x + spawnOffset.x, y: hero.pos.y + spawnOffset.y },
      radius: piece.radius,
      speed: piece.speed,
      hp: piece.hp,
      maxHp: piece.hp,
      damage: piece.damage,
      color: piece.color,
      isFriendly: true,
      allyType: piece.type,
      attackTimer: 0,
      // No expireTimer — chess pieces stay until killed
    });

    state.effects.push({
      id: getId(),
      type: 'circle',
      pos: { x: hero.pos.x + spawnOffset.x, y: hero.pos.y + spawnOffset.y },
      radius: 40,
      timer: 0,
      maxTimer: 0.4,
    });
  }
};
