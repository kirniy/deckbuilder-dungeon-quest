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
  
  // Calculate card overlapping based on number of cards
  const getCardOffset = () => {
    if (hand.length <= 3) return "space-x-3";
    if (hand.length === 4) return "space-x-1";
    if (hand.length === 5) return "space-x-0.5";
    return "-space-x-1"; // Still slightly overlapping for 6+ cards but keeping cards visible
  };
  
  return (
    <div className="flex flex-col items-center">
      {/* Player cards on desk */}
      <div className="flex justify-center items-end mb-2 min-h-[110px] relative bg-green-800/60 rounded-lg p-2 w-full border border-green-700 shadow-inner">
        {hand.length > 0 ? (
          <div className={`flex flex-row ${getCardOffset()} justify-center overflow-visible`}>
            {hand.map((card, index) => (
              <div key={`player-card-${index}`} className={`${index > 0 ? "transform hover:translate-y-[-8px] hover:z-10" : ""} transition-transform`}>
                <CardComponent 
                  card={card} 
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-200 font-pixel text-sm flex items-center justify-center h-full bg-black/20 w-full rounded-md py-2">
            No cards on desk
          </div>
        )}
      </div>
      
      {/* Player Total */}
      <div className="flex items-center justify-center space-x-2 bg-green-800 px-4 py-1.5 rounded-full border border-green-700 shadow-md">
        <span 
          className={`font-pixel text-base ${busted ? 'text-red-300' : 'text-white'}`}
        >
          Total: {total}
        </span>
        
        {busted && (
          <span className="bg-red-700 text-white px-2 py-0.5 rounded text-xs font-pixel animate-pulse font-bold">
            BUST!
          </span>
        )}
        
        {isStood && !busted && (
          <span className="bg-yellow-600 text-white px-2 py-0.5 rounded text-xs font-pixel font-bold">
            STAND
          </span>
        )}
      </div>
    </div>
  );
};

export default PlayerDesk;
