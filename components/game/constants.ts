import { Abilities, Gadgets, Inventory, BarbarianAbilities, TeleporterAbilities, Hero } from './types';

export const INITIAL_ABILITIES: Abilities = {
  projectileCount: 1,
  spreadAngle: Math.PI / 12, // 15 degrees
  maxPierce: 1,
  fireRate: 1.5,
  damage: 10,
  speed: 200, // pixels per second
  arrowRainTimer: 0,
  arrowRainCooldown: 15,
  arrowRainActiveTimer: 0,
  loveArrowTimer: 0,
  loveArrowCooldown: 30,
};

export const INITIAL_GADGETS: Gadgets = {
  maxHpBonus: 0,
  speedBonus: 0,
  moneyMultiplier: 1,
  pickupRadiusBonus: 0,
  cooldownReduction: 0,
  critChance: 0,
};

export const INITIAL_INVENTORY: Inventory = {
  healthPotions: 0,
  attackPotions: 0,
  armorUpgrades: 0,
  manaPotions: 0,
  invulnerabilityPotions: 0,
  maxManaUpgrades: 0,
};

export const INITIAL_BARBARIAN_ABILITIES: BarbarianAbilities = {
  sweepingStrikeDamage: 20,
  sweepingStrikeCooldown: 2,
  sweepingStrikeTimer: 0,
  sweepingRoundDamage: 40,
  sweepingRoundCooldown: 5,
  sweepingRoundTimer: 0,
  ruptureDamage: 30,
  ruptureCooldown: 15,
  ruptureTimer: 0,
  rageDashDamage: 10,
  rageDashCooldown: 10,
  rageDashTimer: 0,
  isDashing: false,
  dashTarget: null,
  dashTimer: 0,
  dashDuration: 0.3,
};

export const INITIAL_TELEPORTER_ABILITIES: TeleporterAbilities = {
  boomerangDamage: 10,
  boomerangCooldown: 1.5,
  boomerangTimer: 0,
  boomerangCount: 2,

  blackHoleCooldown: 7,
  blackHoleTimer: 0,
  blackHoleDuration: 5,
  blackHoleRadius: 100,

  dimensionDoorCooldown: 13,
  dimensionDoorTimer: 0,
  dimensionDoorDamage: 30,

  teleportAllyCooldown: 30,
  teleportAllyTimer: 0,
};

export const createInitialHero = (gadgets: Gadgets = INITIAL_GADGETS, inventory: Inventory = INITIAL_INVENTORY, width: number = 800, height: number = 600): Hero => ({
  pos: { x: width / 2, y: height / 2 },
  radius: 15,
  speed: INITIAL_ABILITIES.speed + gadgets.speedBonus,
  hp: 100 + gadgets.maxHpBonus,
  maxHp: 100 + gadgets.maxHpBonus,
  mana: 50 + inventory.maxManaUpgrades * 20,
  maxMana: 50 + inventory.maxManaUpgrades * 20,
  armor: inventory.armorUpgrades * 5,
  lastAttackTime: 0,
});

export const getLevelMonsters = (level: number) => level === 5 ? 1 : 10 + level * 5;
export const getSpawnInterval = (level: number) => Math.max(0.2, 1.5 - level * 0.1);
