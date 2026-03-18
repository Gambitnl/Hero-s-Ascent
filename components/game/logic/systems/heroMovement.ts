
import { GameState } from '../../types';

export const updateHeroMovement = (state: GameState, dt: number, damageMultiplier: number, critMultiplier: number) => {
  const { hero, abilities, barbarianAbilities, keys, archetype } = state;

  let dx = 0;
  let dy = 0;
  if (keys['w'] || keys['arrowup']) dy -= 1;
  if (keys['s'] || keys['arrowdown']) dy += 1;
  if (keys['a'] || keys['arrowleft']) dx -= 1;
  if (keys['d'] || keys['arrowright']) dx += 1;

  if (archetype === 'barbarian' && barbarianAbilities.isDashing) {
    barbarianAbilities.dashTimer += dt;
    if (barbarianAbilities.dashTimer >= barbarianAbilities.dashDuration || !barbarianAbilities.dashTarget) {
      barbarianAbilities.isDashing = false;
    } else {
      const dashSpeed = 800; // Fast dash
      const dashDx = barbarianAbilities.dashTarget.x - hero.pos.x;
      const dashDy = barbarianAbilities.dashTarget.y - hero.pos.y;
      const dashLen = Math.sqrt(dashDx * dashDx + dashDy * dashDy);
      if (dashLen > 0) {
        hero.pos.x += (dashDx / dashLen) * dashSpeed * dt;
        hero.pos.y += (dashDy / dashLen) * dashSpeed * dt;
      }

      // Damage enemies passed through
      for (const m of state.monsters) {
        const mdx = hero.pos.x - m.pos.x;
        const mdy = hero.pos.y - m.pos.y;
        const dist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (dist < hero.radius + m.radius + 20) {
          m.hp -= barbarianAbilities.rageDashDamage * dt * 10 * damageMultiplier * critMultiplier; // Apply damage over time during dash
        }
      }
    }
  } else {
    if (dx !== 0 || dy !== 0) {
      const len = Math.sqrt(dx * dx + dy * dy);
      hero.pos.x += (dx / len) * abilities.speed * dt;
      hero.pos.y += (dy / len) * abilities.speed * dt;
    }
  }

  // Clamp to screen
  hero.pos.x = Math.max(hero.radius, Math.min(state.canvasWidth - hero.radius, hero.pos.x));
  hero.pos.y = Math.max(hero.radius, Math.min(state.canvasHeight - hero.radius, hero.pos.y));
};
