import { useState, useEffect } from "react";
import { useGame } from "@/context/GameContext";
import { Card, generateShopOptions } from "@/lib/cards";
import { useToast } from "@/hooks/use-toast";

interface ShopScreenProps {
  onContinue: () => void;
}

const ShopScreen = ({ onContinue }: ShopScreenProps) => {
  const {
    playerChips,
    playerDeck,
    spendChips,
    addCardToDeck,
    removeCardFromDeck
  } = useGame();
  
  const [shopOptions, setShopOptions] = useState<(Card | { type: 'remove' })[]>([]);
  const { toast } = useToast();
  
  // Generate shop options when component mounts
  useEffect(() => {
    // Get special cards
    const specialCards = generateShopOptions();
    
    // Add card removal option
    const removeOption = {
      type: 'remove' as const,
      cost: 10
    };
    
    // Set prices for cards
    const priceRange = [15, 20, 25, 30];
    const cardsWithPrices = specialCards.map(card => ({
      ...card,
      cost: priceRange[Math.floor(Math.random() * priceRange.length)]
    }));
    
    // Combine all options
    setShopOptions([
      ...cardsWithPrices.slice(0, Math.floor(Math.random() * 3) + 3),
      removeOption
    ]);
  }, []);
  
  // Purchase a card
  const purchaseCard = (card: Card & { cost: number }) => {
    if (spendChips(card.cost)) {
      addCardToDeck(card);
      
      // Update shop options to remove the purchased card
      setShopOptions(prev => prev.filter(option => 
        option.type === 'remove' || 
        (option as Card).name !== card.name
      ));
      
      toast({
        title: "Card Purchased!",
        description: `${card.name} added to your deck.`,
      });
    } else {
      toast({
        title: "Not Enough Chips",
        description: `You need ${card.cost} chips to buy this card.`,
        variant: "destructive"
      });
    }
  };
  
  // Show card removal interface
  const [showRemoveInterface, setShowRemoveInterface] = useState(false);
  
  const startRemoveCard = (cost: number) => {
    if (playerDeck.length <= 10) { // Minimum deck size
      toast({
        title: "Deck Too Small",
        description: "You can't remove more cards from your deck.",
        variant: "destructive"
      });
      return;
    }
    
    if (spendChips(cost)) {
      setShowRemoveInterface(true);
    } else {
      toast({
        title: "Not Enough Chips",
        description: `You need ${cost} chips to remove a card.`,
        variant: "destructive"
      });
    }
  };
  
  const removeCard = (index: number) => {
    removeCardFromDeck(index);
    setShowRemoveInterface(false);
    
    toast({
      title: "Card Removed",
      description: "Card has been removed from your deck.",
    });
  };
  
  return (
    <div className="w-full max-w-md mx-auto p-4">
      <div className="bg-dark-card rounded-lg p-4 shadow-glow mb-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-pixel text-white">Shop</h2>
          <span className="text-yellow-400 font-pixel">🪙 {playerChips} Chips</span>
        </div>
        
        {/* Shop options */}
        {!showRemoveInterface ? (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {shopOptions.map((option, index) => {
              if (option.type === 'remove') {
                const removeOption = option as { type: 'remove', cost: number };
                return (
                  <div key={`remove-option`} className="flex justify-between items-center p-3 bg-dark-item rounded border border-gray-700">
                    <div>
                      <h3 className="font-pixel text-white">Card Removal</h3>
                      <p className="text-sm text-gray-300">Remove one card from your deck</p>
                    </div>
                    <button
                      onClick={() => startRemoveCard(removeOption.cost)}
                      className="bg-red-700 text-white px-3 py-1 rounded font-pixel hover:bg-red-600 transition-colors"
                    >
                      Use ({removeOption.cost})
                    </button>
                  </div>
                );
              } else {
                // It's a card
                const card = option as Card & { cost: number };
                return (
                  <div key={`card-${index}`} className="flex justify-between items-center p-3 bg-dark-item rounded border border-gray-700">
                    <div className="flex items-center">
                      <div className="w-8 h-12 bg-white rounded-sm mr-3 flex items-center justify-center">
                        <span className={card.suit === 'hearts' || card.suit === 'diamonds' ? 'text-red-500' : 'text-black'}>
                          {card.value}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-pixel text-white">{card.name}</h3>
                        <p className="text-sm text-gray-300">{card.description || `${card.value} of ${card.suit}`}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => purchaseCard(card)}
                      className="bg-blue-700 text-white px-3 py-1 rounded font-pixel hover:bg-blue-600 transition-colors"
                    >
                      Buy ({card.cost})
                    </button>
                  </div>
                );
              }
            })}
          </div>
        ) : (
          // Card removal interface
          <div>
            <h3 className="font-pixel text-white mb-3">Select a card to remove:</h3>
            <div className="grid grid-cols-4 gap-2 mb-4 max-h-[50vh] overflow-y-auto">
              {playerDeck.map((card, index) => (
                <div 
                  key={`remove-card-${index}`}
                  onClick={() => removeCard(index)}
                  className="w-16 h-24 bg-white rounded-md cursor-pointer flex flex-col items-center justify-center transform hover:scale-105 transition-transform"
                >
                  <span className={card.suit === 'hearts' || card.suit === 'diamonds' ? 'text-red-500' : 'text-black'}>
                    {card.value}
                  </span>
                  <span className={card.suit === 'hearts' || card.suit === 'diamonds' ? 'text-red-500' : 'text-black'}>
                    {card.suit === 'hearts' ? '♥' : card.suit === 'diamonds' ? '♦' : card.suit === 'clubs' ? '♣' : '♠'}
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowRemoveInterface(false)}
              className="bg-gray-700 text-white px-3 py-1 rounded font-pixel"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
      
      {/* Continue button */}
      <div className="flex justify-center">
        <button
          onClick={onContinue}
          className="bg-yellow-600 text-white px-6 py-3 rounded-lg font-pixel text-lg hover:bg-yellow-700 transition-colors"
        >
          Continue to Next Round
        </button>
      </div>
    </div>
  );
};

export default ShopScreen;
