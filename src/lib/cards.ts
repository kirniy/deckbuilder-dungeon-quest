
// Define card suits
export type CardSuit = "hearts" | "diamonds" | "clubs" | "spades";

// Define types of cards (standard playing cards, tarot, business, etc.)
export type CardType = "standard" | "tarot" | "business" | "special";

// Card interface
export interface Card {
  value: number;
  suit: CardSuit;
  type: CardType;
  name: string;
  description?: string;
  image?: string;
  effect?: (context: any) => void;
}

// Deck is an array of cards
export type Deck = Card[];

// Create a standard 52-card deck
export function createStandardDeck(): Deck {
  const deck: Deck = [];
  const suits: CardSuit[] = ["hearts", "diamonds", "clubs", "spades"];
  
  // Add cards 2-10 for each suit
  for (const suit of suits) {
    for (let value = 2; value <= 10; value++) {
      deck.push({
        value,
        suit,
        type: "standard",
        name: `${value} of ${suit}`,
      });
    }
    
    // Add face cards (Jack, Queen, King) with value 10
    for (const face of ["Jack", "Queen", "King"]) {
      deck.push({
        value: 10,
        suit,
        type: "standard",
        name: `${face} of ${suit}`,
      });
    }
    
    // Add Ace with value 1 (will be calculated as 11 if beneficial)
    deck.push({
      value: 1,
      suit,
      type: "standard",
      name: `Ace of ${suit}`,
    });
  }
  
  // Shuffle the deck
  return shuffleDeck(deck);
}

// Shuffle a deck of cards
export function shuffleDeck(deck: Deck): Deck {
  const shuffled = [...deck];
  
  // Fisher-Yates shuffle algorithm
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
}

// Draw a card from the deck
export function drawCard(deck: Deck): [Card, Deck] {
  if (deck.length === 0) {
    // If deck is empty, create a new shuffled deck and draw
    const newDeck = createStandardDeck();
    const drawnCard = newDeck[0];
    return [drawnCard, newDeck.slice(1)];
  }
  
  // Draw the top card and return the remaining deck
  const drawnCard = deck[0];
  return [drawnCard, deck.slice(1)];
}

// Special Cards
export function createSpecialCards(): Card[] {
  return [
    // Tarot Cards
    {
      value: 0, // Value determined at runtime
      suit: "hearts",
      type: "tarot",
      name: "The Fool",
      description: "Takes a random value between 1-10",
      effect: (context) => {
        return Math.floor(Math.random() * 10) + 1;
      }
    },
    
    // Business Cards
    {
      value: 5,
      suit: "diamonds",
      type: "business",
      name: "Gerald from Riviera",
      description: "Removes one card from the AI's hand",
      effect: (context) => {
        // Implementation would be in the game logic
      }
    },
    
    // Special Cards
    {
      value: 0.5,
      suit: "hearts",
      type: "special",
      name: "Half Card",
      description: "Worth 0.5 points for precision plays"
    },
    {
      value: 21,
      suit: "spades",
      type: "special",
      name: "Blackjack Card",
      description: "Worth exactly 21 points, but high risk"
    }
  ];
}

// Create shop cards (3-5 random options)
export function generateShopOptions(): Card[] {
  const specialCards = createSpecialCards();
  
  // Shuffle and take random subset
  const shuffled = shuffleDeck(specialCards);
  const count = Math.floor(Math.random() * 3) + 3; // 3-5 options
  
  return shuffled.slice(0, count);
}
