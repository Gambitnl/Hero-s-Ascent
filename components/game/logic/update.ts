
import { GameState } from '../types';
import { applyLevelUp } from './levelUp';
import { updateTimers } from './systems/timers';
import { updatePotions } from './systems/potions';
import { updateHeroMovement } from './systems/heroMovement';
import { updateArcherAttacks } from './systems/archerAttacks';
import { updateBarbarianAttacks } from './systems/barbarianAttacks';
import { updateTeleporterAttacks } from './systems/teleporterAttacks';
import { updateKingAttacks } from './systems/kingAttacks';
import { updateProjectiles } from './systems/projectileUpdate';
import { spawnMonsters } from './systems/monsterSpawn';
import { updateMonsters } from './systems/monsterUpdate';
import { resolveOverlaps } from './systems/physicsOverlap';
import { updateMoneyDrops } from './systems/moneyDrops';
import { updateEffects } from './systems/effectsUpdate';

export const update = (state: GameState, dt: number) => {
  if (state.status !== 'playing') return;

  // Compute once so isCrit is consistent across all attack systems this frame
  const isCrit = Math.random() < state.gadgets.critChance;
  const critMultiplier = isCrit ? 2 : 1;
  const damageMultiplier = state.attackBoostTimer > 0 ? 2 : 1;

  updateTimers(state, dt);
  updatePotions(state);
  updateHeroMovement(state, dt, damageMultiplier, critMultiplier);

  const { archetype } = state;
  if (archetype === 'archer') {
    updateArcherAttacks(state, dt, damageMultiplier, critMultiplier);
  } else if (archetype === 'barbarian') {
    updateBarbarianAttacks(state, dt, damageMultiplier, critMultiplier);
  } else if (archetype === 'teleporter') {
    updateTeleporterAttacks(state, dt, damageMultiplier, critMultiplier);
  } else if (archetype === 'king') {
    updateKingAttacks(state, dt, damageMultiplier, critMultiplier);
  }

  updateProjectiles(state, dt);
  spawnMonsters(state, dt);
  updateMonsters(state, dt);
  resolveOverlaps(state);
  updateMoneyDrops(state);
  updateEffects(state, dt);

  // Check Level Complete
  if (state.monstersToSpawn === 0 && state.monsters.filter(m => !m.isCharmed && !m.isFriendly).length === 0) {
    state.status = 'level_complete';
    applyLevelUp(state);
  }
};
