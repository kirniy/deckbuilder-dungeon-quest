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
        className="w-12 h-16 bg-gray-900 border-2 border-gray-700 rounded-md flex flex-col items-center justify-between cursor-pointer hover:opacity-90 transition-all shadow-md hover:shadow-xl hover:scale-105"
        onClick={toggleShowDeck}
      >
        <div className="bg-black w-full text-center py-0.5 rounded-t-sm">
          <span className="text-sm text-white font-pixel tracking-wide">{label}</span>
        </div>
        <span className="text-xl text-white font-pixel font-bold pb-1">{deck.length}</span>
      </div>
      
      {/* Deck Contents Modal */}
      {showDeck && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4">
          <div className="bg-green-900 rounded-lg p-4 max-w-[95%] w-full max-h-[85vh] overflow-auto border-2 border-green-700 shadow-xl">
            <div className="flex justify-between items-center mb-3 border-b border-green-700 pb-2">
              <h3 className="text-base font-pixel text-white">{isAI ? "AI's" : "Your"} {label}</h3>
              <button 
                onClick={toggleShowDeck}
                className="text-white hover:text-gray-300 bg-green-800 px-3 py-1 rounded text-sm font-medium hover:bg-green-700 transition-colors"
              >
                Close
              </button>
            </div>
            
            {deck.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {deck.map((card, index) => (
                  <div key={`deck-card-${index}`} className="flex justify-center">
                    <CardComponent card={card} small faceDown={false} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-black/30 text-white font-pixel text-center py-4 text-sm rounded-md">
                No cards in this pile
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DeckPile;
