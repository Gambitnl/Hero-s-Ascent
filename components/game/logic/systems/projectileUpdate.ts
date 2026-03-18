
import { GameState } from '../../types';

export const updateProjectiles = (state: GameState, dt: number) => {
  const { hero, mousePos } = state;

  for (let i = state.projectiles.length - 1; i >= 0; i--) {
    const p = state.projectiles[i];

    if (p.isBoomerang && p.targetPos) {
      const projSpeed = 400;

      if (!p.returning) {
        // Move towards targetPos
        // Guide slightly towards mousePos
        const guideSpeed = 2;
        p.targetPos.x += (mousePos.x - p.targetPos.x) * guideSpeed * dt;
        p.targetPos.y += (mousePos.y - p.targetPos.y) * guideSpeed * dt;

        const dx = p.targetPos.x - p.pos.x;
        const dy = p.targetPos.y - p.pos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 20) {
          p.returning = true;
          p.hitMonsters.clear(); // Can hit again on return
        } else {
          p.vel.x = (dx / dist) * projSpeed;
          p.vel.y = (dy / dist) * projSpeed;
        }
      } else {
        // Move towards hero
        const dx = hero.pos.x - p.pos.x;
        const dy = hero.pos.y - p.pos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < hero.radius + p.radius) {
          state.projectiles.splice(i, 1);
          continue;
        } else {
          p.vel.x = (dx / dist) * projSpeed;
          p.vel.y = (dy / dist) * projSpeed;
        }
      }
    }

    p.pos.x += p.vel.x * dt;
    p.pos.y += p.vel.y * dt;

    // Remove if off screen (except boomerangs)
    if (!p.isBoomerang && (
      p.pos.x < -100 || p.pos.x > state.canvasWidth + 100 ||
      p.pos.y < -100 || p.pos.y > state.canvasHeight + 100
    )) {
      state.projectiles.splice(i, 1);
    }
  }
};
