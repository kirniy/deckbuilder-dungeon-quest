import { motion } from "framer-motion";
import { useTheme } from "@/App";
import { ShaderOptions } from "@/components/ShaderBackground";

interface TitleScreenProps {
  onStart: () => void;
}

const TitleScreen = ({ onStart }: TitleScreenProps) => {
  const { currentShader, setCurrentShader } = useTheme();
  
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
        <p className="text-white mb-3 px-3 py-1 bg-black bg-opacity-50 rounded">Outplay the AI with your blackjack skills</p>
        <p className="text-white text-sm px-3 py-1 bg-black bg-opacity-50 rounded">Get as close to 21 as possible without going over</p>
      </motion.div>
      
      <motion.div
        className="grid grid-cols-2 gap-4 mb-8 px-6 w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <div className="bg-dark-card p-3 rounded-lg border border-gray-800">
          <h3 className="text-sm font-pixel text-white mb-1">Objective</h3>
          <p className="text-xs text-white">Reduce the AI's HP to zero by winning blackjack rounds</p>
        </div>
        
        <div className="bg-dark-card p-3 rounded-lg border border-gray-800">
          <h3 className="text-sm font-pixel text-white mb-1">Blackjack</h3>
          <p className="text-xs text-white">Hit 21 with special suits for powerful bonuses</p>
        </div>
        
        <div className="bg-dark-card p-3 rounded-lg border border-gray-800">
          <h3 className="text-sm font-pixel text-white mb-1">Shop</h3>
          <p className="text-xs text-white">Spend chips to upgrade your deck between rounds</p>
        </div>
        
        <div className="bg-dark-card p-3 rounded-lg border border-gray-800">
          <h3 className="text-sm font-pixel text-white mb-1">Strategy</h3>
          <p className="text-xs text-white">Build the perfect deck to counter the AI's strategy</p>
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
        className="mt-6 text-white text-xs px-3 py-1 bg-black bg-opacity-50 rounded"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ delay: 1.2, duration: 0.5 }}
      >
        A pixel-art roguelike deckbuilder
      </motion.p>
      
      {/* Theme Selector */}
      <motion.div
        className="flex gap-2 mt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.5 }}
      >
        <button 
          onClick={() => setCurrentShader(ShaderOptions.DEFAULT)}
          className={`px-3 py-1 rounded text-xs font-pixel transition-all ${
            currentShader === ShaderOptions.DEFAULT 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Theme 1
        </button>
        <button 
          onClick={() => setCurrentShader(ShaderOptions.SHADER2)}
          className={`px-3 py-1 rounded text-xs font-pixel transition-all ${
            currentShader === ShaderOptions.SHADER2 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Theme 2
        </button>
        <button 
          onClick={() => setCurrentShader(ShaderOptions.SHADER3)}
          className={`px-3 py-1 rounded text-xs font-pixel transition-all ${
            currentShader === ShaderOptions.SHADER3 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Theme 3
        </button>
      </motion.div>
    </div>
  );
};

export default TitleScreen;
