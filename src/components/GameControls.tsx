
interface GameControlsProps {
  onHit: () => void;
  onStand: () => void;
  disabled: boolean;
}

const GameControls = ({ onHit, onStand, disabled }: GameControlsProps) => {
  return (
    <div className="flex justify-center space-x-4 mt-auto mb-2">
      <button
        onClick={onHit}
        disabled={disabled}
        className={`
          px-6 py-3 rounded-lg font-pixel text-lg shadow-md
          ${disabled 
            ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
            : 'bg-green-600 text-white hover:bg-green-700 active:transform active:scale-95'
          }
          transition-all duration-150
        `}
      >
        HIT
      </button>
      
      <button
        onClick={onStand}
        disabled={disabled}
        className={`
          px-6 py-3 rounded-lg font-pixel text-lg shadow-md
          ${disabled 
            ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
            : 'bg-red-600 text-white hover:bg-red-700 active:transform active:scale-95'
          }
          transition-all duration-150
        `}
      >
        STAND
      </button>
    </div>
  );
};

export default GameControls;
