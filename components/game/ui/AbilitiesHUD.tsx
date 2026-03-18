import React from 'react';
import { GameState } from '../types';

interface AbilitiesHUDProps {
  gameState: GameState;
}

/**
 * A reusable component for displaying either a static stat or an ability with a cooldown.
 */
function HUDBox({ 
  label, 
  value, 
  timer, 
  cooldown, 
  color = 'blue' 
}: { 
  label: string; 
  value: string | number; 
  timer?: number; 
  cooldown?: number; 
  color?: string;
}) {
  const hasCooldown = timer !== undefined && cooldown !== undefined;
  
  // Cooldown logic: 
  // - If available (timer <= 0), it sits at 100%.
  // - If on cooldown (timer > 0), it counts down from 100% to 0%.
  const progress = hasCooldown ? (timer > 0 ? (timer / cooldown) * 100 : 100) : 0;
  
  // Color mapping to ensure Tailwind classes are correctly picked up.
  const colorMap: Record<string, { bar: string, text: string }> = {
    blue: { bar: 'bg-blue-500', text: 'text-blue-400' },
    pink: { bar: 'bg-pink-500', text: 'text-pink-400' },
    red: { bar: 'bg-red-500', text: 'text-red-400' },
    purple: { bar: 'bg-purple-500', text: 'text-purple-400' },
    neutral: { bar: 'bg-neutral-500', text: 'text-neutral-400' }
  };

  const colors = colorMap[color] || colorMap.blue;

  return (
    <div className="bg-neutral-900/50 p-3 rounded border border-neutral-800 relative overflow-hidden">
      {hasCooldown && (
        <div 
          className={`absolute bottom-0 left-0 h-1 ${colors.bar}`} 
          style={{ 
            width: `${progress}%`,
            // No transition while counting down for immediate responsiveness
            transition: timer > 0 ? 'none' : 'width 0.3s ease-out'
          }} 
        />
      )}
      <div className="flex justify-between items-start mb-1">
        <span className="block text-neutral-400">{label}</span>
        {hasCooldown && (
          <span className={`${timer > 0 ? colors.text : 'text-neutral-500'} font-mono text-xs`}>
            {timer > 0 ? timer.toFixed(1) : cooldown.toFixed(1)}s
          </span>
        )}
      </div>
      <span className="font-mono text-white">{value}</span>
    </div>
  );
}

export function AbilitiesHUD({ gameState }: AbilitiesHUDProps) {
  const renderArcherAbilities = () => (
    <>
      <HUDBox label="Damage" value={gameState.abilities.damage} />
      <HUDBox label="Fire Rate" value={`${gameState.abilities.fireRate.toFixed(1)}/s`} />
      <HUDBox label="Projectiles" value={`${gameState.abilities.projectileCount} (Pierce: ${gameState.abilities.maxPierce})`} />
      
      <HUDBox 
        label="Rain (Q)" 
        value="5s Duration" 
        timer={gameState.abilities.arrowRainTimer} 
        cooldown={gameState.abilities.arrowRainCooldown} 
        color="blue"
      />
      <HUDBox 
        label="Love (E)" 
        value="10s Charm" 
        timer={gameState.abilities.loveArrowTimer} 
        cooldown={gameState.abilities.loveArrowCooldown} 
        color="pink"
      />
    </>
  );

  const renderBarbarianAbilities = () => (
    <>
      <HUDBox 
        label="Slash (LMB)" 
        value={`Dmg: ${gameState.barbarianAbilities.sweepingStrikeDamage}`} 
        timer={gameState.barbarianAbilities.sweepingStrikeTimer} 
        cooldown={gameState.barbarianAbilities.sweepingStrikeCooldown} 
        color="red"
      />
      <HUDBox 
        label="Spin (RMB)" 
        value={`Dmg: ${gameState.barbarianAbilities.sweepingRoundDamage}`} 
        timer={gameState.barbarianAbilities.sweepingRoundTimer} 
        cooldown={gameState.barbarianAbilities.sweepingRoundCooldown} 
        color="red"
      />
      <HUDBox 
        label="Rupture (Q)" 
        value={`Dmg: ${gameState.barbarianAbilities.ruptureDamage}`} 
        timer={gameState.barbarianAbilities.ruptureTimer} 
        cooldown={gameState.barbarianAbilities.ruptureCooldown} 
        color="red"
      />
      <HUDBox 
        label="Dash (E)" 
        value={`Dmg: ${gameState.barbarianAbilities.rageDashDamage}`} 
        timer={gameState.barbarianAbilities.rageDashTimer} 
        cooldown={gameState.barbarianAbilities.rageDashCooldown} 
        color="red"
      />
    </>
  );

  const renderKingAbilities = () => (
    <>
      <HUDBox
        label="King Ball (LMB)"
        value={`Dmg: ${gameState.kingAbilities.kingBallDamage}`}
        timer={gameState.kingAbilities.kingBallTimer}
        cooldown={gameState.kingAbilities.kingBallCooldown}
        color="neutral"
      />
      <HUDBox
        label="Royal Smack (RMB)"
        value={`Dmg: ${gameState.kingAbilities.royalSmackDamage}`}
        timer={gameState.kingAbilities.royalSmackTimer}
        cooldown={gameState.kingAbilities.royalSmackCooldown}
        color="neutral"
      />
      <HUDBox
        label="Ultra Spin (Q)"
        value={gameState.kingAbilities.ultraSpinActiveTimer > 0
          ? `Active: ${gameState.kingAbilities.ultraSpinActiveTimer.toFixed(1)}s`
          : `Dmg: ${gameState.kingAbilities.ultraSpinDamage}/s`}
        timer={gameState.kingAbilities.ultraSpinTimer}
        cooldown={gameState.kingAbilities.ultraSpinCooldown}
        color="neutral"
      />
      <HUDBox
        label="Royal Help (E)"
        value="Chess Piece Ally"
        timer={gameState.kingAbilities.royalHelpTimer}
        cooldown={gameState.kingAbilities.royalHelpCooldown}
        color="neutral"
      />
    </>
  );

  const renderTeleporterAbilities = () => (
    <>
      <HUDBox 
        label="Boomerang (LMB)" 
        value={`Dmg: ${gameState.teleporterAbilities.boomerangDamage}`} 
        timer={gameState.teleporterAbilities.boomerangTimer} 
        cooldown={gameState.teleporterAbilities.boomerangCooldown} 
        color="purple"
      />
      <HUDBox 
        label="Black Hole (RMB)" 
        value="Crowd Control" 
        timer={gameState.teleporterAbilities.blackHoleTimer} 
        cooldown={gameState.teleporterAbilities.blackHoleCooldown} 
        color="purple"
      />
      <HUDBox 
        label="Portal (Q)" 
        value={`Dmg: ${gameState.teleporterAbilities.dimensionDoorDamage}`} 
        timer={gameState.teleporterAbilities.dimensionDoorTimer} 
        cooldown={gameState.teleporterAbilities.dimensionDoorCooldown} 
        color="purple"
      />
      <HUDBox 
        label="Summon (E)" 
        value="Call Allies" 
        timer={gameState.teleporterAbilities.teleportAllyTimer} 
        cooldown={gameState.teleporterAbilities.teleportAllyCooldown} 
        color="purple"
      />
    </>
  );

  return (
    <div className="flex flex-col gap-4 text-sm text-neutral-500 w-full">
      {(() => {
        switch (gameState.archetype) {
          case 'archer':
            return renderArcherAbilities();
          case 'barbarian':
            return renderBarbarianAbilities();
          case 'teleporter':
            return renderTeleporterAbilities();
          case 'king':
            return renderKingAbilities();
          default:
            return null;
        }
      })()}
    </div>
  );
}
