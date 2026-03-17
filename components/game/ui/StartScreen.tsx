
// Import necessary libraries and components
import React from 'react';
import { motion } from 'motion/react';
import { GameState } from '../types';

// Define the properties for the StartScreen component
interface StartScreenProps {
  // The current state of the game
  gameState: GameState;
  // Function to start the game
  startGame: () => void;
}

/**
 * StartScreen component displays the initial screen of the game.
 * It provides instructions and a button to start the game.
 *
 * @param {StartScreenProps} props The properties for the component.
 * @returns {JSX.Element} The rendered StartScreen component.
 */
export function StartScreen({ gameState, startGame }: StartScreenProps) {
  return (
    // Use motion.div for animations
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center"
    >
      {/* Game title */}
      <h2 className="text-3xl font-bold mb-4">Ready to Ascend?</h2>
      {/* Game instructions */}
      <p className="text-neutral-300 mb-8 max-w-md">
        {/* Basic movement and aiming controls */}
        Use <kbd className="bg-neutral-800 px-2 py-1 rounded text-white">W</kbd> <kbd className="bg-neutral-800 px-2 py-1 rounded text-white">A</kbd> <kbd className="bg-neutral-800 px-2 py-1 rounded text-white">S</kbd> <kbd className="bg-neutral-800 px-2 py-1 rounded text-white">D</kbd> to move.
        <br/>
        Aim with your mouse.
        <br/>
        {/* Archetype-specific controls */}
        {gameState.archetype === 'archer' ? (
          <>
            <span className="text-blue-400">Archer:</span> Auto-attacks. <kbd className="bg-neutral-800 px-2 py-1 rounded text-white text-xs">RMB</kbd> Double Shot (Mana), <kbd className="bg-neutral-800 px-2 py-1 rounded text-white text-xs">Q</kbd> Arrow Rain (Mana), <kbd className="bg-neutral-800 px-2 py-1 rounded text-white text-xs">E</kbd> Love Arrow (Mana).
          </>
        ) : gameState.archetype === 'barbarian' ? (
          <>
            <span className="text-red-400">Barbarian:</span> <kbd className="bg-neutral-800 px-2 py-1 rounded text-white text-xs">LMB</kbd> Slash, <kbd className="bg-neutral-800 px-2 py-1 rounded text-white text-xs">RMB</kbd> Spin (Mana), <kbd className="bg-neutral-800 px-2 py-1 rounded text-white text-xs">Q</kbd> Rupture (Mana), <kbd className="bg-neutral-800 px-2 py-1 rounded text-white text-xs">E</kbd> Dash (Mana).
          </>
        ) : (
          <>
            <span className="text-purple-400">Teleporter:</span> <kbd className="bg-neutral-800 px-2 py-1 rounded text-white text-xs">LMB</kbd> Boomerang, <kbd className="bg-neutral-800 px-2 py-1 rounded text-white text-xs">RMB</kbd> Black Bolt (Mana), <kbd className="bg-neutral-800 px-2 py-1 rounded text-white text-xs">Q</kbd> Dimension Doors (Mana), <kbd className="bg-neutral-800 px-2 py-1 rounded text-white text-xs">E</kbd> Teleport Ally (Mana).
          </>
        )}
        <br/>
        {/* Game objective */}
        Defeat all monsters to level up and gain new abilities!
      </p>
      {/* Start game button */}
      <button
        onClick={startGame}
        className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-colors"
      >
        Start Game
      </button>
    </motion.div>
  );
}
