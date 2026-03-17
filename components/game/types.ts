/**
 * Represents a 2D vector with x and y components.
 */
export type Vector2 = { x: number; y: number };

/**
 * Defines the properties of the player's hero character.
 */
export interface Hero {
  pos: Vector2; // The hero's current position.
  radius: number; // The hero's collision radius.
  speed: number; // The hero's movement speed.
  hp: number; // The hero's current health points.
  maxHp: number; // The hero's maximum health points.
  mana: number; // The hero's current mana.
  maxMana: number; // The hero's maximum mana.
  armor: number; // The hero's armor value, reducing incoming damage.
  lastAttackTime: number; // The timestamp of the hero's last attack.
}

/**
 * Represents a projectile in the game, such as an arrow or boomerang.
 */
export interface Projectile {
  id: number; // A unique identifier for the projectile.
  pos: Vector2; // The projectile's current position.
  vel: Vector2; // The projectile's velocity vector.
  radius: number; // The projectile's collision radius.
  damage: number; // The amount of damage the projectile inflicts.
  pierceCount: number; // How many monsters the projectile has already pierced.
  maxPierce: number; // The maximum number of monsters the projectile can pierce.
  hitMonsters: Set<number>; // A set of monster IDs that have already been hit by this projectile.
  isEnemy?: boolean; // If true, this projectile was fired by an enemy.
  isLoveArrow?: boolean; // If true, this is a special "love arrow" that charms monsters.
  isArrow?: boolean; // If true, this is a standard arrow.
  isBoomerang?: boolean; // If true, this is a boomerang that returns to the hero.
  targetPos?: Vector2; // The target position for projectiles like boomerangs.
  returning?: boolean; // For boomerangs, true if it's on its way back.
}

/**
 * Represents a drop of money from a defeated monster.
 */
export interface MoneyDrop {
  id: number; // A unique identifier for the money drop.
  pos: Vector2; // The position of the money drop.
  amount: number; // The amount of money in the drop.
  radius: number; // The pickup radius for the money drop.
}

/**
 * Defines the properties of a monster character.
 */
export interface Monster {
  id: number; // A unique identifier for the monster.
  pos: Vector2; // The monster's current position.
  radius: number; // The monster's collision radius.
  speed: number; // The monster's movement speed.
  hp: number; // The monster's current health points.
  maxHp: number; // The monster's maximum health points.
  damage: number; // The damage the monster inflicts on contact.
  color: string; // The monster's color, often used for visual distinction.
  isBoss?: boolean; // If true, this is a powerful boss monster.
  isCharmed?: boolean; // If true, this monster is temporarily fighting for the hero.
  charmedTimer?: number; // A timer for how long the charmed effect lasts.
  type?: 'normal' | 'swarm' | 'tank' | 'ranged' | 'boss'; // The category of the monster.
  attackTimer?: number; // A timer for ranged monster attacks.
  isFriendly?: boolean; // If true, this is an allied unit.
  allyType?: string; // The type of ally (e.g., from a specific ability).
  expireTimer?: number; // A timer for how long an allied unit persists.
  isInert?: boolean; // A debug flag to make the monster inactive.
  isImmune?: boolean; // A debug flag to make the monster immune to damage.
  isStopAttacking?: boolean; // A debug flag to prevent the monster from attacking.
}

/**
 * Defines the abilities for the 'archer' archetype.
 */
export interface Abilities {
  projectileCount: number; // The number of projectiles fired in a single attack.
  spreadAngle: number; // The angle (in radians) at which projectiles spread.
  maxPierce: number; // The maximum number of monsters a projectile can pierce.
  fireRate: number; // The number of attacks per second.
  damage: number; // The base damage of each projectile.
  speed: number; // The speed of the projectiles.
  arrowRainTimer: number; // A timer for the "arrow rain" ability cooldown.
  arrowRainCooldown: number; // The total cooldown time for "arrow rain".
  arrowRainActiveTimer?: number; // A timer for how long the "arrow rain" effect is active.
  loveArrowTimer: number; // A timer for the "love arrow" ability cooldown.
  loveArrowCooldown: number; // The total cooldown time for "love arrow".
}

/**
 * Defines the available character classes.
 */
export type Archetype = 'archer' | 'barbarian' | 'teleporter';

/**
 * Defines the abilities for the 'barbarian' archetype.
 */
export interface BarbarianAbilities {
  sweepingStrikeDamage: number;
  sweepingStrikeCooldown: number;
  sweepingStrikeTimer: number;

  sweepingRoundDamage: number;
  sweepingRoundCooldown: number;
  sweepingRoundTimer: number;

  ruptureDamage: number;
  ruptureCooldown: number;
  ruptureTimer: number;

  rageDashDamage: number;
  rageDashCooldown: number;
  rageDashTimer: number;
  isDashing: boolean;
  dashTarget: Vector2 | null;
  dashTimer: number;
  dashDuration: number;
}

/**
 * Represents the visual path of the barbarian's "rupture" ability.
 */
export interface RupturePath {
  id: number;
  start: Vector2;
  end: Vector2;
  timer: number;
  damage: number;
}

/**
 * Represents a generic visual effect in the game.
 */
export interface Effect {
  id: number; // A unique identifier for the effect.
  type: 'slash' | 'circle' | 'dash' | 'rupture' | 'blackHole'; // The type of visual effect.
  pos: Vector2; // The position of the effect.
  angle?: number; // The angle of the effect (e.g., for a slash).
  radius?: number; // The radius of the effect (e.g., for a circle).
  timer: number; // The remaining duration of the effect.
  maxTimer: number; // The initial duration of the effect.
  color?: string; // The color of the effect.
}

/**
 * Represents a single choice presented to the player during a level-up.
 */
export interface LevelUpChoice {
  id: string; // A unique identifier for the choice.
  title: string; // The title of the upgrade.
  description: string; // A description of what the upgrade does.
  apply: (state: GameState) => void; // The function that applies the upgrade to the game state.
}

/**
 * Represents passive bonuses gained from gadgets or items.
 */
export interface Gadgets {
  maxHpBonus: number;
  speedBonus: number;
  moneyMultiplier: number;
  pickupRadiusBonus: number;
  cooldownReduction: number;
  critChance: number;
}

/**
 * Represents the player's inventory of consumable items.
 */
export interface Inventory {
  healthPotions: number;
  attackPotions: number;
  armorUpgrades: number;
  manaPotions: number;
  invulnerabilityPotions: number;
  maxManaUpgrades: number;
}

/**
 * Defines the abilities for the 'teleporter' archetype.
 */
export interface TeleporterAbilities {
  boomerangDamage: number;
  boomerangCooldown: number;
  boomerangTimer: number;
  boomerangCount: number;

  blackHoleCooldown: number;
  blackHoleTimer: number;
  blackHoleDuration: number;
  blackHoleRadius: number;

  dimensionDoorCooldown: number;
  dimensionDoorTimer: number;
  dimensionDoorDamage: number;

  teleportAllyCooldown: number;
  teleportAllyTimer: number;
}

/**
 * Represents floating text that shows damage numbers or other information.
 */
export interface DamageText {
  id: number;
  pos: Vector2;
  text: string;
  timer: number;
  color: string;
}

/**
 * Contains settings for developers to debug the game.
 */
export interface DevSettings {
  enabled: boolean;
  godMode: boolean;
  spawnInert: boolean;
  spawnImmune: boolean;
  spawnStopAttacking: boolean;
}

/**
 * The main state object for the entire game. It holds all the data needed to represent the current game session.
 */
export interface GameState {
  status: 'start' | 'playing' | 'level_complete' | 'game_over' | 'paused' | 'shop' | 'level_up';
  level: number;
  hero: Hero;
  projectiles: Projectile[];
  monsters: Monster[];
  moneyDrops: MoneyDrop[];
  monstersToSpawn: number;
  spawnTimer: number;
  spawnInterval: number;
  abilities: Abilities;
  barbarianAbilities: BarbarianAbilities;
  teleporterAbilities: TeleporterAbilities;
  rupturePaths: RupturePath[];
  effects: Effect[];
  damageTexts: DamageText[];
  score: number;
  money: number;
  mousePos: Vector2;
  mouseDown: { left: boolean; right: boolean };
  keys: Record<string, boolean>;
  newAbilityMessage: string | null;
  archetype: Archetype;
  unlockedArchetypes: Archetype[];
  levelUpChoices: LevelUpChoice[];
  gadgets: Gadgets;
  inventory: Inventory;
  attackBoostTimer: number;
  invulnerabilityTimer: number;
  potionCooldown: number;
  bossMessageTimer: number;
  canvasWidth: number;
  canvasHeight: number;
  devSettings: DevSettings;
}
