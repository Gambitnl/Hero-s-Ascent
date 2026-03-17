// Import React for creating the component
import React from 'react';
// Import motion for animations
import { motion } from 'motion/react';
// Import GameState type for type safety
import { GameState } from '../types';

// Define the props for the LevelCompleteScreen component
interface LevelCompleteScreenProps {
  // The current state of the game
  gameState: GameState;
  // Function to be called to start the next level
  startNextLevel: () => void;
}

// The LevelCompleteScreen component is displayed when a player successfully completes a level.
export function LevelCompleteScreen({ gameState, startNextLevel }: LevelCompleteScreenProps) {
  return (
    // Use motion.div for a smooth fade-in and scale-up animation
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center"
    >
      {/* Display the level completion message */}
      <h2 className="text-4xl font-bold text-green-400 mb-2">Level {gameState.level - 1} Cleared!</h2>
      
      {/* Button to proceed to the next level */}
      <button
        onClick={startNextLevel}
        className="mt-4 px-8 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-semibold transition-colors"
      >
        Continue to Level {gameState.level}
      </button>
    </motion.div>
  );
}
