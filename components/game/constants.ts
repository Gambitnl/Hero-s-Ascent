
import { Abilities, Gadgets, Inventory, BarbarianAbilities, TeleporterAbilities, Hero } from './types';

// Defines the initial abilities for a hero.
export const INITIAL_ABILITIES: Abilities = {
  projectileCount: 1, // Number of projectiles fired at once.
  spreadAngle: Math.PI / 12, // The angle between projectiles, in radians (15 degrees).
  maxPierce: 1, // The maximum number of enemies a projectile can pass through.
  fireRate: 1.5, // The number of attacks per second.
  damage: 10, // The damage dealt by each projectile.
  speed: 200, // The speed of projectiles in pixels per second.
  arrowRainTimer: 0, // A timer for the arrow rain ability.
  arrowRainCooldown: 15, // The cooldown for the arrow rain ability, in seconds.
  arrowRainActiveTimer: 0, // A timer for how long the arrow rain ability is active.
  loveArrowTimer: 0, // A timer for the love arrow ability.
  loveArrowCooldown: 30, // The cooldown for the love arrow ability, in seconds.
};

// Defines the initial gadgets for a hero.
export const INITIAL_GADGETS: Gadgets = {
  maxHpBonus: 0, // Bonus to maximum health.
  speedBonus: 0, // Bonus to movement speed.
  moneyMultiplier: 1, // Multiplier for money dropped by enemies.
  pickupRadiusBonus: 0, // Bonus to the radius for picking up items.
  cooldownReduction: 0, // Percentage reduction in ability cooldowns.
  critChance: 0, // Chance of a critical hit.
};

// Defines the initial inventory for a hero.
export const INITIAL_INVENTORY: Inventory = {
  healthPotions: 0, // Number of health potions.
  attackPotions: 0, // Number of attack potions.
  armorUpgrades: 0, // Number of armor upgrades.
  manaPotions: 0, // Number of mana potions.
  invulnerabilityPotions: 0, // Number of invulnerability potions.
  maxManaUpgrades: 0, // Number of maximum mana upgrades.
};

// Defines the initial abilities for the Barbarian hero class.
export const INITIAL_BARBARIAN_ABILITIES: BarbarianAbilities = {
  sweepingStrikeDamage: 20, // Damage of the sweeping strike ability.
  sweepingStrikeCooldown: 2, // Cooldown of the sweeping strike ability, in seconds.
  sweepingStrikeTimer: 0, // Timer for the sweeping strike ability.
  sweepingRoundDamage: 40, // Damage of the sweeping round ability.
  sweepingRoundCooldown: 5, // Cooldown of the sweeping round ability, in seconds.
  sweepingRoundTimer: 0, // Timer for the sweeping round ability.
  ruptureDamage: 30, // Damage of the rupture ability.
  ruptureCooldown: 15, // Cooldown of the rupture ability, in seconds.
  ruptureTimer: 0, // Timer for the rupture ability.
  rageDashDamage: 10, // Damage of the rage dash ability.
  rageDashCooldown: 10, // Cooldown of the rage dash ability, in seconds.
  rageDashTimer: 0, // Timer for the rage dash ability.
  isDashing: false, // Whether the hero is currently dashing.
  dashTarget: null, // The target of the dash.
  dashTimer: 0, // Timer for the dash.
  dashDuration: 0.3, // Duration of the dash, in seconds.
};

// Defines the initial abilities for the Teleporter hero class.
export const INITIAL_TELEPORTER_ABILITIES: TeleporterAbilities = {
  boomerangDamage: 10, // Damage of the boomerang ability.
  boomerangCooldown: 1.5, // Cooldown of the boomerang ability, in seconds.
  boomerangTimer: 0, // Timer for the boomerang ability.
  boomerangCount: 2, // Number of boomerangs thrown.

  blackHoleCooldown: 7, // Cooldown of the black hole ability, in seconds.
  blackHoleTimer: 0, // Timer for the black hole ability.
  blackHoleDuration: 5, // Duration of the black hole, in seconds.
  blackHoleRadius: 100, // Radius of the black hole.

  dimensionDoorCooldown: 13, // Cooldown of the dimension door ability, in seconds.
  dimensionDoorTimer: 0, // Timer for the dimension door ability.
  dimensionDoorDamage: 30, // Damage of the dimension door ability.

  teleportAllyCooldown: 30, // Cooldown of the teleport ally ability, in seconds.
  teleportAllyTimer: 0, // Timer for the teleport ally ability.
};

/**
 * Creates a new hero with initial properties.
 * @param gadgets - The initial gadgets for the hero.
 * @param inventory - The initial inventory for the hero.
 * @param width - The width of the game area.
 * @param height - The height of the game area.
 * @returns A new Hero object.
 */
export const createInitialHero = (gadgets: Gadgets = INITIAL_GADGETS, inventory: Inventory = INITIAL_INVENTORY, width: number = 800, height: number = 600): Hero => ({
  pos: { x: width / 2, y: height / 2 }, // Initial position of the hero.
  radius: 15, // Radius of the hero's hitbox.
  speed: INITIAL_ABILITIES.speed + gadgets.speedBonus, // Movement speed of the hero.
  hp: 100 + gadgets.maxHpBonus, // Current health of the hero.
  maxHp: 100 + gadgets.maxHpBonus, // Maximum health of the hero.
  mana: 50 + inventory.maxManaUpgrades * 20, // Current mana of the hero.
  maxMana: 50 + inventory.maxManaUpgrades * 20, // Maximum mana of the hero.
  armor: inventory.armorUpgrades * 5, // Armor of the hero.
  lastAttackTime: 0, // The time of the hero's last attack.
});

/**
 * Gets the number of monsters for a given level.
 * @param level - The current level.
 * @returns The number of monsters for the level.
 */
export const getLevelMonsters = (level: number) => level === 5 ? 1 : 10 + level * 5;

/**
 * Gets the spawn interval for monsters for a given level.
 * @param level - The current level.
 * @returns The spawn interval for monsters, in seconds.
 */
export const getSpawnInterval = (level: number) => Math.max(0.2, 1.5 - level * 0.1);
