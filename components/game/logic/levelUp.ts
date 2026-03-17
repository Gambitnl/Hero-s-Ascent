import { GameState, LevelUpChoice } from '../types';

export const applyLevelUp = (state: GameState) => {
  state.level++;
  state.hero.hp = state.hero.maxHp; // Heal on level up
  state.status = 'level_up';
  
  const choices: LevelUpChoice[] = [];
  
  if (state.archetype === 'archer') {
    choices.push({
      id: 'proj_count',
      title: 'Extra Projectile',
      description: 'Fires an additional projectile.',
      apply: (s) => { s.abilities.projectileCount += 1; }
    });
    choices.push({
      id: 'pierce',
      title: 'Piercing Rounds',
      description: 'Shots pass through an additional enemy.',
      apply: (s) => { s.abilities.maxPierce += 1; }
    });
    choices.push({
      id: 'fire_rate',
      title: 'Rapid Fire',
      description: 'Increases attack speed.',
      apply: (s) => { s.abilities.fireRate += 0.5; }
    });
    choices.push({
      id: 'damage',
      title: 'Heavy Caliber',
      description: 'Increases damage by 5.',
      apply: (s) => { s.abilities.damage += 5; }
    });
    choices.push({
      id: 'arrow_rain_cd',
      title: 'Storm Caller',
      description: 'Reduces Arrow Rain cooldown by 2s.',
      apply: (s) => { s.abilities.arrowRainCooldown = Math.max(5, s.abilities.arrowRainCooldown - 2); }
    });
    choices.push({
      id: 'love_arrow_cd',
      title: 'Cupid\'s Grace',
      description: 'Reduces Love Arrow cooldown by 2s.',
      apply: (s) => { s.abilities.loveArrowCooldown = Math.max(3, s.abilities.loveArrowCooldown - 2); }
    });
  } else if (state.archetype === 'barbarian') {
    choices.push({
      id: 'barb_strike_dmg',
      title: 'Stronger Strike',
      description: 'Increases Sweeping Strike damage by 10.',
      apply: (s) => { s.barbarianAbilities.sweepingStrikeDamage += 10; }
    });
    choices.push({
      id: 'barb_strike_cd',
      title: 'Faster Strike',
      description: 'Reduces Sweeping Strike cooldown by 0.2s.',
      apply: (s) => { s.barbarianAbilities.sweepingStrikeCooldown = Math.max(0.2, s.barbarianAbilities.sweepingStrikeCooldown - 0.2); }
    });
    choices.push({
      id: 'barb_round_dmg',
      title: 'Devastating Round',
      description: 'Increases Sweeping Round damage by 20.',
      apply: (s) => { s.barbarianAbilities.sweepingRoundDamage += 20; }
    });
    choices.push({
      id: 'barb_rupture_dmg',
      title: 'Earthshatter',
      description: 'Increases Rupture damage by 30.',
      apply: (s) => { s.barbarianAbilities.ruptureDamage += 30; }
    });
    choices.push({
      id: 'barb_dash_dmg',
      title: 'Furious Dash',
      description: 'Increases Rage Dash damage by 15.',
      apply: (s) => { s.barbarianAbilities.rageDashDamage += 15; }
    });
  } else if (state.archetype === 'teleporter') {
    choices.push({
      id: 'tp_boomerang_count',
      title: 'More Boomerangs',
      description: 'Throws an additional Black Boomerang, but reduces damage by 10%.',
      apply: (s) => { 
        s.teleporterAbilities.boomerangCount += 1; 
        s.teleporterAbilities.boomerangDamage *= 0.9;
      }
    });
    choices.push({
      id: 'tp_blackhole_radius',
      title: 'Event Horizon',
      description: 'Increases Black Bolt radius by 20%.',
      apply: (s) => { s.teleporterAbilities.blackHoleRadius *= 1.2; }
    });
    choices.push({
      id: 'tp_blackhole_duration',
      title: 'Time Dilation',
      description: 'Increases Black Bolt duration by 2s.',
      apply: (s) => { s.teleporterAbilities.blackHoleDuration += 2; }
    });
    choices.push({
      id: 'tp_door_cd',
      title: 'Quick Step',
      description: 'Reduces Dimension Doors cooldown by 2s.',
      apply: (s) => { s.teleporterAbilities.dimensionDoorCooldown = Math.max(3, s.teleporterAbilities.dimensionDoorCooldown - 2); }
    });
    choices.push({
      id: 'tp_ally_cd',
      title: 'Summoner\'s Call',
      description: 'Reduces Teleport Ally cooldown by 5s.',
      apply: (s) => { s.teleporterAbilities.teleportAllyCooldown = Math.max(10, s.teleporterAbilities.teleportAllyCooldown - 5); }
    });
  }

  // Pick 3 random choices
  const shuffled = choices.sort(() => 0.5 - Math.random());
  state.levelUpChoices = shuffled.slice(0, 3);
};
