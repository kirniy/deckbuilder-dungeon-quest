import React, { useState, useMemo } from "react";
import { Card, Deck, createStandardDeck, createSpecialCards } from "@/lib/cards";
import { useGame } from "@/context/GameContext";
import { Button } from "@/components/ui/button";
import { CardPreview } from "./CardPreview";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Slider } from "@/components/ui/slider";

interface DeckSelectionProps {
  onConfirm: () => void;
}

const DeckSelection: React.FC<DeckSelectionProps> = ({ onConfirm }) => {
  const { startNewGameWithDeck } = useGame();
  const { toast } = useToast();
  
  // Start with a standard deck
  const [selectedDeck, setSelectedDeck] = useState<Deck>(createStandardDeck());
  const [specialCardsAdded, setSpecialCardsAdded] = useState<Record<string, boolean>>({});
  const [deckSize, setDeckSize] = useState<number>(52); // Default standard deck size
  const [cardDistribution, setCardDistribution] = useState({
    low: 1, // Relative weight of low cards (2-6)
    medium: 1, // Relative weight of medium cards (7-10)
    high: 1, // Relative weight of face cards and aces
  });
  
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
  
  // Generate a custom deck based on size and distribution
  const generateCustomDeck = () => {
    const suits = ["hearts", "diamonds", "clubs", "spades"] as const;
    const customDeck: Card[] = [];
    
    // Calculate how many cards of each type based on distribution
    const total = cardDistribution.low + cardDistribution.medium + cardDistribution.high;
    const regularDeckSize = deckSize - Object.keys(specialCardsAdded).length;
    
    const lowCardCount = Math.floor((regularDeckSize * cardDistribution.low) / total);
    const mediumCardCount = Math.floor((regularDeckSize * cardDistribution.medium) / total);
    const highCardCount = regularDeckSize - lowCardCount - mediumCardCount;
    
    // Track how many of each card to add
    const lowCardsPerSuit = Math.ceil(lowCardCount / (suits.length * 5)); // 5 low cards per suit (2-6)
    const mediumCardsPerSuit = Math.ceil(mediumCardCount / (suits.length * 4)); // 4 medium cards per suit (7-10)
    const highCardsPerSuit = Math.ceil(highCardCount / (suits.length * 5)); // 5 high cards per suit (J,Q,K,A)
    
    for (const suit of suits) {
      // Add low cards (2-6)
      for (let value = 2; value <= 6; value++) {
        for (let i = 0; i < lowCardsPerSuit; i++) {
          customDeck.push({
            value,
            suit,
            type: "standard",
            name: `${value} of ${suit}`,
          });
        }
      }
      
      // Add medium cards (7-10)
      for (let value = 7; value <= 10; value++) {
        for (let i = 0; i < mediumCardsPerSuit; i++) {
          customDeck.push({
            value,
            suit,
            type: "standard",
            name: `${value} of ${suit}`,
          });
        }
      }
      
      // Add face cards (J,Q,K)
      for (const face of ["Jack", "Queen", "King"]) {
        for (let i = 0; i < highCardsPerSuit; i++) {
          customDeck.push({
            value: 10,
            suit,
            type: "standard",
            name: `${face} of ${suit}`,
          });
        }
      }
      
      // Add Aces
      for (let i = 0; i < highCardsPerSuit; i++) {
        customDeck.push({
          value: 1,
          suit,
          type: "standard",
          name: `Ace of ${suit}`,
        });
      }
    }
    
    // Add special cards
    const specialCardsList = Object.keys(specialCardsAdded).map(name => 
      specialCards.find(card => card.name === name)
    ).filter(Boolean) as Card[];
    
    // Shuffle and trim to desired size
    const shuffled = [...customDeck].sort(() => 0.5 - Math.random()).slice(0, deckSize - specialCardsList.length);
    
    setSelectedDeck([...shuffled, ...specialCardsList]);
    
    toast({
      title: "Custom Deck Created",
      description: `Created a deck with ${shuffled.length} standard cards and ${specialCardsList.length} special cards.`,
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
    <div className="flex flex-col w-full max-w-md mx-auto bg-green-800 bg-opacity-95 rounded-lg shadow-lg h-full min-h-[500px] sm:h-[85vh] overflow-hidden relative">
      <Tabs defaultValue="quick" className="flex flex-col h-full">
        <div className="flex justify-center py-2 px-4 bg-green-900 bg-opacity-50 sticky top-0 z-10">
          <TabsList className="w-full bg-green-700 border border-green-600">
            <TabsTrigger 
              value="quick" 
              className="flex-1 text-sm data-[state=active]:bg-green-600"
            >
              Quick Start
            </TabsTrigger>
            <TabsTrigger 
              value="custom" 
              className="flex-1 text-sm data-[state=active]:bg-green-600"
            >
              Custom Deck
            </TabsTrigger>
          </TabsList>
        </div>
      
        <div className="flex-1 overflow-hidden">
          <TabsContent value="quick" className="flex flex-col h-full m-0 data-[state=active]:flex">
            <ScrollArea className="flex-1 px-4 pb-20">
              <h1 className="text-2xl font-bold text-center text-white py-4">Choose Your Deck</h1>
              
              {/* Quick Start Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-4">
                <QuickStartOption
                  title="Standard Deck"
                  description="No special cards"
                  onClick={() => quickStart('basic')}
                />
                
                <QuickStartOption
                  title="Balanced Deck"
                  description="+3 balanced special cards"
                  onClick={() => quickStart('balanced')}
                />
                
                <QuickStartOption
                  title="Aggressive Deck"
                  description="+3 powerful special cards"
                  onClick={() => quickStart('aggressive')}
                />
                
                <QuickStartOption
                  title="Random Deck"
                  description="+3-5 random special cards"
                  onClick={() => quickStart('random')}
                />
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="custom" className="flex flex-col h-full m-0 data-[state=active]:flex">
            <ScrollArea className="flex-1 px-4 pb-20">
              <h1 className="text-2xl font-bold text-center text-white py-4">Customize Your Deck</h1>
              
              {/* Deck Size Control */}
              <div className="mb-8 bg-green-700 bg-opacity-50 p-4 rounded-lg border border-green-600">
                <h2 className="text-lg font-semibold text-white mb-2">Deck Size: {deckSize} cards</h2>
                <Slider
                  value={[deckSize]}
                  min={20}
                  max={100}
                  step={1}
                  onValueChange={(values) => setDeckSize(values[0])}
                  className="mb-4"
                />
                
                {/* Card Distribution Control */}
                <h2 className="text-lg font-semibold text-white mb-2">Card Distribution</h2>
                
                <div className="grid gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm text-green-100">Low Cards (2-6): {cardDistribution.low}</span>
                    </div>
                    <Slider
                      value={[cardDistribution.low]}
                      min={0}
                      max={10}
                      step={1}
                      onValueChange={(values) => setCardDistribution(prev => ({ ...prev, low: values[0] }))}
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm text-green-100">Medium Cards (7-10): {cardDistribution.medium}</span>
                    </div>
                    <Slider
                      value={[cardDistribution.medium]}
                      min={0}
                      max={10}
                      step={1}
                      onValueChange={(values) => setCardDistribution(prev => ({ ...prev, medium: values[0] }))}
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm text-green-100">High Cards (Face & Aces): {cardDistribution.high}</span>
                    </div>
                    <Slider
                      value={[cardDistribution.high]}
                      min={0}
                      max={10}
                      step={1}
                      onValueChange={(values) => setCardDistribution(prev => ({ ...prev, high: values[0] }))}
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={generateCustomDeck}
                  className="w-full mt-4 bg-green-600 hover:bg-green-500 text-white"
                >
                  Generate Deck
                </Button>
              </div>
              
              {/* Special Cards */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-white mb-2 flex items-center">
                  Special Cards
                  <Badge variant="secondary" className="ml-2 bg-green-600 text-white">
                    {specialCardCount} added
                  </Badge>
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  {specialCards.map((card, index) => (
                    <div 
                      key={`special-card-${index}`}
                      className="bg-green-700 rounded-lg p-3 border border-green-600 flex flex-col"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-lg font-semibold text-white">{card.name}</span>
                        
                        {specialCardsAdded[card.name] ? (
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => removeSpecialCard(card.name)}
                            className="h-8 px-2 text-xs"
                          >
                            Remove
                          </Button>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => addSpecialCard(card)}
                            className="h-8 px-2 text-xs bg-green-600 hover:bg-green-500 text-white border-green-500"
                          >
                            Add
                          </Button>
                        )}
                      </div>
                      
                      <div className="text-sm text-green-100 mb-2">
                        {card.description || "A special card with unique effects."}
                      </div>
                      
                      <div className="flex-grow flex justify-center items-center">
                        <div className="w-20 h-28 scale-90">
                          <CardPreview card={card} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </div>
        
        {/* Start Game Button - Fixed at bottom */}
        <div className="sticky bottom-0 p-4 bg-green-900 border-t border-green-700 shadow-lg z-10">
          <Button 
            onClick={startGame}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white text-lg py-6 font-bold"
          >
            Start Game
          </Button>
        </div>
      </Tabs>
    </div>
  );
};

// Quick Start Option Component
interface QuickStartOptionProps {
  title: string;
  description: string;
  onClick: () => void;
}

const QuickStartOption: React.FC<QuickStartOptionProps> = ({ title, description, onClick }) => (
  <div 
    className="bg-green-700 hover:bg-green-600 rounded-lg p-4 cursor-pointer border border-green-600 transition-colors duration-150 flex flex-col"
    onClick={onClick}
  >
    <span className="text-xl font-semibold text-white text-center">{title}</span>
    <span className="text-sm text-green-100 text-center mt-2">{description}</span>
  </div>
);

export default DeckSelection; 