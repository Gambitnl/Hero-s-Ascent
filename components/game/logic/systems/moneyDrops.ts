
import { GameState } from '../../types';

export const updateMoneyDrops = (state: GameState) => {
  const { hero } = state;

  for (let i = state.moneyDrops.length - 1; i >= 0; i--) {
    const drop = state.moneyDrops[i];
    const dx = hero.pos.x - drop.pos.x;
    const dy = hero.pos.y - drop.pos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < hero.radius + drop.radius + state.gadgets.pickupRadiusBonus) {
      state.money += drop.amount;
      state.moneyDrops.splice(i, 1);
      if (typeof window !== 'undefined') {
        localStorage.setItem('hero_ascent_money', state.money.toString());
      }
    }
  }
};
