import React, { useState, useMemo } from "react";
import { Card, Deck, createStandardDeck, createSpecialCards } from "@/lib/cards";
import { useGame } from "@/context/GameContext";
import { Button } from "@/components/ui/button";
import { CardPreview } from "./CardPreview";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface DeckSelectionProps {
  onConfirm: () => void;
}

const DeckSelection: React.FC<DeckSelectionProps> = ({ onConfirm }) => {
  const { startNewGameWithDeck } = useGame();
  
  // Start with a standard deck
  const [selectedDeck, setSelectedDeck] = useState<Deck>(createStandardDeck());
  const [specialCardsAdded, setSpecialCardsAdded] = useState<Record<string, boolean>>({});
  
  // Generate available special cards
  const specialCards = useMemo(() => createSpecialCards(), []);
  
  // Add a special card to the deck
  const addSpecialCard = (card: Card) => {
    // Check if already added
    if (specialCardsAdded[card.name]) {
      toast({
        title: "Already Added",
        description: `${card.name} is already in your deck.`,
        variant: "destructive",
      });
      return;
    }
    
    // Add the card to the deck
    setSelectedDeck(prev => [...prev, card]);
    setSpecialCardsAdded(prev => ({ ...prev, [card.name]: true }));
    
    toast({
      title: "Card Added",
      description: `${card.name} added to your deck.`,
      variant: "info",
    });
  };
  
  // Remove a special card from the deck
  const removeSpecialCard = (cardName: string) => {
    setSelectedDeck(prev => prev.filter(card => !(card.name === cardName && specialCardsAdded[card.name])));
    setSpecialCardsAdded(prev => {
      const updated = { ...prev };
      delete updated[cardName];
      return updated;
    });
    
    toast({
      title: "Card Removed",
      description: `${cardName} removed from your deck.`,
      variant: "info",
    });
  };
  
  // Start game with current deck
  const startGame = () => {
    startNewGameWithDeck([...selectedDeck]);
    onConfirm();
  };
  
  // Quick start options
  const quickStart = (option: 'basic' | 'balanced' | 'aggressive' | 'random') => {
    const standardDeck = createStandardDeck();
    let finalDeck = [...standardDeck];
    
    switch (option) {
      case 'basic':
        // Standard deck only
        break;
        
      case 'balanced':
        // Add 3 balanced special cards
        finalDeck.push(specialCards[2]); // Business Card
        finalDeck.push(specialCards[5]); // Shield Card
        finalDeck.push(specialCards[9]); // Dog Card
        break;
        
      case 'aggressive':
        // Add 3 aggressive special cards
        finalDeck.push(specialCards[3]); // Infinity Card
        finalDeck.push(specialCards[7]); // The Chariot
        finalDeck.push(specialCards[8]); // Golden Vault Bank Card
        break;
        
      case 'random':
        // Add 3-5 random special cards
        const shuffled = [...specialCards].sort(() => 0.5 - Math.random());
        const numToAdd = Math.floor(Math.random() * 3) + 3; // 3-5 cards
        finalDeck = [...finalDeck, ...shuffled.slice(0, numToAdd)];
        break;
    }
    
    startNewGameWithDeck(finalDeck);
    onConfirm();
  };
  
  // Count how many special cards are in the deck
  const specialCardCount = Object.keys(specialCardsAdded).length;
  
  return (
    <div className="flex flex-col w-full max-w-md mx-auto bg-green-800 bg-opacity-95 rounded-lg shadow-lg h-[85vh] max-h-[640px] overflow-hidden">
      <h1 className="text-2xl font-bold text-center text-white py-4">Choose Your Deck</h1>
      
      {/* Quick Start Options */}
      <div className="grid grid-cols-2 gap-3 px-4">
        <div 
          className="bg-green-700 hover:bg-green-600 rounded-lg p-3 cursor-pointer border border-green-600 transition-colors duration-150 flex flex-col"
          onClick={() => quickStart('basic')}
        >
          <span className="text-lg font-semibold text-white text-center">Standard Deck</span>
          <span className="text-xs text-green-100 text-center">No special cards</span>
        </div>
        
        <div 
          className="bg-green-700 hover:bg-green-600 rounded-lg p-3 cursor-pointer border border-green-600 transition-colors duration-150 flex flex-col"
          onClick={() => quickStart('balanced')}
        >
          <span className="text-lg font-semibold text-white text-center">Balanced Deck</span>
          <span className="text-xs text-green-100 text-center">+3 balanced special cards</span>
        </div>
        
        <div 
          className="bg-green-700 hover:bg-green-600 rounded-lg p-3 cursor-pointer border border-green-600 transition-colors duration-150 flex flex-col"
          onClick={() => quickStart('aggressive')}
        >
          <span className="text-lg font-semibold text-white text-center">Aggressive Deck</span>
          <span className="text-xs text-green-100 text-center">+3 powerful special cards</span>
        </div>
        
        <div 
          className="bg-green-700 hover:bg-green-600 rounded-lg p-3 cursor-pointer border border-green-600 transition-colors duration-150 flex flex-col"
          onClick={() => quickStart('random')}
        >
          <span className="text-lg font-semibold text-white text-center">Random Deck</span>
          <span className="text-xs text-green-100 text-center">+3-5 random special cards</span>
        </div>
      </div>
      
      <div className="relative my-4 px-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-green-600" />
        </div>
        <div className="relative flex justify-center text-sm uppercase">
          <span className="bg-green-800 px-4 text-green-200 font-semibold">OR CUSTOMIZE YOUR DECK</span>
        </div>
      </div>
      
      {/* Special Cards Section */}
      <div className="px-4 mb-2 flex-1 overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold text-white">Special Cards</h2>
          <Badge className="bg-blue-600 text-white">{specialCardCount} added</Badge>
        </div>
        
        <ScrollArea className="h-[280px] pb-4 flex-1">
          <div className="grid grid-cols-2 gap-2 pr-4">
            {specialCards.map((card, index) => (
              <CardPreview
                key={`${card.name}-${index}`}
                card={card}
                onClick={() => addSpecialCard(card)}
                disabled={specialCardsAdded[card.name]}
              />
            ))}
          </div>
        </ScrollArea>
      </div>
      
      {/* Selected Special Cards */}
      {specialCardCount > 0 && (
        <div className="px-4 mb-4">
          <div className="border border-green-600 rounded-lg p-3 bg-green-700 bg-opacity-80 shadow-sm">
            <h2 className="text-lg font-semibold mb-2 text-white">Added Special Cards</h2>
            <div className="flex flex-wrap gap-2">
              {Object.keys(specialCardsAdded).map(cardName => (
                <Badge 
                  key={cardName}
                  variant="outline"
                  className="px-3 py-1 cursor-pointer bg-blue-600 hover:bg-blue-500 text-white border-blue-400"
                  onClick={() => removeSpecialCard(cardName)}
                >
                  {cardName} ✕
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Start Game Button */}
      <div className="px-4 pb-4">
        <div 
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-white text-xl font-semibold text-center cursor-pointer shadow-md transition-colors duration-150"
          onClick={startGame}
        >
          Start Game
        </div>
      </div>
    </div>
  );
};

export default DeckSelection; 