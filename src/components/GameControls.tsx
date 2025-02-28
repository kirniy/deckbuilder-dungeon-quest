interface GameControlsProps {
  onHit: () => void;
  onStand: () => void;
  disabled: boolean;
}

const GameControls = ({ onHit, onStand, disabled }: GameControlsProps) => {
  return (
    <div className="flex justify-center space-x-6">
      <button
        onClick={onHit}
        disabled={disabled}
        className={`
          px-8 py-4 rounded-lg font-pixel text-xl shadow-lg
          ${disabled 
            ? 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-70' 
            : 'bg-green-600 text-white hover:bg-green-700 active:transform active:scale-95 hover:shadow-green-600/40 hover:shadow-xl'
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
          px-8 py-4 rounded-lg font-pixel text-xl shadow-lg
          ${disabled 
            ? 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-70' 
            : 'bg-red-600 text-white hover:bg-red-700 active:transform active:scale-95 hover:shadow-red-600/40 hover:shadow-xl'
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
