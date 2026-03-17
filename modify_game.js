const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'components', 'Game.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const lines = content.split('\n');

// Find the start and end of the types/constants section
const startIndex = lines.findIndex(line => line.includes('// --- Game Constants & Types ---'));
const endIndex = lines.findIndex(line => line.includes('export default function Game() {'));

if (startIndex !== -1 && endIndex !== -1) {
  const newContent = [
    ...lines.slice(0, startIndex),
    `import { `,
    `  Vector2, Hero, Projectile, MoneyDrop, Monster, Abilities, Archetype, `,
    `  BarbarianAbilities, RupturePath, Effect, LevelUpChoice, Gadgets, Inventory, GameState `,
    `} from './game/types';`,
    `import { `,
    `  INITIAL_ABILITIES, INITIAL_GADGETS, INITIAL_INVENTORY, INITIAL_BARBARIAN_ABILITIES, `,
    `  createInitialHero, getLevelMonsters, getSpawnInterval `,
    `} from './game/constants';`,
    ``,
    `let nextId = 1;`,
    `const getId = () => nextId++;`,
    ``,
    ...lines.slice(endIndex)
  ].join('\n');

  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log('Successfully replaced types and constants with imports.');
} else {
  console.error('Could not find start or end index.');
}
