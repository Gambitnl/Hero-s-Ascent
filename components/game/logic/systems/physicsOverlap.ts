
import { GameState } from '../../types';

export const resolveOverlaps = (state: GameState) => {
  const { hero } = state;

  // 5.1 Resolve Overlaps (Solid Bodies)
  for (let i = 0; i < state.monsters.length; i++) {
    const m1 = state.monsters[i];

    // Push apart from other monsters
    for (let j = i + 1; j < state.monsters.length; j++) {
      const m2 = state.monsters[j];
      let dx = m2.pos.x - m1.pos.x;
      let dy = m2.pos.y - m1.pos.y;
      let dist = Math.sqrt(dx * dx + dy * dy);
      const minDist = m1.radius + m2.radius;

      if (dist === 0) {
        dx = Math.random() - 0.5;
        dy = Math.random() - 0.5;
        dist = Math.sqrt(dx * dx + dy * dy);
      }

      if (dist < minDist) {
        const overlap = minDist - dist;
        const pushX = (dx / dist) * overlap;
        const pushY = (dy / dist) * overlap;
        if (m1.isInert && m2.isInert) {
          // Both are inert, do nothing
        } else if (m1.isInert) {
          // m1 is inert, push m2 away fully
          m2.pos.x += pushX;
          m2.pos.y += pushY;
        } else if (m2.isInert) {
          // m2 is inert, push m1 away fully
          m1.pos.x -= pushX;
          m1.pos.y -= pushY;
        } else {
          // Neither is inert, push both half way
          m1.pos.x -= pushX * 0.5;
          m1.pos.y -= pushY * 0.5;
          m2.pos.x += pushX * 0.5;
          m2.pos.y += pushY * 0.5;
        }
      }
    }

    // Push apart from hero
    let dx = hero.pos.x - m1.pos.x;
    let dy = hero.pos.y - m1.pos.y;
    let dist = Math.sqrt(dx * dx + dy * dy);
    const minDist = hero.radius + m1.radius;

    if (dist === 0) {
      dx = Math.random() - 0.5;
      dy = Math.random() - 0.5;
      dist = Math.sqrt(dx * dx + dy * dy);
    }

    if (dist < minDist) {
      const overlap = minDist - dist;
      const pushX = (dx / dist) * overlap;
      const pushY = (dy / dist) * overlap;
      if (m1.isInert) {
        // Monster is inert, only push hero
        hero.pos.x += pushX;
        hero.pos.y += pushY;
      } else {
        // Otherwise push both
        hero.pos.x += pushX * 0.5;
        hero.pos.y += pushY * 0.5;
        m1.pos.x -= pushX * 0.5;
        m1.pos.y -= pushY * 0.5;
      }
    }

    // Clamp monster to screen
    m1.pos.x = Math.max(m1.radius, Math.min(state.canvasWidth - m1.radius, m1.pos.x));
    m1.pos.y = Math.max(m1.radius, Math.min(state.canvasHeight - m1.radius, m1.pos.y));
  }

  // Clamp hero to screen again after resolving overlaps
  hero.pos.x = Math.max(hero.radius, Math.min(state.canvasWidth - hero.radius, hero.pos.x));
  hero.pos.y = Math.max(hero.radius, Math.min(state.canvasHeight - hero.radius, hero.pos.y));
};
