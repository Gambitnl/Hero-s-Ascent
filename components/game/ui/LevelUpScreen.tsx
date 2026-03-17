import React from 'react';
import { motion } from 'motion/react';
import { GameState } from '../types';

interface LevelUpScreenProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

export function LevelUpScreen({ gameState, setGameState }: LevelUpScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="absolute inset-0 bg-neutral-900/95 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center z-50"
    >
      <h2 className="text-5xl font-bold text-yellow-400 mb-2">Level Up!</h2>
      <p className="text-xl text-neutral-300 mb-8">Choose your upgrade</p>
      
      <div className="flex gap-4 w-full max-w-3xl justify-center">
        {gameState.levelUpChoices.map((choice) => (
          <button
            key={choice.id}
            onClick={() => {
              setGameState(prev => {
                // Deep clone the parts that choices might modify to prevent double-application in Strict Mode
                const newState = { 
                  ...prev,
                  abilities: { ...prev.abilities },
                  barbarianAbilities: { ...prev.barbarianAbilities },
                  hero: { ...prev.hero }
                };
                choice.apply(newState);
                newState.status = 'level_complete';
                return newState;
              });
            }}
            className="flex-1 bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 hover:border-yellow-400 p-6 rounded-xl transition-all text-left group"
          >
            <h3 className="text-xl font-bold text-white group-hover:text-yellow-400 mb-2">{choice.title}</h3>
            <p className="text-sm text-neutral-400">{choice.description}</p>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
