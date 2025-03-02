import { useState, useEffect } from "react";
import CardComponent from "./CardComponent";
import { Card } from "@/lib/cards";

interface AIDeskProps {
  hand: Card[];
  total: number;
  isStood: boolean;
  revealCards: boolean;
}

const AIDesk = ({ hand, total, isStood, revealCards }: AIDeskProps) => {
  const [busted, setBusted] = useState(false);
  
  // Check if AI busted
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
      {/* AI cards shown on desk */}
      <div className="flex justify-center items-start mb-2 min-h-[110px] relative bg-green-800/60 rounded-lg p-2 w-full border border-green-700 shadow-inner">
        {hand.length > 0 ? (
          <div className={`flex flex-row ${getCardOffset()} justify-center overflow-visible`}>
            {hand.map((card, index) => (
              <div key={`ai-card-${index}`} className={`${index > 0 ? "transform hover:translate-y-[8px] hover:z-10" : ""} transition-transform`}>
                <CardComponent 
                  card={card} 
                  faceDown={!revealCards && index > 0}
                  aiCard
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
    </div>
  );
};

export default AIDesk;
