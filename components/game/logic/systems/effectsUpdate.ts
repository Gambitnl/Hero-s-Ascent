
import { GameState } from '../../types';

export const updateEffects = (state: GameState, dt: number) => {
  // 6. Update Effects
  for (let i = state.effects.length - 1; i >= 0; i--) {
    const effect = state.effects[i];
    effect.timer += dt;

    if (effect.type === 'blackHole' && effect.radius) {
      // Black hole logic
      for (const m of state.monsters) {
        if (m.isFriendly) continue;

        const dx = effect.pos.x - m.pos.x;
        const dy = effect.pos.y - m.pos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < effect.radius * 0.3) {
          // Instant kill inside core
          if (!m.isBoss) {
            m.hp = 0;
            // No money drop for black hole kills
            m.isBoss = false; // Hack to prevent boss money drop if it was a boss (but bosses are immune)
          }
        } else if (dist < effect.radius) {
          // Slow and damage near
          m.speed = Math.max(10, m.speed - 100 * dt);
          m.hp -= 5 * dt;

          // Pull towards center
          m.pos.x += (dx / dist) * 50 * dt;
          m.pos.y += (dy / dist) * 50 * dt;
        }
      }
    }

    if (effect.timer >= effect.maxTimer) {
      state.effects.splice(i, 1);
    }
  }

  // 7. Update Rupture Paths
  for (let i = state.rupturePaths.length - 1; i >= 0; i--) {
    const path = state.rupturePaths[i];
    path.timer -= dt;
    if (path.timer <= 0) {
      state.rupturePaths.splice(i, 1);
    } else {
      // Damage and slow enemies on the path
      for (const m of state.monsters) {
        if (m.isFriendly) continue;
        const l2 = (path.end.x - path.start.x) ** 2 + (path.end.y - path.start.y) ** 2;
        let t = ((m.pos.x - path.start.x) * (path.end.x - path.start.x) + (m.pos.y - path.start.y) * (path.end.y - path.start.y)) / l2;
        t = Math.max(0, Math.min(1, t));
        const projX = path.start.x + t * (path.end.x - path.start.x);
        const projY = path.start.y + t * (path.end.y - path.start.y);
        const dist = Math.sqrt((m.pos.x - projX) ** 2 + (m.pos.y - projY) ** 2);

        if (dist <= m.radius + 30) {
          m.hp -= (path.damage * 0.2) * dt; // Continuous small damage
          m.speed = Math.max(10, m.speed - 50 * dt); // Slow down
        }
      }
    }
  }

  // 8. Update Damage Texts
  for (let i = state.damageTexts.length - 1; i >= 0; i--) {
    const dtText = state.damageTexts[i];
    dtText.timer -= dt;
    dtText.pos.y -= 20 * dt; // Float up
    if (dtText.timer <= 0) {
      state.damageTexts.splice(i, 1);
    }
  }
};
