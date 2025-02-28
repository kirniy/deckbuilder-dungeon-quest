
import { useState, useEffect } from "react";
import CardComponent from "./CardComponent";
import { Card } from "@/lib/cards";

interface PlayerHandProps {
  hand: Card[];
  total: number;
}

const PlayerHand = ({ hand, total }: PlayerHandProps) => {
  const [busted, setBusted] = useState(false);
  const [isBlackjack, setIsBlackjack] = useState(false);
  
  // Check for bust or blackjack
  useEffect(() => {
    setBusted(total > 21);
    setIsBlackjack(total === 21);
  }, [total]);
  
  return (
    <div className="flex flex-col items-center">
      {/* Display total value */}
      <div className="mb-2">
        <span 
          className={`text-xl font-pixel 
            ${busted ? 'text-red-500' : ''} 
            ${isBlackjack ? 'text-yellow-400' : 'text-white'}
          `}
        >
          {hand.length > 0 ? `Total: ${total}` : "Draw cards to begin"}
        </span>
        
        {busted && (
          <span className="ml-2 bg-red-700 text-white px-2 py-0.5 rounded text-xs font-pixel animate-pulse">
            BUST!
          </span>
        )}
        
        {isBlackjack && (
          <span className="ml-2 bg-yellow-700 text-white px-2 py-0.5 rounded text-xs font-pixel animate-pulse">
            BLACKJACK!
          </span>
        )}
      </div>
      
      {/* Player cards in a fan layout */}
      <div className="flex justify-center items-end mb-4 min-h-32 relative">
        {hand.length > 0 ? (
          hand.map((card, index) => (
            <div 
              key={`player-card-${index}`}
              className="absolute transform transition-all duration-300 ease-out"
              style={{
                transform: `translateX(${index * 25 - (hand.length * 12.5)}px) rotate(${index * 5 - (hand.length * 2.5)}deg)`,
                transformOrigin: 'bottom center',
                zIndex: index,
              }}
            >
              <CardComponent card={card} />
            </div>
          ))
        ) : (
          <div className="text-gray-500 font-pixel">No cards in hand</div>
        )}
      </div>
    </div>
  );
};

export default PlayerHand;
