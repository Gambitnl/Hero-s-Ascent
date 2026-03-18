
import { GameState, Projectile } from '../../types';
import { getId } from '../../utils/id';

export const updateArcherAttacks = (state: GameState, _dt: number, damageMultiplier: number, critMultiplier: number) => {
  const { hero, abilities, keys, mousePos, mouseDown } = state;
  const now = performance.now() / 1000;

  if (now - hero.lastAttackTime >= 1 / abilities.fireRate) {
    const angleToMouse = Math.atan2(mousePos.y - hero.pos.y, mousePos.x - hero.pos.x);
    const projSpeed = 400;
    const newProjectiles: Projectile[] = [];

    // Secondary Attack (Right Click)
    if (mouseDown.right && hero.mana >= 15) {
      hero.lastAttackTime = now;
      hero.mana -= 15;
      const moveAngle = angleToMouse;
      const angles = [moveAngle, moveAngle + Math.PI];

      for (const baseAngle of angles) {
        const count = abilities.projectileCount;
        const startAngle = baseAngle - (abilities.spreadAngle * (count - 1)) / 2;
        for (let i = 0; i < count; i++) {
          const angle = count === 1 ? baseAngle : startAngle + i * abilities.spreadAngle;
          newProjectiles.push({
            id: getId(),
            pos: { x: hero.pos.x, y: hero.pos.y },
            vel: { x: Math.cos(angle) * projSpeed, y: Math.sin(angle) * projSpeed },
            radius: 5,
            damage: abilities.damage * damageMultiplier * critMultiplier,
            pierceCount: 0,
            maxPierce: abilities.maxPierce,
            hitMonsters: new Set(),
            isArrow: true,
          });
        }
      }
    } else if (mouseDown.left) {
      // Primary Attack (Left Click)
      hero.lastAttackTime = now;
      const count = abilities.projectileCount;
      const startAngle = angleToMouse - (abilities.spreadAngle * (count - 1)) / 2;
      for (let i = 0; i < count; i++) {
        const angle = count === 1 ? angleToMouse : startAngle + i * abilities.spreadAngle;
        newProjectiles.push({
          id: getId(),
          pos: { x: hero.pos.x, y: hero.pos.y },
          vel: { x: Math.cos(angle) * projSpeed, y: Math.sin(angle) * projSpeed },
          radius: 5,
          damage: abilities.damage * damageMultiplier * critMultiplier,
          pierceCount: 0,
          maxPierce: abilities.maxPierce,
          hitMonsters: new Set(),
          isArrow: true,
        });
      }
    }
    state.projectiles.push(...newProjectiles);
  }

  // Archer Q: Arrow Rain
  if (keys['q'] && abilities.arrowRainTimer <= 0 && hero.mana >= 30) {
    hero.mana -= 30;
    abilities.arrowRainTimer = abilities.arrowRainCooldown;
    abilities.arrowRainActiveTimer = 5;
  }

  // Archer E: Love Arrow
  if (keys['e'] && abilities.loveArrowTimer <= 0 && hero.mana >= 25) {
    hero.mana -= 25;
    abilities.loveArrowTimer = abilities.loveArrowCooldown;
    const angleToMouse = Math.atan2(mousePos.y - hero.pos.y, mousePos.x - hero.pos.x);
    const projSpeed = 600;
    state.projectiles.push({
      id: getId(),
      pos: { x: hero.pos.x, y: hero.pos.y },
      vel: { x: Math.cos(angleToMouse) * projSpeed, y: Math.sin(angleToMouse) * projSpeed },
      radius: 8,
      damage: 5,
      pierceCount: 0,
      maxPierce: 1,
      hitMonsters: new Set(),
      isLoveArrow: true,
    });
  }
};
