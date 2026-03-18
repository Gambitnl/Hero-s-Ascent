
import { GameState } from '../../types';
import { getId } from '../../utils/id';

export const updateTeleporterAttacks = (state: GameState, dt: number, damageMultiplier: number, critMultiplier: number) => {
  const { hero, teleporterAbilities, keys, mousePos, mouseDown } = state;

  // Update cooldowns
  if (teleporterAbilities.boomerangTimer > 0) teleporterAbilities.boomerangTimer -= dt;
  if (teleporterAbilities.blackHoleTimer > 0) teleporterAbilities.blackHoleTimer -= dt;
  if (teleporterAbilities.dimensionDoorTimer > 0) teleporterAbilities.dimensionDoorTimer -= dt;
  if (teleporterAbilities.teleportAllyTimer > 0) teleporterAbilities.teleportAllyTimer -= dt;

  // Black Boomerang (LMB)
  if (mouseDown.left && teleporterAbilities.boomerangTimer <= 0) {
    teleporterAbilities.boomerangTimer = teleporterAbilities.boomerangCooldown;
    const angleToMouse = Math.atan2(mousePos.y - hero.pos.y, mousePos.x - hero.pos.x);
    const projSpeed = 400;
    const damage = teleporterAbilities.boomerangDamage * Math.pow(0.9, teleporterAbilities.boomerangCount - 1) * damageMultiplier * critMultiplier;

    const count = teleporterAbilities.boomerangCount;
    const spreadAngle = Math.PI / 12; // 15 degrees spread

    for (let i = 0; i < count; i++) {
      const angleOffset = (i - (count - 1) / 2) * spreadAngle;
      const angle = angleToMouse + angleOffset;

      // Calculate target position based on mouse distance, but rotated
      const distToMouse = Math.sqrt((mousePos.x - hero.pos.x) ** 2 + (mousePos.y - hero.pos.y) ** 2);
      const targetX = hero.pos.x + Math.cos(angle) * distToMouse;
      const targetY = hero.pos.y + Math.sin(angle) * distToMouse;

      state.projectiles.push({
        id: getId(),
        pos: { ...hero.pos },
        vel: { x: Math.cos(angle) * projSpeed, y: Math.sin(angle) * projSpeed },
        radius: 10,
        damage: damage,
        pierceCount: 0,
        maxPierce: 9999, // Boomerangs pierce infinitely
        hitMonsters: new Set(),
        isBoomerang: true,
        targetPos: { x: targetX, y: targetY },
        returning: false,
      });
    }
  }

  // Black Bolt (RMB)
  if (mouseDown.right && teleporterAbilities.blackHoleTimer <= 0 && hero.mana >= 20) {
    hero.mana -= 20;
    teleporterAbilities.blackHoleTimer = teleporterAbilities.blackHoleCooldown;

    state.effects.push({
      id: getId(),
      type: 'blackHole',
      pos: { ...mousePos },
      radius: teleporterAbilities.blackHoleRadius,
      timer: 0,
      maxTimer: teleporterAbilities.blackHoleDuration,
    });
  }

  // Dimension Doors (Q)
  if (keys['q'] && teleporterAbilities.dimensionDoorTimer <= 0 && hero.mana >= 30) {
    hero.mana -= 30;
    teleporterAbilities.dimensionDoorTimer = teleporterAbilities.dimensionDoorCooldown;

    const blastRadius = 150;
    const newPos = { ...mousePos };

    // Clamp new position to screen
    newPos.x = Math.max(hero.radius, Math.min(state.canvasWidth - hero.radius, newPos.x));
    newPos.y = Math.max(hero.radius, Math.min(state.canvasHeight - hero.radius, newPos.y));

    hero.pos = newPos;

    state.effects.push({
      id: getId(),
      type: 'circle',
      pos: { ...newPos },
      radius: blastRadius,
      timer: 0,
      maxTimer: 0.5,
    });

    for (const m of state.monsters) {
      if (m.isFriendly) continue;
      const dx = m.pos.x - newPos.x;
      const dy = m.pos.y - newPos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const pushAngle = Math.atan2(dy, dx);
      const pushDist = Math.max(state.canvasWidth, state.canvasHeight); // Push to edge

      if (dist <= blastRadius + m.radius) {
        m.hp -= teleporterAbilities.dimensionDoorDamage * damageMultiplier * critMultiplier;
      }

      // Push all monsters to edge
      m.pos.x += Math.cos(pushAngle) * pushDist;
      m.pos.y += Math.sin(pushAngle) * pushDist;

      // Clamp to screen
      m.pos.x = Math.max(m.radius, Math.min(state.canvasWidth - m.radius, m.pos.x));
      m.pos.y = Math.max(m.radius, Math.min(state.canvasHeight - m.radius, m.pos.y));
    }
  }

  // Teleport Ally (E)
  if (keys['e'] && teleporterAbilities.teleportAllyTimer <= 0 && hero.mana >= 40) {
    hero.mana -= 40;
    teleporterAbilities.teleportAllyTimer = teleporterAbilities.teleportAllyCooldown;

    const allies = [
      { type: 'Gargantua', hp: 1000, damage: 50, speed: 30, radius: 25, color: '#064e3b' },
      { type: 'Shadow Weaver', hp: 200, damage: 100, speed: 120, radius: 12, color: '#312e81' },
      { type: 'Arcane Turret', hp: 300, damage: 20, speed: 0, radius: 15, color: '#0284c7' },
      { type: 'Light Spirit', hp: 200, damage: 0, speed: 80, radius: 10, color: '#fef08a' },
      { type: 'Void Fiend', hp: 100, damage: 200, speed: 90, radius: 12, color: '#4c1d95' },
    ];

    const allyDef = allies[Math.floor(Math.random() * allies.length)];

    state.monsters.push({
      id: getId(),
      pos: { ...mousePos },
      radius: allyDef.radius,
      speed: allyDef.speed,
      hp: allyDef.hp,
      maxHp: allyDef.hp,
      damage: allyDef.damage,
      color: allyDef.color,
      isFriendly: true,
      allyType: allyDef.type,
      expireTimer: 30, // Allies last 30 seconds
      attackTimer: 0,
    });

    state.effects.push({
      id: getId(),
      type: 'circle',
      pos: { ...mousePos },
      radius: 30,
      timer: 0,
      maxTimer: 0.5,
    });
  }
};
