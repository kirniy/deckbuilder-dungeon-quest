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
        className="bg-green-600 text-white px-8 py-4 rounded-lg font-pixel text-xl shadow-xl relative
          border-b-8 border-green-900 hover:brightness-110 active:border-b-4 active:translate-y-1 transition-all duration-100
          before:absolute before:inset-0 before:rounded-lg before:bg-white before:opacity-10 before:top-0 before:left-0 before:w-full before:h-1/2"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.9, duration: 0.5 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">START GAME</span>
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
        className="flex gap-3 mt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.5 }}
      >
        <button 
          onClick={() => setCurrentShader(ShaderOptions.DEFAULT)}
          className={`px-3 py-1 rounded text-xs font-pixel transition-all relative ${
            currentShader === ShaderOptions.DEFAULT 
              ? 'bg-green-600 text-white border-b-2 border-green-900 before:absolute before:inset-0 before:rounded before:bg-white before:opacity-10 before:top-0 before:left-0 before:w-full before:h-1/2' 
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700 border-b-2 border-gray-900 hover:border-gray-700'
          }`}
        >
          <span className={currentShader === ShaderOptions.DEFAULT ? 'drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]' : ''}>Theme 1</span>
        </button>
        <button 
          onClick={() => setCurrentShader(ShaderOptions.SHADER2)}
          className={`px-3 py-1 rounded text-xs font-pixel transition-all relative ${
            currentShader === ShaderOptions.SHADER2 
              ? 'bg-green-600 text-white border-b-2 border-green-900 before:absolute before:inset-0 before:rounded before:bg-white before:opacity-10 before:top-0 before:left-0 before:w-full before:h-1/2' 
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700 border-b-2 border-gray-900 hover:border-gray-700'
          }`}
        >
          <span className={currentShader === ShaderOptions.SHADER2 ? 'drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]' : ''}>Theme 2</span>
        </button>
        <button 
          onClick={() => setCurrentShader(ShaderOptions.SHADER3)}
          className={`px-3 py-1 rounded text-xs font-pixel transition-all relative ${
            currentShader === ShaderOptions.SHADER3 
              ? 'bg-green-600 text-white border-b-2 border-green-900 before:absolute before:inset-0 before:rounded before:bg-white before:opacity-10 before:top-0 before:left-0 before:w-full before:h-1/2' 
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700 border-b-2 border-gray-900 hover:border-gray-700'
          }`}
        >
          <span className={currentShader === ShaderOptions.SHADER3 ? 'drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]' : ''}>Theme 3</span>
        </button>
      </motion.div>
    </div>
  );
};

export default TitleScreen;
