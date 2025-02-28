
import { motion } from "framer-motion";

interface TitleScreenProps {
  onStart: () => void;
}

const TitleScreen = ({ onStart }: TitleScreenProps) => {
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md h-screen mx-auto">
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-pixel text-white text-center leading-tight">
          <span className="text-red-500">Dungeons</span> & <br />
          <span className="text-yellow-500">Degenerate</span> <br />
          <span className="text-green-500">Gamblers</span>
        </h1>
      </motion.div>
      
      <motion.div
        className="mb-8 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <p className="text-gray-300 mb-3">Outplay the AI with your blackjack skills</p>
        <p className="text-gray-400 text-sm">Get as close to 21 as possible without going over</p>
      </motion.div>
      
      <motion.div
        className="grid grid-cols-2 gap-4 mb-8 px-6 w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <div className="bg-dark-card p-3 rounded-lg border border-gray-800">
          <h3 className="text-sm font-pixel text-white mb-1">Objective</h3>
          <p className="text-xs text-gray-400">Reduce the AI's HP to zero by winning blackjack rounds</p>
        </div>
        
        <div className="bg-dark-card p-3 rounded-lg border border-gray-800">
          <h3 className="text-sm font-pixel text-white mb-1">Blackjack</h3>
          <p className="text-xs text-gray-400">Hit 21 with special suits for powerful bonuses</p>
        </div>
        
        <div className="bg-dark-card p-3 rounded-lg border border-gray-800">
          <h3 className="text-sm font-pixel text-white mb-1">Shop</h3>
          <p className="text-xs text-gray-400">Spend chips to upgrade your deck between rounds</p>
        </div>
        
        <div className="bg-dark-card p-3 rounded-lg border border-gray-800">
          <h3 className="text-sm font-pixel text-white mb-1">Strategy</h3>
          <p className="text-xs text-gray-400">Build the perfect deck to counter the AI's strategy</p>
        </div>
      </motion.div>
      
      <motion.button
        onClick={onStart}
        className="bg-green-600 text-white px-8 py-4 rounded-lg font-pixel text-xl shadow-glow-green hover:bg-green-700 active:transform active:scale-95 transition-all duration-150"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.9, duration: 0.5 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        START GAME
      </motion.button>
      
      <motion.p
        className="mt-6 text-gray-500 text-xs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ delay: 1.2, duration: 0.5 }}
      >
        A pixel-art roguelike deckbuilder
      </motion.p>
    </div>
  );
};

export default TitleScreen;
