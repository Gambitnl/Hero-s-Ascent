// Import necessary libraries and types
import React from 'react';
import { motion } from 'motion/react';
import { GameState } from '../types';

// Define the props for the LevelUpScreen component
interface LevelUpScreenProps {
  gameState: GameState; // The current state of the game
  setGameState: React.Dispatch<React.SetStateAction<GameState>>; // Function to update the game state
}

// The LevelUpScreen component displays the level up screen to the user, allowing them to choose an upgrade.
export function LevelUpScreen({ gameState, setGameState }: LevelUpScreenProps) {
  return (
    // Use motion.div for animations
    <motion.div
      // Initial animation state
      initial={{ opacity: 0, scale: 0.9 }}
      // Animate to this state
      animate={{ opacity: 1, scale: 1 }}
      // Styling for the level up screen container
      className="absolute inset-0 bg-neutral-900/95 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center z-50"
    >
      {/* Level up title */}
      <h2 className="text-5xl font-bold text-yellow-400 mb-2">Level Up!</h2>
      {/* Prompt for the user to choose an upgrade */}
      <p className="text-xl text-neutral-300 mb-8">Choose your upgrade</p>
      
      {/* Container for the upgrade choices */}
      <div className="flex gap-4 w-full max-w-3xl justify-center">
        {/* Map over the level up choices and display a button for each */}
        {gameState.levelUpChoices.map((choice) => (
          <button
            key={choice.id}
            // When a choice is clicked, update the game state
            onClick={() => {
              setGameState(prev => {
                // Deep clone the parts that choices might modify to prevent double-application in Strict Mode.
                // This ensures that the original game state is not mutated directly.
                const newState = { 
                  ...prev,
                  abilities: { ...prev.abilities },
                  barbarianAbilities: { ...prev.barbarianAbilities },
                  teleporterAbilities: { ...prev.teleporterAbilities },
                  kingAbilities: { ...prev.kingAbilities },
                  hero: { ...prev.hero },
                  monsters: prev.monsters.map(m => ({ ...m }))
                };
                // Apply the chosen upgrade to the new game state
                choice.apply(newState);
                // Change the game status to 'level_complete' to show the level complete screen
                newState.status = 'level_complete';
                // Return the new game state
                return newState;
              });
            }}
            // Styling for the choice buttons
            className="flex-1 bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 hover:border-yellow-400 p-6 rounded-xl transition-all text-left group"
          >
            {/* Title of the upgrade choice */}
            <h3 className="text-xl font-bold text-white group-hover:text-yellow-400 mb-2">{choice.title}</h3>
            {/* Description of the upgrade choice */}
            <p className="text-sm text-neutral-400">{choice.description}</p>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
