
import { GameState } from '../../types';
import { getId } from '../../utils/id';

export const updateTimers = (state: GameState, dt: number) => {
  const { hero, abilities } = state;

  // Mana Regen & Timers
  hero.mana = Math.min(hero.maxMana, hero.mana + 5 * dt);
  if (state.potionCooldown > 0) state.potionCooldown -= dt;
  if (state.attackBoostTimer > 0) state.attackBoostTimer -= dt;
  if (state.invulnerabilityTimer > 0) state.invulnerabilityTimer -= dt;
  if (state.bossMessageTimer > 0) state.bossMessageTimer -= dt;

  if (abilities.arrowRainTimer > 0) abilities.arrowRainTimer -= dt;
  if (abilities.loveArrowTimer > 0) abilities.loveArrowTimer -= dt;
  if (abilities.pirouetteTimer > 0) abilities.pirouetteTimer -= dt;

  // Arrow Rain Active Effect
  if (state.archetype === 'archer' && abilities.arrowRainActiveTimer !== undefined && abilities.arrowRainActiveTimer > 0) {
    abilities.arrowRainActiveTimer -= dt;
    if (Math.random() < 0.4) {
      const x = Math.random() * state.canvasWidth;
      state.projectiles.push({
        id: getId(),
        pos: { x, y: -50 },
        vel: { x: (Math.random() - 0.5) * 50, y: 600 },
        radius: 4,
        damage: abilities.damage * 0.5,
        pierceCount: 0,
        maxPierce: 1,
        hitMonsters: new Set(),
        isArrow: true,
      });
    }
  }
};
