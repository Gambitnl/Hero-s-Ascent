import React from 'react';
import { motion } from 'motion/react';

interface PauseScreenProps {
  resumeGame: () => void;
  goToShop: () => void;
  goToMainMenu: () => void;
}

export function PauseScreen({ resumeGame, goToShop, goToMainMenu }: PauseScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center"
    >
      <h2 className="text-4xl font-bold text-white mb-8">Paused</h2>
      <div className="flex flex-col gap-4 w-64">
        <button onClick={resumeGame} className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-colors">Resume</button>
        <button onClick={goToShop} className="px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-semibold transition-colors">To the Shop</button>
        <button onClick={goToMainMenu} className="px-8 py-3 bg-neutral-600 hover:bg-neutral-500 text-white rounded-lg font-semibold transition-colors">Back to Main Menu</button>
      </div>
    </motion.div>
  );
}
