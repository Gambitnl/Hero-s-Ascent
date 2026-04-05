
import { GameState, Projectile } from '../../types';
import { getId } from '../../utils/id';

export const updateArcherAttacks = (state: GameState, dt: number, damageMultiplier: number, critMultiplier: number) => {
  const { hero, abilities, keys, mousePos, mouseDown } = state;
  const now = performance.now() / 1000;
  const angleToMouse = Math.atan2(mousePos.y - hero.pos.y, mousePos.x - hero.pos.x);
  const projSpeed = 400;

  // Primary Attack (Left Click)
  if (mouseDown.left && now - hero.lastAttackTime >= 1 / abilities.fireRate && !abilities.pirouetteActive) {
    hero.lastAttackTime = now;
    const newProjectiles: Projectile[] = [];
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
    state.projectiles.push(...newProjectiles);
  }

  // Secondary Attack (Right Click) - 360 Pirouette
  if (mouseDown.right && abilities.pirouetteTimer <= 0 && hero.mana >= 15 && !abilities.pirouetteActive) {
    hero.mana -= 15;
    abilities.pirouetteTimer = abilities.pirouetteCooldown;
    abilities.pirouetteActive = true;
    abilities.pirouetteArrowsFired = 0;
    abilities.pirouetteFireTimer = 0; // ready to fire first arrow immediately
    abilities.pirouetteBaseAngle = angleToMouse;
  }

  // Handle active Pirouette
  if (abilities.pirouetteActive) {
    abilities.pirouetteFireTimer -= dt;
    
    // Fire arrows sequentially
    while (abilities.pirouetteActive && abilities.pirouetteFireTimer <= 0) {
      const angle = abilities.pirouetteBaseAngle + (abilities.pirouetteArrowsFired * (Math.PI * 2 / abilities.pirouetteTotalArrows));
      
      const count = abilities.projectileCount;
      const startAngle = angle - (abilities.spreadAngle * (count - 1)) / 2;
      for (let i = 0; i < count; i++) {
        const fireAngle = count === 1 ? angle : startAngle + i * abilities.spreadAngle;
        state.projectiles.push({
          id: getId(),
          pos: { x: hero.pos.x, y: hero.pos.y },
          vel: { x: Math.cos(fireAngle) * projSpeed, y: Math.sin(fireAngle) * projSpeed },
          radius: 5,
          damage: abilities.damage * damageMultiplier * critMultiplier * 0.8, // Slightly reduced damage for balance
          pierceCount: 0,
          maxPierce: abilities.maxPierce,
          hitMonsters: new Set(),
          isArrow: true,
        });
      }

      abilities.pirouetteArrowsFired++;
      
      if (abilities.pirouetteArrowsFired >= abilities.pirouetteTotalArrows) {
        abilities.pirouetteActive = false;
      } else {
        // Interval between arrows (e.g. 0.05 seconds for rapid fire)
        abilities.pirouetteFireTimer += 0.05; 
      }
    }
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
