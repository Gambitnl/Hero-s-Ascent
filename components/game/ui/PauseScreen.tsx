// Import the React library, which is necessary for creating React components.
import React from 'react';
// Import the motion component from the "motion/react" library, which is used for animations.
import { motion } from 'motion/react';

// Define the properties (props) that the PauseScreen component will accept.
interface PauseScreenProps {
  // A function that will be called to resume the game. It takes no arguments and returns nothing.
  resumeGame: () => void;
  // A function that will be called to navigate to the shop. It takes no arguments and returns nothing.
  goToShop: () => void;
  // A function that will be called to return to the main menu. It takes no arguments and returns nothing.
  goToMainMenu: () => void;
}

// This is the main component for the pause screen. It is exported so it can be used in other parts of the application.
export function PauseScreen({ resumeGame, goToShop, goToMainMenu }: PauseScreenProps) {
  return (
    // The `motion.div` component is a div that can be animated.
    <motion.div
      // The `initial` prop sets the initial state of the animation. Here, the component starts with an opacity of 0 (fully transparent).
      initial={{ opacity: 0 }}
      // The `animate` prop defines the state to animate to. Here, the component animates to an opacity of 1 (fully opaque).
      animate={{ opacity: 1 }}
      // The `className` prop is used to apply CSS classes for styling.
      className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center"
    >
      {/* A heading element that displays the text "Paused". */}
      <h2 className="text-4xl font-bold text-white mb-8">Paused</h2>
      {/* A div that contains the buttons. */}
      <div className="flex flex-col gap-4 w-64">
        {/* A button that, when clicked, calls the `resumeGame` function. */}
        <button onClick={resumeGame} className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-colors">Resume</button>
        {/* A button that, when clicked, calls the `goToShop` function. */}
        <button onClick={goToShop} className="px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-semibold transition-colors">To the Shop</button>
        {/* A button that, when clicked, calls the `goToMainMenu` function. */}
        <button onClick={goToMainMenu} className="px-8 py-3 bg-neutral-600 hover:bg-neutral-500 text-white rounded-lg font-semibold transition-colors">Back to Main Menu</button>
      </div>
    </motion.div>
  );
}
