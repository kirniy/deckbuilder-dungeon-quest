interface GameControlsProps {
  onHit: () => void;
  onStand: () => void;
  disabled: boolean;
}

const GameControls = ({ onHit, onStand, disabled }: GameControlsProps) => {
  return (
    <div className="flex justify-center gap-4 sm:gap-8">
      <button
        onClick={onHit}
        disabled={disabled}
        className={`
          px-6 py-3 sm:px-8 sm:py-4 rounded-lg font-pixel text-lg sm:text-xl shadow-lg
          ${disabled 
            ? 'bg-gray-700 text-gray-400 cursor-not-allowed border-2 border-gray-600' 
            : 'bg-green-600 text-white hover:bg-green-700 active:transform active:scale-95 border-2 border-green-500 hover:border-green-400 animate-pulse'
          }
          transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-green-400
        `}
        aria-label="Hit - Draw another card"
      >
        HIT
      </button>
      
      <button
        onClick={onStand}
        disabled={disabled}
        className={`
          px-6 py-3 sm:px-8 sm:py-4 rounded-lg font-pixel text-lg sm:text-xl shadow-lg
          ${disabled 
            ? 'bg-gray-700 text-gray-400 cursor-not-allowed border-2 border-gray-600' 
            : 'bg-red-600 text-white hover:bg-red-700 active:transform active:scale-95 border-2 border-red-500 hover:border-red-400 animate-pulse'
          }
          transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-red-400
        `}
        aria-label="Stand - End your turn"
      >
        STAND
      </button>
    </div>
  );
};

export default GameControls;
