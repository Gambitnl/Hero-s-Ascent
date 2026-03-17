import React from 'react';
import { GameState, Monster } from '../types';
import { getId } from '../utils/id';

interface DevPanelProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

export function DevPanel({ gameState, setGameState }: DevPanelProps) {
  const { devSettings } = gameState;

  const toggleDevMode = () => {
    setGameState(prev => ({
      ...prev,
      devSettings: { ...prev.devSettings, enabled: !prev.devSettings.enabled }
    }));
  };

  const toggleSetting = (key: keyof typeof devSettings) => {
    setGameState(prev => ({
      ...prev,
      devSettings: { ...prev.devSettings, [key]: !prev.devSettings[key] }
    }));
  };

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
        isInert: prev.devSettings.spawnInert,
        isImmune: prev.devSettings.spawnImmune,
        isStopAttacking: prev.devSettings.spawnStopAttacking,
      };
      return {
        ...prev,
        monsters: [...prev.monsters, newMonster]
      };
    });
  };

  return (
    <div className="flex flex-col gap-4 text-sm w-full">
      <button 
        onClick={toggleDevMode}
        className={`px-3 py-2 rounded font-bold transition-colors ${devSettings.enabled ? 'bg-purple-600 text-white' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'}`}
      >
        {devSettings.enabled ? 'Dev Mode: ON' : 'Dev Mode: OFF'}
      </button>

      {devSettings.enabled && (
        <div className="flex flex-col gap-4 bg-neutral-900/80 p-4 rounded border border-purple-500/30">
          <div className="flex flex-col gap-2">
            <h3 className="text-purple-400 font-bold border-b border-purple-500/30 pb-1">Toggles</h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={devSettings.spawnInert} onChange={() => toggleSetting('spawnInert')} className="accent-purple-500" />
              <span className="text-neutral-300">Inert (No Movement)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={devSettings.spawnImmune} onChange={() => toggleSetting('spawnImmune')} className="accent-purple-500" />
              <span className="text-neutral-300">Immune to Damage</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={devSettings.spawnStopAttacking} onChange={() => toggleSetting('spawnStopAttacking')} className="accent-purple-500" />
              <span className="text-neutral-300">Stop Attacking</span>
            </label>
          </div>

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

          <div className="flex flex-col gap-2">
            <h3 className="text-purple-400 font-bold border-b border-purple-500/30 pb-1">Spawn Ally (at mouse)</h3>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => spawnEntity('normal', true)} className="bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 py-1 rounded border border-blue-600/30">Normal</button>
              <button onClick={() => spawnEntity('tank', true)} className="bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 py-1 rounded border border-blue-600/30">Tank</button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-purple-400 font-bold border-b border-purple-500/30 pb-1">Entity Stats</h3>
            <div className="max-h-48 overflow-y-auto pr-2 flex flex-col gap-2">
              {gameState.monsters.length === 0 && <span className="text-neutral-500 italic">No entities</span>}
              {gameState.monsters.map(m => (
                <div key={m.id} className="bg-neutral-950 p-2 rounded border border-neutral-800 text-xs font-mono flex flex-col gap-1">
                  <div className="flex justify-between">
                    <span style={{color: m.color}}>{m.isFriendly ? 'Ally' : 'Enemy'} {m.type || 'normal'}</span>
                    <span className="text-neutral-500">ID: {m.id}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-2">
                    <span>HP: {Math.ceil(m.hp)}/{m.maxHp}</span>
                    <span>Dmg: {m.damage}</span>
                    <span>Spd: {m.speed}</span>
                    <span>Rad: {m.radius}</span>
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
