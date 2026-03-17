import React from 'react';
import { GameState } from '../types';

interface BottomHUDProps {
  gameState: GameState;
}

export function BottomHUD({ gameState }: BottomHUDProps) {
  return (
    <div className={`mt-8 grid gap-4 text-sm text-neutral-500 w-full max-w-[800px] px-4 ${gameState.archetype === 'archer' ? 'grid-cols-5' : 'grid-cols-4'}`}>
      {gameState.archetype === 'archer' ? (
        <>
          <div className="bg-neutral-900/50 p-3 rounded border border-neutral-800 relative overflow-hidden">
            <span className="block text-neutral-400 mb-1">Damage</span>
            <span className="font-mono text-white">{gameState.abilities.damage}</span>
          </div>
          <div className="bg-neutral-900/50 p-3 rounded border border-neutral-800 relative overflow-hidden">
            <span className="block text-neutral-400 mb-1">Fire Rate</span>
            <span className="font-mono text-white">{gameState.abilities.fireRate.toFixed(1)}/s</span>
          </div>
          <div className="bg-neutral-900/50 p-3 rounded border border-neutral-800 relative overflow-hidden">
            <span className="block text-neutral-400 mb-1">Projectiles</span>
            <span className="font-mono text-white">{gameState.abilities.projectileCount} (Pierce: {gameState.abilities.maxPierce})</span>
          </div>
          <div className="bg-neutral-900/50 p-3 rounded border border-neutral-800 relative overflow-hidden">
            {gameState.abilities.arrowRainTimer > 0 && (
              <div className="absolute bottom-0 left-0 h-1 bg-blue-500" style={{ width: `${(gameState.abilities.arrowRainTimer / gameState.abilities.arrowRainCooldown) * 100}%` }} />
            )}
            <div className="flex justify-between items-start mb-1">
              <span className="block text-neutral-400">Rain (Q)</span>
              {gameState.abilities.arrowRainTimer > 0 && <span className="text-blue-400 font-mono text-xs">{gameState.abilities.arrowRainTimer.toFixed(1)}s</span>}
            </div>
            <span className="font-mono text-white">5s Duration</span>
          </div>
          <div className="bg-neutral-900/50 p-3 rounded border border-neutral-800 relative overflow-hidden">
            {gameState.abilities.loveArrowTimer > 0 && (
              <div className="absolute bottom-0 left-0 h-1 bg-pink-500" style={{ width: `${(gameState.abilities.loveArrowTimer / gameState.abilities.loveArrowCooldown) * 100}%` }} />
            )}
            <div className="flex justify-between items-start mb-1">
              <span className="block text-neutral-400">Love (E)</span>
              {gameState.abilities.loveArrowTimer > 0 && <span className="text-pink-400 font-mono text-xs">{gameState.abilities.loveArrowTimer.toFixed(1)}s</span>}
            </div>
            <span className="font-mono text-white">10s Charm</span>
          </div>
        </>
      ) : (
        <>
          <div className="bg-neutral-900/50 p-3 rounded border border-neutral-800 relative overflow-hidden">
            {gameState.barbarianAbilities.sweepingStrikeTimer > 0 && (
              <div className="absolute bottom-0 left-0 h-1 bg-red-500" style={{ width: `${(gameState.barbarianAbilities.sweepingStrikeTimer / gameState.barbarianAbilities.sweepingStrikeCooldown) * 100}%` }} />
            )}
            <div className="flex justify-between items-start mb-1">
              <span className="block text-neutral-400">Slash (LMB)</span>
              {gameState.barbarianAbilities.sweepingStrikeTimer > 0 && <span className="text-red-400 font-mono text-xs">{gameState.barbarianAbilities.sweepingStrikeTimer.toFixed(1)}s</span>}
            </div>
            <span className="font-mono text-white">Dmg: {gameState.barbarianAbilities.sweepingStrikeDamage}</span>
          </div>
          <div className="bg-neutral-900/50 p-3 rounded border border-neutral-800 relative overflow-hidden">
            {gameState.barbarianAbilities.sweepingRoundTimer > 0 && (
              <div className="absolute bottom-0 left-0 h-1 bg-red-500" style={{ width: `${(gameState.barbarianAbilities.sweepingRoundTimer / gameState.barbarianAbilities.sweepingRoundCooldown) * 100}%` }} />
            )}
            <div className="flex justify-between items-start mb-1">
              <span className="block text-neutral-400">Spin (RMB)</span>
              {gameState.barbarianAbilities.sweepingRoundTimer > 0 && <span className="text-red-400 font-mono text-xs">{gameState.barbarianAbilities.sweepingRoundTimer.toFixed(1)}s</span>}
            </div>
            <span className="font-mono text-white">Dmg: {gameState.barbarianAbilities.sweepingRoundDamage}</span>
          </div>
          <div className="bg-neutral-900/50 p-3 rounded border border-neutral-800 relative overflow-hidden">
            {gameState.barbarianAbilities.ruptureTimer > 0 && (
              <div className="absolute bottom-0 left-0 h-1 bg-red-500" style={{ width: `${(gameState.barbarianAbilities.ruptureTimer / gameState.barbarianAbilities.ruptureCooldown) * 100}%` }} />
            )}
            <div className="flex justify-between items-start mb-1">
              <span className="block text-neutral-400">Rupture (Q)</span>
              {gameState.barbarianAbilities.ruptureTimer > 0 && <span className="text-red-400 font-mono text-xs">{gameState.barbarianAbilities.ruptureTimer.toFixed(1)}s</span>}
            </div>
            <span className="font-mono text-white">Dmg: {gameState.barbarianAbilities.ruptureDamage}</span>
          </div>
          <div className="bg-neutral-900/50 p-3 rounded border border-neutral-800 relative overflow-hidden">
            {gameState.barbarianAbilities.rageDashTimer > 0 && (
              <div className="absolute bottom-0 left-0 h-1 bg-red-500" style={{ width: `${(gameState.barbarianAbilities.rageDashTimer / gameState.barbarianAbilities.rageDashCooldown) * 100}%` }} />
            )}
            <div className="flex justify-between items-start mb-1">
              <span className="block text-neutral-400">Dash (E)</span>
              {gameState.barbarianAbilities.rageDashTimer > 0 && <span className="text-red-400 font-mono text-xs">{gameState.barbarianAbilities.rageDashTimer.toFixed(1)}s</span>}
            </div>
            <span className="font-mono text-white">Dmg: {gameState.barbarianAbilities.rageDashDamage}</span>
          </div>
        </>
      )}
    </div>
  );
}
