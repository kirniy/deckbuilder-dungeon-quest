
import { useState } from "react";
import { Card } from "@/lib/cards";
import CardComponent from "./CardComponent";

interface DeckPileProps {
  deck: Card[];
  label: string;
  isAI?: boolean;
}

const DeckPile = ({ deck, label, isAI = false }: DeckPileProps) => {
  const [showDeck, setShowDeck] = useState(false);
  
  const toggleShowDeck = () => {
    setShowDeck(!showDeck);
  };
  
  return (
    <div className="relative">
      {/* Pile Representation */}
      <div 
        className="w-12 h-16 bg-dark-card border border-card-border rounded-md flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
        onClick={toggleShowDeck}
      >
        <div className="flex flex-col items-center">
          <span className="text-xxs text-white font-pixel">{label}</span>
          <span className="text-sm text-white font-pixel">{deck.length}</span>
        </div>
      </div>
      
      {/* Deck Contents Modal */}
      {showDeck && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-dark-card rounded-lg p-4 max-w-[90%] w-full max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-pixel text-white">{isAI ? "AI's" : "Your"} {label}</h3>
              <button 
                onClick={toggleShowDeck}
                className="text-white hover:text-gray-300 text-sm"
              >
                Close
              </button>
            </div>
            
            {deck.length > 0 ? (
              <div className="grid grid-cols-5 gap-1">
                {deck.map((card, index) => (
                  <div key={`deck-card-${index}`} className="flex justify-center">
                    <CardComponent card={card} small faceDown={false} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white font-pixel text-center py-4 text-xs">No cards in this pile</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DeckPile;
