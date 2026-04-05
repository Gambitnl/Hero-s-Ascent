
// Import React and necessary components and types.
import React from 'react';
import { GameState, Monster } from '../types';
import { getId } from '../utils/id';
import { getLevelMonsters, getSpawnInterval } from '../constants';

/**
 * Props for the DevPanel component.
 * @param gameState - The current state of the game.
 * @param setGameState - Function to update the game state.
 */
interface DevPanelProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

/**
 * A panel with developer tools for debugging and testing the game.
 */
export function DevPanel({ gameState, setGameState }: DevPanelProps) {
  const { devSettings } = gameState;

  /**
   * Toggles the developer mode on and off.
   * When enabling, it resets the current level and player state.
   * When disabling, it resets the spawn timer to start spawning monsters.
   */
  const toggleDevMode = () => {
    setGameState(prev => {
      const isEnabling = !prev.devSettings.enabled;
      if (isEnabling) {
        // When enabling dev mode, reset the current level
        return {
          ...prev,
          devSettings: { ...prev.devSettings, enabled: true },
          status: 'playing', // Keep status as playing to view the game world
          monsters: [],
          projectiles: [],
          moneyDrops: [],
          effects: [],
          damageTexts: [],
          monstersToSpawn: getLevelMonsters(prev.level),
          spawnTimer: 0,
          spawnInterval: getSpawnInterval(prev.level),
          hero: {
            ...prev.hero,
            pos: { x: prev.canvasWidth / 2, y: prev.canvasHeight / 2 },
            hp: prev.hero.maxHp, // Also restore health
          },
          bossMessageTimer: 0,
        };
      } else {
        // When disabling dev mode, allow the level to start spawning monsters
        return {
          ...prev,
          devSettings: { ...prev.devSettings, enabled: false },
          spawnTimer: 0, // Reset spawn timer to begin spawning
        };
      }
    });
  };

  /**
   * Toggles a specific developer setting.
   * @param key - The key of the setting to toggle.
   */
  const toggleSetting = (key: keyof typeof devSettings) => {
    setGameState(prev => ({
      ...prev,
      devSettings: { ...prev.devSettings, [key]: !prev.devSettings[key] }
    }));
  };

  /**
   * Spawns a new entity (monster or ally) at the current mouse position.
   * @param type - The type of entity to spawn.
   * @param isFriendly - Whether the entity should be friendly (ally) or not (enemy).
   */
  const spawnEntity = (type: 'normal' | 'swarm' | 'tank' | 'ranged' | 'boss', isFriendly: boolean) => {
    setGameState(prev => {
      const newMonster: Monster = {
        id: getId(),
        pos: { x: prev.mousePos.x, y: prev.mousePos.y },
        radius: type === 'tank' ? 20 : type === 'boss' ? 30 : 12,
        speed: type === 'swarm' ? 150 : type === 'tank' ? 50 : type === 'boss' ? 70 : 100,
        hp: type === 'tank' ? 100 : type === 'boss' ? 500 : 30,
        maxHp: type === 'tank' ? 100 : type === 'boss' ? 500 : 30,
        damage: type === 'tank' ? 20 : type === 'boss' ? 30 : 10,
        color: isFriendly ? '#3b82f6' : type === 'tank' ? '#ef4444' : type === 'swarm' ? '#eab308' : type === 'ranged' ? '#a855f7' : type === 'boss' ? '#b91c1c' : '#22c55e',
        type,
        isBoss: type === 'boss',
        isFriendly,
        attackTimer: 0,
        isInert: false,
        isImmune: false,
        isStopAttacking: false,
      };
      return {
        ...prev,
        monsters: [...prev.monsters, newMonster]
      };
    });
  };

  const despawnEntity = (monsterId: number) => {
    setGameState(prev => ({
      ...prev,
      monsters: prev.monsters.filter(m => m.id !== monsterId),
    }));
  };

  const toggleMonsterProperty = (monsterId: number, key: 'isInert' | 'isImmune' | 'isStopAttacking') => {
    setGameState(prev => ({
      ...prev,
      monsters: prev.monsters.map(m =>
        m.id === monsterId ? { ...m, [key]: !m[key] } : m
      ),
    }));
  };

  return (
    <div className="flex flex-col gap-4 text-sm w-full">
      {/* Button to toggle developer mode */}
      <button 
        onClick={toggleDevMode}
        className={`px-3 py-2 rounded font-bold transition-colors ${devSettings.enabled ? 'bg-purple-600 text-white' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'}`}
      >
        {devSettings.enabled ? 'Dev Mode: ON' : 'Dev Mode: OFF'}
      </button>

      {/* Render the dev panel content only if dev mode is enabled */}
      {devSettings.enabled && (
        <div className="flex flex-col gap-4 bg-neutral-900/80 p-4 rounded border border-purple-500/30">
          
          {/* Toggles for various entity behaviors */}
          <div className="flex flex-col gap-2">
            <h3 className="text-purple-400 font-bold border-b border-purple-500/30 pb-1">Toggles</h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={devSettings.godMode} onChange={() => toggleSetting('godMode')} className="accent-purple-500" />
              <span className="text-neutral-300">God Mode (Player invincible)</span>
            </label>
          </div>

          {/* Buttons to spawn different types of enemies */}
          <div className="flex flex-col gap-2">
            <h3 className="text-purple-400 font-bold border-b border-purple-500/30 pb-1">Spawn Enemy (at mouse)</h3>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => spawnEntity('normal', false)} className="bg-green-600/20 hover:bg-green-600/40 text-green-400 py-1 rounded border border-green-600/30">Normal</button>
              <button onClick={() => spawnEntity('swarm', false)} className="bg-yellow-600/20 hover:bg-yellow-600/40 text-yellow-400 py-1 rounded border border-yellow-600/30">Swarm</button>
              <button onClick={() => spawnEntity('tank', false)} className="bg-red-600/20 hover:bg-red-600/40 text-red-400 py-1 rounded border border-red-600/30">Tank</button>
              <button onClick={() => spawnEntity('ranged', false)} className="bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 py-1 rounded border border-purple-600/30">Ranged</button>
              <button onClick={() => spawnEntity('boss', false)} className="bg-red-800/20 hover:bg-red-800/40 text-red-500 py-1 rounded border border-red-800/30 col-span-2">Boss</button>
            </div>
          </div>

          {/* Buttons to spawn different types of allies */}
          <div className="flex flex-col gap-2">
            <h3 className="text-purple-400 font-bold border-b border-purple-500/30 pb-1">Spawn Ally (at mouse)</h3>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => spawnEntity('normal', true)} className="bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 py-1 rounded border border-blue-600/30">Normal</button>
              <button onClick={() => spawnEntity('tank', true)} className="bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 py-1 rounded border border-blue-600/30">Tank</button>
            </div>
          </div>

          {/* Display stats for all current entities on the screen */}
          <div className="flex flex-col gap-2">
            <h3 className="text-purple-400 font-bold border-b border-purple-500/30 pb-1">Entity Stats</h3>
            <div className="max-h-48 overflow-y-auto pr-2 flex flex-col gap-2">
              {gameState.monsters.length === 0 && <span className="text-neutral-500 italic">No entities</span>}
              {gameState.monsters.map(m => (
                <div key={m.id} className="bg-neutral-950 p-2 rounded border border-neutral-800 text-xs font-mono flex flex-col gap-1">
                  <div className="flex justify-between">
                    <span style={{color: m.color}}>{m.isFriendly ? 'Ally' : 'Enemy'} {m.type || 'normal'}</span>
                    <div className="flex items-center">
                      <span className="text-neutral-500 mr-2">ID: {m.id}</span>
                      <button onClick={() => despawnEntity(m.id)} className="text-red-500 hover:text-red-400 font-bold">X</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-x-2">
                    <span>HP: {Math.ceil(m.hp)}/{m.maxHp}</span>
                    <span>Dmg: {m.damage}</span>
                    <span>Spd: {m.speed}</span>
                    <span>Rad: {m.radius}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-x-2 mt-1">
                    <label className="flex items-center gap-1 cursor-pointer text-neutral-400">
                      <input type="checkbox" checked={m.isInert || false} onChange={() => toggleMonsterProperty(m.id, 'isInert')} className="accent-purple-500 w-3 h-3" />
                      <span>Inert</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer text-neutral-400">
                      <input type="checkbox" checked={m.isImmune || false} onChange={() => toggleMonsterProperty(m.id, 'isImmune')} className="accent-purple-500 w-3 h-3" />
                      <span>Immune</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer text-neutral-400">
                      <input type="checkbox" checked={m.isStopAttacking || false} onChange={() => toggleMonsterProperty(m.id, 'isStopAttacking')} className="accent-purple-500 w-3 h-3" />
                      <span>No-Atk</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
