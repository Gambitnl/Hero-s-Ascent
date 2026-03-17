import React from 'react';
import { motion } from 'motion/react';
import { GameState } from '../types';

interface GameOverScreenProps {
  gameState: GameState;
  restartGame: () => void;
}

export function GameOverScreen({ gameState, restartGame }: GameOverScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 bg-red-950/90 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center"
    >
      <h2 className="text-5xl font-bold text-red-500 mb-4">Game Over</h2>
      <p className="text-xl text-red-200 mb-2">You reached Level {gameState.level}</p>
      <p className="text-neutral-400 mb-8">Final Score: {gameState.score}</p>
      <button
        onClick={restartGame}
        className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg font-semibold transition-colors"
      >
        Try Again
      </button>
    </motion.div>
  );
}
