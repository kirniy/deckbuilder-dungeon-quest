// Define card suits
export type CardSuit = "hearts" | "diamonds" | "clubs" | "spades" | "special" | "business" | "tarot";

// Define types of cards (standard playing cards, tarot, business, etc.)
export type CardType = "standard" | "tarot" | "business" | "special";

// Define effect triggers
export type EffectTrigger = "onPlay" | "onStand" | "onRoundWin" | "onRoundLose" | "onTie" | "persistent";

// Define effect types
export type EffectType = 
  "modifyValue" | 
  "modifyHandTotal" | 
  "gainChips" | 
  "loseChips" | 
  "autoWin" | 
  "gainShield" | 
  "damageOpponent" | 
  "healPlayer" | 
  "randomValue" | 
  "summon" | 
  "removeOpponentCard";

// Define card effect
export interface CardEffect {
  type: EffectType;
  trigger: EffectTrigger;
  amount?: number;
  duration?: "once" | "round" | "persistent";
  range?: [number, number]; // For random effects
  summonType?: string;
  description: string;
}

// Card interface
export interface Card {
  value: number | number[];
  suit: CardSuit;
  type: CardType;
  name: string;
  description?: string;
  image?: string;
  effect?: CardEffect | null;
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
export function drawCard(deck: Deck): Card {
  if (deck.length === 0) {
    throw new Error("Cannot draw from an empty deck");
  }
  
  // Draw the top card
  return deck[0];
}

// Special Cards from Dungeons & Degenerate Gamblers
export function createSpecialCards(): Card[] {
  return [
    // Ace of Spades (Value: 1 or 11, standard blackjack ace behavior)
    {
      value: [1, 11],
      suit: "spades",
      type: "standard",
      name: "Ace of Spades",
      description: "Value can be 1 or 11, whichever is more beneficial",
      effect: null
    },
    
    // Debt Card (Value: -2, Reduces player's hand total)
    {
      value: -2,
      suit: "special",
      type: "special",
      name: "Debt Card",
      description: "Reduces hand total by 2, useful for avoiding busts",
      effect: {
        type: "modifyHandTotal",
        trigger: "onPlay",
        amount: -2,
        duration: "once",
        description: "Reduces hand total by 2"
      }
    },
    
    // Business Card (Value: 5, Gain 5 chips when played)
    {
      value: 5,
      suit: "business",
      type: "business",
      name: "Business Card",
      description: "Gain 5 chips when played",
      effect: {
        type: "gainChips",
        trigger: "onPlay",
        amount: 5,
        duration: "once",
        description: "Gain 5 chips when played"
      }
    },
    
    // Infinity Card (Value: 21, Automatically wins the round)
    {
      value: 21,
      suit: "special",
      type: "special",
      name: "Infinity Card",
      description: "Automatically wins the round unless opponent has an Infinity Card",
      effect: {
        type: "autoWin",
        trigger: "onPlay",
        duration: "once",
        description: "Automatically wins the round"
      }
    },
    
    // Half Card (Value: 0.5, Adds precision to hand total)
    {
      value: 0.5,
      suit: "special",
      type: "special",
      name: "Half Card",
      description: "Adds 0.5 to hand total for precision plays",
      effect: null
    },
    
    // Shield Card (Value: 3, Grants 3 HP shield for one round)
    {
      value: 3,
      suit: "special",
      type: "special",
      name: "Shield Card",
      description: "Grants a 3 HP shield for one round",
      effect: {
        type: "gainShield",
        trigger: "onPlay",
        amount: 3,
        duration: "round",
        description: "Grants a 3 HP shield for one round"
      }
    },
    
    // The Fool (Value: Random 1-10, Value determined when played)
    {
      value: 0, // Initial value, will be set when played
      suit: "tarot",
      type: "tarot",
      name: "The Fool",
      description: "Takes a random value between 1-10 when played",
      effect: {
        type: "randomValue",
        trigger: "onPlay",
        range: [1, 10],
        duration: "once",
        description: "Takes a random value between 1-10 when played"
      }
    },
    
    // The Chariot (Value: 7, Deals 2 damage to opponent when played)
    {
      value: 7,
      suit: "tarot",
      type: "tarot",
      name: "The Chariot",
      description: "Worth 7 and deals 2 damage to opponent when played",
      effect: {
        type: "damageOpponent",
        trigger: "onPlay",
        amount: 2,
        duration: "once",
        description: "Deals 2 damage to opponent when played"
      }
    },
    
    // Golden Vault Bank Card (Value: 10, Gain 10 chips if you win the round)
    {
      value: 10,
      suit: "business",
      type: "business",
      name: "Golden Vault Bank Card",
      description: "Worth 10 and gain 10 chips if you win the round",
      effect: {
        type: "gainChips",
        trigger: "onRoundWin",
        amount: 10,
        duration: "once",
        description: "Gain 10 chips if you win the round"
      }
    },
    
    // Dog Card (Value: 4, Summons a dog that adds +1 to hand total each turn)
    {
      value: 4,
      suit: "special",
      type: "special",
      name: "Dog Card",
      description: "Summons a dog that adds +1 to your hand total each turn until defeated",
      effect: {
        type: "summon",
        trigger: "onPlay",
        amount: 1,
        duration: "persistent",
        summonType: "dog",
        description: "Summons a dog that adds +1 to your hand total each turn"
      }
    }
  ];
}

// Create shop cards (3-5 random options)
export function generateShopOptions(): Card[] {
  const allSpecialCards = createSpecialCards();
  const result: Card[] = [];
  
  // Ensure we have at least one card of each type
  const cardTypes: CardType[] = ["tarot", "business", "special"];
  
  for (const type of cardTypes) {
    const cardsOfType = allSpecialCards.filter(card => card.type === type);
    if (cardsOfType.length > 0) {
      // Add a random card of this type
      const randomCard = cardsOfType[Math.floor(Math.random() * cardsOfType.length)];
      result.push({...randomCard}); // Clone to avoid reference issues
    }
  }
  
  // Fill remaining slots (up to 5 total) with random cards
  const remainingCards = allSpecialCards.filter(card => 
    !result.some(resultCard => resultCard.name === card.name)
  );
  
  const shuffled = shuffleDeck(remainingCards);
  const remainingSlots = Math.min(2, shuffled.length); // Up to 2 more cards
  
  for (let i = 0; i < remainingSlots; i++) {
    result.push({...shuffled[i]}); // Clone to avoid reference issues
  }
  
  return result;
}
