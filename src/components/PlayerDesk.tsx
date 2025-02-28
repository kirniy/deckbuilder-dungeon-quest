import { useState, useEffect } from "react";
import CardComponent from "./CardComponent";
import { Card } from "@/lib/cards";

interface PlayerDeskProps {
  hand: Card[];
  total: number;
  isStood?: boolean;
}

const PlayerDesk = ({ hand, total, isStood = false }: PlayerDeskProps) => {
  const [busted, setBusted] = useState(false);
  
  // Check if player busted
  useEffect(() => {
    setBusted(total > 21);
  }, [total]);
  
  return (
    <div className="flex flex-col items-center">
      {/* Player cards on desk */}
      <div className="flex justify-center items-end mb-3 min-h-32 relative bg-green-800/40 rounded-lg p-3 w-full border border-green-700/50 shadow-inner">
        {hand.length > 0 ? (
          <div className="flex flex-row space-x-3 justify-center">
            {hand.map((card, index) => (
              <CardComponent 
                key={`player-card-${index}`}
                card={card} 
              />
            ))}
          </div>
        ) : (
          <div className="text-gray-500/70 font-pixel text-sm flex items-center justify-center h-full">No cards on desk</div>
        )}
      </div>
      
      {/* Player Total */}
      <div className="flex items-center justify-center space-x-2 bg-green-800/70 px-4 py-1 rounded-full border border-green-700/50">
        <span 
          className={`font-pixel text-base ${busted ? 'text-red-400' : 'text-white'}`}
        >
          Total: {total}
        </span>
        
        {busted && (
          <span className="bg-red-700 text-white px-2 py-0.5 rounded text-xs font-pixel animate-pulse">
            BUST!
          </span>
        )}
        
        {isStood && !busted && (
          <span className="bg-yellow-600 text-white px-2 py-0.5 rounded text-xs font-pixel">
            STAND
          </span>
        )}
      </div>
    </div>
  );
};

export default PlayerDesk;
