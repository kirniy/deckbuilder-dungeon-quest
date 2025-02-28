
import { useState, useEffect } from "react";
import CardComponent from "./CardComponent";
import { Card } from "@/lib/cards";

interface PlayerHandProps {
  hand: Card[];
  total: number;
}

const PlayerHand = ({ hand, total }: PlayerHandProps) => {
  const [busted, setBusted] = useState(false);
  
  // Check if player busted
  useEffect(() => {
    setBusted(total > 21);
  }, [total]);
  
  return (
    <div className="flex flex-col items-center">
      {/* Player cards */}
      <div className="flex justify-center items-end mb-2 h-24 relative">
        {hand.length > 0 ? (
          hand.map((card, index) => (
            <div 
              key={`player-card-${index}`}
              className="absolute transform transition-all duration-300 ease-out"
              style={{
                transform: `translateX(${index * 20 - (hand.length * 10)}px) rotate(${index * 3 - (hand.length * 1.5)}deg)`,
                transformOrigin: 'bottom center',
                zIndex: index,
              }}
            >
              <CardComponent card={card} />
            </div>
          ))
        ) : (
          <div className="text-gray-500 font-pixel text-xs">No cards</div>
        )}
      </div>
      
      {/* Player Total */}
      <div className="flex items-center space-x-2">
        <span 
          className={`font-pixel text-sm ${busted ? 'text-red-500' : 'text-white'}`}
        >
          Total: {total}
        </span>
        
        {busted && (
          <span className="bg-red-700 text-white px-2 py-0.5 rounded text-xxs font-pixel animate-pulse">
            BUST!
          </span>
        )}
      </div>
    </div>
  );
};

export default PlayerHand;
