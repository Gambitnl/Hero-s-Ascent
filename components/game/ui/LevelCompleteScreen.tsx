import React from 'react';
import { motion } from 'motion/react';
import { GameState } from '../types';

interface LevelCompleteScreenProps {
  gameState: GameState;
  startNextLevel: () => void;
}

export function LevelCompleteScreen({ gameState, startNextLevel }: LevelCompleteScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center"
    >
      <h2 className="text-4xl font-bold text-green-400 mb-2">Level {gameState.level - 1} Cleared!</h2>
      
      <button
        onClick={startNextLevel}
        className="mt-4 px-8 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-semibold transition-colors"
      >
        Continue to Level {gameState.level}
      </button>
    </motion.div>
  );
}
