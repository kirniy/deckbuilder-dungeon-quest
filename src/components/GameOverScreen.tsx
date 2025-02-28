
import { motion } from "framer-motion";
import { useGame } from "@/context/GameContext";

interface GameOverScreenProps {
  result: "win" | "lose" | null;
  onReturnToTitle: () => void;
}

const GameOverScreen = ({ result, onReturnToTitle }: GameOverScreenProps) => {
  const { resetGame } = useGame();
  
  const handleReturnToTitle = () => {
    resetGame();
    onReturnToTitle();
  };
  
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md h-screen mx-auto">
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className={`text-4xl font-pixel ${result === "win" ? "text-green-500" : "text-red-500"}`}>
          {result === "win" ? "VICTORY" : "DEFEAT"}
        </h1>
      </motion.div>
      
      <motion.div
        className="mb-12 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <p className="text-gray-300 text-lg mb-2">
          {result === "win" 
            ? "You've defeated your opponent!" 
            : "Your luck ran out this time..."
          }
        </p>
        <p className="text-gray-400">
          {result === "win"
            ? "Your card skills were too much for the AI to handle."
            : "Better luck with your next hand."
          }
        </p>
      </motion.div>
      
      <motion.button
        onClick={handleReturnToTitle}
        className="bg-blue-600 text-white px-8 py-4 rounded-lg font-pixel text-xl shadow-glow-blue hover:bg-blue-700 active:transform active:scale-95 transition-all duration-150"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        RETURN TO TITLE
      </motion.button>
    </div>
  );
};

export default GameOverScreen;
