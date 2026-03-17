export type Vector2 = { x: number; y: number };

export interface Hero {
  pos: Vector2;
  radius: number;
  speed: number;
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  armor: number;
  lastAttackTime: number;
}

export interface Projectile {
  id: number;
  pos: Vector2;
  vel: Vector2;
  radius: number;
  damage: number;
  pierceCount: number;
  maxPierce: number;
  hitMonsters: Set<number>; // IDs of monsters already hit
  isEnemy?: boolean;
  isLoveArrow?: boolean;
  isArrow?: boolean;
  isBoomerang?: boolean;
  targetPos?: Vector2;
  returning?: boolean;
}

export interface MoneyDrop {
  id: number;
  pos: Vector2;
  amount: number;
  radius: number;
}

export interface Monster {
  id: number;
  pos: Vector2;
  radius: number;
  speed: number;
  hp: number;
  maxHp: number;
  damage: number;
  color: string;
  isBoss?: boolean;
  isCharmed?: boolean;
  charmedTimer?: number;
  type?: 'normal' | 'swarm' | 'tank' | 'ranged';
  attackTimer?: number;
  isFriendly?: boolean;
  allyType?: string;
  expireTimer?: number;
}

export interface Abilities {
  projectileCount: number;
  spreadAngle: number; // in radians
  maxPierce: number;
  fireRate: number; // shots per second
  damage: number;
  speed: number;
  arrowRainTimer: number;
  arrowRainCooldown: number;
  arrowRainActiveTimer?: number;
  loveArrowTimer: number;
  loveArrowCooldown: number;
}

export type Archetype = 'archer' | 'barbarian' | 'teleporter';

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

export interface RupturePath {
  id: number;
  start: Vector2;
  end: Vector2;
  timer: number;
  damage: number;
}

export interface Effect {
  id: number;
  type: 'slash' | 'circle' | 'dash' | 'rupture' | 'blackHole';
  pos: Vector2;
  angle?: number;
  radius?: number;
  timer: number;
  maxTimer: number;
  color?: string;
}

export interface LevelUpChoice {
  id: string;
  title: string;
  description: string;
  apply: (state: GameState) => void;
}

export interface Gadgets {
  maxHpBonus: number;
  speedBonus: number;
  moneyMultiplier: number;
  pickupRadiusBonus: number;
  cooldownReduction: number;
  critChance: number;
}

export interface Inventory {
  healthPotions: number;
  attackPotions: number;
  armorUpgrades: number;
  manaPotions: number;
  invulnerabilityPotions: number;
  maxManaUpgrades: number;
}

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

export interface DamageText {
  id: number;
  pos: Vector2;
  text: string;
  timer: number;
  color: string;
}

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
}
