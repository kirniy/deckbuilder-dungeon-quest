
import { useState, useEffect } from "react";
import CardComponent from "./CardComponent";
import { Card } from "@/lib/cards";

interface AIHandProps {
  hand: Card[];
  total: number;
  isStood: boolean;
  revealCards: boolean;
}

const AIHand = ({ hand, total, isStood, revealCards }: AIHandProps) => {
  const [busted, setBusted] = useState(false);
  
  // Check if AI busted
  useEffect(() => {
    setBusted(total > 21);
  }, [total]);
  
  return (
    <div className="flex flex-col items-center">
      {/* AI cards are shown face down unless revealed */}
      <div className="flex justify-center items-start mb-3 h-32 relative">
        {hand.length > 0 ? (
          hand.map((card, index) => (
            <div 
              key={`ai-card-${index}`}
              className="absolute transform transition-all duration-300 ease-out"
              style={{
                transform: `translateX(${index * 24 - (hand.length * 12)}px) rotate(${index * 3 - (hand.length * 1.5)}deg)`,
                transformOrigin: 'bottom center',
                zIndex: index,
              }}
            >
              <CardComponent 
                card={card} 
                faceDown={!revealCards}
                aiCard
              />
            </div>
          ))
        ) : (
          <div className="text-gray-500 font-pixel">No cards</div>
        )}
      </div>
      
      {/* AI Total and Status */}
      <div className="flex items-center space-x-2">
        {revealCards ? (
          <span 
            className={`font-pixel ${busted ? 'text-red-500' : 'text-white'}`}
          >
            Total: {total}
          </span>
        ) : (
          <span className="font-pixel text-white">
            {hand.length > 0 ? "Cards: " + hand.length : "Waiting..."}
          </span>
        )}
        
        {isStood && (
          <span className="bg-red-900 text-white px-2 py-0.5 rounded text-xs font-pixel">
            STOOD
          </span>
        )}
        
        {busted && revealCards && (
          <span className="bg-red-700 text-white px-2 py-0.5 rounded text-xs font-pixel animate-pulse">
            BUST!
          </span>
        )}
      </div>
    </div>
  );
};

export default AIHand;
