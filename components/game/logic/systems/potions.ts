
import { GameState } from '../../types';

export const updatePotions = (state: GameState) => {
  const { hero, keys } = state;

  if (keys['1'] && state.inventory.healthPotions > 0 && state.potionCooldown <= 0) {
    hero.hp = Math.min(hero.maxHp, hero.hp + 50);
    state.inventory.healthPotions--;
    state.potionCooldown = 1;
  }
  if (keys['2'] && state.inventory.attackPotions > 0 && state.potionCooldown <= 0) {
    state.attackBoostTimer = 10;
    state.inventory.attackPotions--;
    state.potionCooldown = 1;
  }
  if (keys['3'] && state.inventory.manaPotions > 0 && state.potionCooldown <= 0) {
    hero.mana = Math.min(hero.maxMana, hero.mana + 50);
    state.inventory.manaPotions--;
    state.potionCooldown = 1;
  }
  if (keys['4'] && state.inventory.invulnerabilityPotions > 0 && state.potionCooldown <= 0) {
    state.invulnerabilityTimer = 5;
    state.inventory.invulnerabilityPotions--;
    state.potionCooldown = 1;
  }
};
