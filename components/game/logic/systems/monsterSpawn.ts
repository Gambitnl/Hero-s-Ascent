
import { GameState } from '../../types';
import { getId } from '../../utils/id';

export const spawnMonsters = (state: GameState, dt: number) => {
  if (!state.devSettings.enabled) {
    state.spawnTimer += dt;
    if (state.monstersToSpawn > 0 && state.spawnTimer >= state.spawnInterval) {
      state.spawnTimer = 0;
      state.monstersToSpawn--;

      // Spawn at edges
      let x, y;
      if (Math.random() < 0.5) {
        x = Math.random() < 0.5 ? -20 : state.canvasWidth + 20;
        y = Math.random() * state.canvasHeight;
      } else {
        x = Math.random() * state.canvasWidth;
        y = Math.random() < 0.5 ? -20 : state.canvasHeight + 20;
      }

      if (state.level === 5 && state.monstersToSpawn === 0) {
        // Spawn Boss
        state.monsters.push({
          id: getId(),
          pos: { x: state.canvasWidth / 2, y: -50 },
          radius: 30,
          speed: 40,
          hp: 1500,
          maxHp: 1500,
          damage: 30,
          color: '#4c1d95', // Deep purple
          isBoss: true,
          attackTimer: 0,
        });
        state.bossMessageTimer = 5;
      } else {
        const rand = Math.random();
        let type: 'normal' | 'swarm' | 'tank' | 'ranged' = 'normal';

        if (state.level >= 2 && rand < 0.2) {
          type = 'swarm';
        } else if (state.level >= 3 && rand < 0.35) {
          type = 'tank';
        } else if (state.level >= 4 && rand < 0.5) {
          type = 'ranged';
        }

        let hp = 20 + state.level * 10;
        let speed = 50 + state.level * 5;
        let radius = 12 + Math.random() * 5;
        let damage = 10 + state.level * 2;
        let color = '#ef4444'; // Default red

        if (type === 'swarm') {
          hp = hp * 0.4;
          speed = speed * 1.5;
          radius = 8;
          damage = damage * 0.5;
          color = '#facc15'; // Yellow
        } else if (type === 'tank') {
          hp = hp * 3;
          speed = speed * 0.5;
          radius = 20;
          damage = damage * 1.5;
          color = '#475569'; // Slate
        } else if (type === 'ranged') {
          hp = hp * 0.8;
          speed = speed * 0.8;
          color = '#10b981'; // Emerald
        } else {
          const colors = ['#ef4444', '#f97316', '#8b5cf6', '#ec4899'];
          color = colors[(state.level - 1) % colors.length];
        }

        state.monsters.push({
          id: getId(),
          pos: { x, y },
          radius,
          speed,
          hp,
          maxHp: hp,
          damage,
          color,
          type,
          attackTimer: 0,
        });

        if (type === 'swarm') {
          // Spawn a few more nearby
          for (let i = 0; i < 3; i++) {
            state.monsters.push({
              id: getId(),
              pos: { x: x + (Math.random() - 0.5) * 40, y: y + (Math.random() - 0.5) * 40 },
              radius,
              speed,
              hp,
              maxHp: hp,
              damage,
              color,
              type,
              attackTimer: 0,
            });
          }
        }
      }
    }
  }
};
