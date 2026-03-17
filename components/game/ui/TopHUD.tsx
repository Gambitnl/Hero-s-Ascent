import React from 'react';
import { GameState } from '../types';

interface TopHUDProps {
  gameState: GameState;
  pauseGame: () => void;
}

export function TopHUD({ gameState, pauseGame }: TopHUDProps) {
  return (
    <div className="shrink-0 w-full">
      <h1 className="text-2xl font-bold tracking-tight text-white mb-4">Hero&apos;s Ascent</h1>
      <div className="flex flex-col gap-3 text-sm text-neutral-400 font-mono">
        <div className="flex justify-between"><span>Level:</span> <span className="text-white">{gameState.level}</span></div>
        <div className="flex justify-between"><span>Score:</span> <span className="text-white">{gameState.score}</span></div>
        <div className="flex justify-between"><span>Money:</span> <span className="text-yellow-400">${gameState.money}</span></div>
        <div className="flex justify-between"><span>HP:</span> <span className={gameState.hero.hp < 30 ? 'text-red-400' : 'text-green-400'}>{Math.ceil(gameState.hero.hp)}/{gameState.hero.maxHp}</span></div>
        <div className="flex justify-between"><span>Mana:</span> <span className="text-blue-400">{Math.floor(gameState.hero.mana)}/{gameState.hero.maxMana}</span></div>
        <div className="flex justify-between"><span>Armor:</span> <span className="text-gray-400">{gameState.hero.armor}</span></div>
        <button onClick={pauseGame} className="mt-2 w-full px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded text-xs transition-colors">Menu</button>
      </div>
    </div>
  );
}
