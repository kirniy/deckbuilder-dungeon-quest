import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Card, Deck, createStandardDeck, drawCard, shuffleDeck } from "@/lib/cards";

interface GameContextProps {
  // Player state
  playerHP: number;
  playerMaxHP: number;
  playerHand: Card[];
  playerTotal: number;
  playerShield: number;
  playerBonusDamage: number;
  playerChips: number;
  playerDeck: Deck;
  playerDiscardPile: Deck;
  
  // AI state
  aiHP: number;
  aiMaxHP: number;
  aiHand: Card[];
  aiTotal: number;
  aiStood: boolean;
  aiDeck: Deck;
  aiDiscardPile: Deck;
  
  // Game state and actions
  roundActive: boolean;
  gameOver: boolean;
  encounterCount: number;
  
  // Game actions
  hitPlayer: () => void;
  standPlayer: () => void;
  resetRound: () => void;
  startNewEncounter: () => void;
  addCardToDeck: (card: Card) => void;
  removeCardFromDeck: (cardIndex: number) => void;
  spendChips: (amount: number) => boolean;
  earnChips: (amount: number) => void;
  healPlayer: (amount: number) => void;
  resetGame: () => void;
}

const GameContext = createContext<GameContextProps | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};

export const GameProvider = ({ children }: { children: ReactNode }) => {
  // Constants
  const INITIAL_HP = 100;
  const INITIAL_CHIPS = 20;
  const MAX_AI_CARDS = 10; // Maximum number of cards the AI can draw to prevent infinite loops
  
  // Player state
  const [playerHP, setPlayerHP] = useState(INITIAL_HP);
  const [playerMaxHP, setPlayerMaxHP] = useState(INITIAL_HP);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [playerTotal, setPlayerTotal] = useState(0);
  const [playerShield, setPlayerShield] = useState(0);
  const [playerBonusDamage, setPlayerBonusDamage] = useState(0);
  const [playerChips, setPlayerChips] = useState(INITIAL_CHIPS);
  const [playerDeck, setPlayerDeck] = useState<Deck>(createStandardDeck());
  const [playerDiscardPile, setPlayerDiscardPile] = useState<Deck>([]);
  
  // AI state
  const [aiHP, setAiHP] = useState(INITIAL_HP);
  const [aiMaxHP, setAiMaxHP] = useState(INITIAL_HP);
  const [aiHand, setAiHand] = useState<Card[]>([]);
  const [aiTotal, setAiTotal] = useState(0);
  const [aiStood, setAiStood] = useState(false);
  const [aiDeck, setAiDeck] = useState<Deck>(createAIDeck());
  const [aiDiscardPile, setAiDiscardPile] = useState<Deck>([]);
  
  // Game state
  const [roundActive, setRoundActive] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [aiTurnInProgress, setAiTurnInProgress] = useState(false); // Track AI turn
  const [playerStood, setPlayerStood] = useState(false); // Track if player has stood
  const [encounterCount, setEncounterCount] = useState(1); // Track number of encounters
  
  // Function to create a custom AI deck
  function createAIDeck(): Deck {
    const deck: Deck = [];
    const suits: ["hearts", "diamonds", "clubs", "spades"] = ["hearts", "diamonds", "clubs", "spades"];
    
    // Add more high cards to make AI more competitive
    // 10s, Jacks, Queens, Kings (all value 10)
    for (const suit of suits) {
      // Add more 10-value cards
      for (let i = 0; i < 8; i++) {
        deck.push({
          value: 10,
          suit,
          type: "standard",
          name: `10 of ${suit}`,
        });
      }
      
      // Add some Aces (value 1, calculated as 11 if beneficial)
      for (let i = 0; i < 4; i++) {
        deck.push({
          value: 1,
          suit,
          type: "standard",
          name: `Ace of ${suit}`,
        });
      }
    }
    
    // Add some mid-value cards
    for (const suit of suits) {
      for (let value = 7; value <= 9; value++) {
        for (let i = 0; i < 3; i++) {
          deck.push({
            value,
            suit,
            type: "standard",
            name: `${value} of ${suit}`,
          });
        }
      }
    }
    
    // Add fewer low cards
    for (const suit of suits) {
      for (let value = 2; value <= 6; value++) {
        deck.push({
          value,
          suit,
          type: "standard",
          name: `${value} of ${suit}`,
        });
      }
    }
    
    // Shuffle the deck
    return shuffleDeck(deck);
  }
  
  // Calculate the total value of a hand, accounting for Aces
  const calculateHandTotal = (hand: Card[]) => {
    let total = 0;
    let aces = 0;
    
    // First pass: count non-Ace cards and track Aces
    for (const card of hand) {
      if (card.value === 1) {
        aces++;
      } else {
        total += card.value;
      }
    }
    
    // Second pass: add Aces as 11 or 1 depending on total
    for (let i = 0; i < aces; i++) {
      if (total + 11 <= 21) {
        total += 11;
      } else {
        total += 1;
      }
    }
    
    return total;
  };
  
  // Update totals whenever hands change
  useEffect(() => {
    setPlayerTotal(calculateHandTotal(playerHand));
  }, [playerHand]);
  
  useEffect(() => {
    setAiTotal(calculateHandTotal(aiHand));
  }, [aiHand]);
  
  // Draw a card for player
  const drawPlayerCard = () => {
    // If deck is empty, shuffle discard pile back into deck
    if (playerDeck.length === 0) {
      if (playerDiscardPile.length === 0) {
        // Both deck and discard are empty, create a new deck
        setPlayerDeck(createStandardDeck());
        return drawPlayerCard();
      } else {
        // Shuffle discard pile into deck
        setPlayerDeck(shuffleDeck([...playerDiscardPile]));
        setPlayerDiscardPile([]);
        return drawPlayerCard();
      }
    }
    
    // Draw from deck
    const card = playerDeck[0];
    setPlayerDeck(prevDeck => prevDeck.slice(1));
    return card;
  };
  
  // Draw a card for AI
  const drawAICard = () => {
    // If deck is empty, shuffle discard pile back into deck
    if (aiDeck.length === 0) {
      if (aiDiscardPile.length === 0) {
        // Both deck and discard are empty, create a new deck
        setAiDeck(createAIDeck());
        return drawAICard();
      } else {
        // Shuffle discard pile into deck
        setAiDeck(shuffleDeck([...aiDiscardPile]));
        setAiDiscardPile([]);
        return drawAICard();
      }
    }
    
    // Draw from deck
    const card = aiDeck[0];
    setAiDeck(prevDeck => prevDeck.slice(1));
    return card;
  };
  
  // AI draw single card function - for use in player turn
  const aiDrawCard = () => {
    if (roundActive && !aiStood) {
      // AI strategy:
      // 1. Always hit if total is less than 12 (very low risk of bust)
      // 2. Calculate risk based on current total and player's visible hand
      // 3. If player has strong hand (17+), take more risks
      // 4. Stand at 17+ by default
      
      const currentTotal = aiTotal;
      
      // Always hit if total is less than 12
      if (currentTotal < 12) {
        const card = drawAICard();
        setAiHand(prev => [...prev, card]);
        return;
      }
      
      // Stand at 17 or higher
      if (currentTotal >= 17) {
        setAiStood(true);
        
        // Check if player has also stood to resolve the round
        if (playerStood || playerTotal >= 21) {
          resolveRound();
        }
        return;
      }
      
      // Middle range (12-16) - decision based on strategy
      // If player showing strong hand, take more risk
      // Risk factor calculation: higher means more likely to hit
      const riskFactor = playerTotal >= 17 ? 0.7 : 0.4;
      
      // More aggressive if behind
      const aggressionBonus = playerTotal > currentTotal ? 0.2 : 0;
      
      // Careful if close to 21
      const cautionPenalty = currentTotal >= 16 ? 0.3 : 0;
      
      // Final calculation
      const hitProbability = riskFactor + aggressionBonus - cautionPenalty;
      
      if (Math.random() < hitProbability) {
        // Decided to hit
        const card = drawAICard();
        setAiHand(prev => [...prev, card]);
      } else {
        // Decided to stand
        setAiStood(true);
        
        // Check if player has also stood to resolve the round
        if (playerStood || playerTotal >= 21) {
          resolveRound();
        }
      }
    }
  };
  
  // AI takes its turn after player stands or busts
  const aiFinishTurn = async () => {
    if (aiTurnInProgress || !roundActive) return;
    
    setAiTurnInProgress(true);
    
    // AI already has 17 or more, just stand
    if (aiTotal >= 17) {
      setAiStood(true);
      setAiTurnInProgress(false);
      resolveRound();
      return;
    }
    
    // AI needs to draw until strategy says to stand
    let cardCount = 0;
    
    // Keep drawing until strategy says to stand or max cards reached
    while (cardCount < MAX_AI_CARDS) {
      // Wait for animation
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const currentTotal = calculateHandTotal(aiHand);
      
      // Always stand at 17 or higher
      if (currentTotal >= 17) {
        break;
      }
      
      // Always hit if less than 12
      if (currentTotal < 12) {
        const card = drawAICard();
        setAiHand(prev => [...prev, card]);
        cardCount++;
        continue;
      }
      
      // For 12-16 range, use strategic decision making
      const riskFactor = playerTotal >= 17 ? 0.7 : 0.4;
      const aggressionBonus = playerTotal > currentTotal ? 0.2 : 0;
      const cautionPenalty = currentTotal >= 16 ? 0.3 : 0;
      
      const hitProbability = riskFactor + aggressionBonus - cautionPenalty;
      
      if (Math.random() < hitProbability) {
        // Decided to hit
        const card = drawAICard();
        setAiHand(prev => [...prev, card]);
        cardCount++;
        
        // Check if AI busts with this new card
        const newTotal = calculateHandTotal([...aiHand, card]);
        if (newTotal > 21) {
          break;
        }
      } else {
        // Decided to stand
        break;
      }
    }
    
    // AI's turn is complete
    setAiStood(true);
    setAiTurnInProgress(false);
    resolveRound();
  };
  
  // Initialize the round
  useEffect(() => {
    if (roundActive && playerHand.length === 0 && aiHand.length === 0) {
      // Both start with no cards, waiting for player to hit
    }
  }, [roundActive, playerHand.length, aiHand.length]);
  
  // Player actions
  const hitPlayer = () => {
    if (!roundActive) return;
    
    const card = drawPlayerCard();
    setPlayerHand(prev => [...prev, card]);
    
    // Check if player busts
    const newTotal = calculateHandTotal([...playerHand, card]);
    if (newTotal > 21) {
      setPlayerStood(true);
      aiFinishTurn();
      return;
    }
    
    // AI takes its turn after player if not stood
    if (!aiStood) {
      // Add a small delay before AI moves
      setTimeout(() => {
        aiDrawCard();
      }, 500);
    }
  };
  
  const standPlayer = () => {
    if (!roundActive) return;
    
    setPlayerStood(true);
    
    // AI completes its turn after player stands
    aiFinishTurn();
  };
  
  // Resolve the round and apply damage
  const resolveRound = () => {
    setRoundActive(false);
    
    // Both busted: no damage
    if (playerTotal > 21 && aiTotal > 21) {
      return;
    }
    
    // Player busted: take damage equal to AI's total
    if (playerTotal > 21 && aiTotal <= 21) {
      applyDamageToPlayer(aiTotal);
      return;
    }
    
    // AI busted: deal damage equal to player's total
    if (aiTotal > 21 && playerTotal <= 21) {
      const damage = playerTotal + playerBonusDamage;
      applyDamageToAI(damage);
      
      // Award chips for winning
      earnChips(10);
      return;
    }
    
    // Neither busted: compare totals
    if (playerTotal <= 21 && aiTotal <= 21) {
      if (playerTotal > aiTotal) {
        // Player wins
        const damage = playerTotal - aiTotal + playerBonusDamage;
        applyDamageToAI(damage);
        
        // Award chips for winning
        earnChips(10);
      } else if (aiTotal > playerTotal) {
        // AI wins
        const damage = aiTotal - playerTotal;
        applyDamageToPlayer(damage);
      }
      // Tie: no damage
    }
    
    // Check for blackjack bonus (exactly 21)
    if (playerTotal === 21 && playerHand.length > 0) {
      const lastCard = playerHand[playerHand.length - 1];
      
      // Apply suit-based bonus
      switch (lastCard.suit) {
        case "hearts":
          // Hearts: Heal 5 HP
          healPlayer(5);
          break;
        case "diamonds":
          // Diamonds: Gain 5 chips
          earnChips(5);
          break;
        case "clubs":
          // Clubs: Increase damage next round by 5
          setPlayerBonusDamage(5);
          break;
        case "spades":
          // Spades: Gain a 5 HP shield
          setPlayerShield(5);
          break;
      }
    }
    
    // Move all cards to discard piles
    setPlayerDiscardPile(prev => [...prev, ...playerHand]);
    setAiDiscardPile(prev => [...prev, ...aiHand]);
    
    // Clear hands
    setPlayerHand([]);
    setAiHand([]);
  };
  
  // Apply damage functions
  const applyDamageToPlayer = (damage: number) => {
    // Apply shield if available
    if (playerShield > 0) {
      if (damage <= playerShield) {
        setPlayerShield(prev => prev - damage);
        return;
      } else {
        damage -= playerShield;
        setPlayerShield(0);
      }
    }
    
    // Apply remaining damage to HP
    const newHP = Math.max(0, playerHP - damage);
    setPlayerHP(newHP);
    
    // Check for game over
    if (newHP <= 0) {
      setGameOver(true);
    }
  };
  
  const applyDamageToAI = (damage: number) => {
    const newHP = Math.max(0, aiHP - damage);
    setAiHP(newHP);
    
    // Check for game over
    if (newHP <= 0) {
      setGameOver(true);
    }
  };
  
  // Reset for a new round
  const resetRound = () => {
    setPlayerHand([]);
    setAiHand([]);
    setPlayerStood(false);
    setAiStood(false);
    setAiTurnInProgress(false);
    setRoundActive(true);
  };
  
  // Start a new encounter (after defeating an opponent)
  const startNewEncounter = () => {
    // Increment encounter counter
    setEncounterCount(prev => prev + 1);
    
    // Create a new AI with slightly higher HP
    setAiHP(INITIAL_HP + (encounterCount * 10));
    setAiMaxHP(INITIAL_HP + (encounterCount * 10));
    
    // Reset the AI's deck
    setAiDeck(createAIDeck());
    setAiDiscardPile([]);
    
    // Reset round state
    resetRound();
  };
  
  // Deck modification functions
  const addCardToDeck = (card: Card) => {
    setPlayerDeck(prev => [...prev, card]);
  };
  
  const removeCardFromDeck = (cardIndex: number) => {
    setPlayerDeck(prev => prev.filter((_, index) => index !== cardIndex));
  };
  
  // Resource management
  const spendChips = (amount: number) => {
    if (playerChips >= amount) {
      setPlayerChips(prev => prev - amount);
      return true;
    }
    return false;
  };
  
  const earnChips = (amount: number) => {
    setPlayerChips(prev => prev + amount);
  };
  
  const healPlayer = (amount: number) => {
    setPlayerHP(prev => Math.min(playerMaxHP, prev + amount));
  };
  
  // Reset the entire game
  const resetGame = () => {
    setPlayerHP(INITIAL_HP);
    setPlayerMaxHP(INITIAL_HP);
    setPlayerHand([]);
    setPlayerTotal(0);
    setPlayerShield(0);
    setPlayerBonusDamage(0);
    setPlayerChips(INITIAL_CHIPS);
    setPlayerDeck(createStandardDeck());
    setPlayerDiscardPile([]);
    
    setAiHP(INITIAL_HP);
    setAiMaxHP(INITIAL_HP);
    setAiHand([]);
    setAiTotal(0);
    setAiStood(false);
    setAiDeck(createAIDeck());
    setAiDiscardPile([]);
    
    setAiTurnInProgress(false);
    setPlayerStood(false);
    setEncounterCount(1);
    
    setRoundActive(true);
    setGameOver(false);
  };
  
  const value = {
    // Player state
    playerHP,
    playerMaxHP,
    playerHand,
    playerTotal,
    playerShield,
    playerBonusDamage,
    playerChips,
    playerDeck,
    playerDiscardPile,
    
    // AI state
    aiHP,
    aiMaxHP,
    aiHand,
    aiTotal,
    aiStood,
    aiDeck,
    aiDiscardPile,
    
    // Game state
    roundActive,
    gameOver,
    encounterCount,
    
    // Game actions
    hitPlayer,
    standPlayer,
    resetRound,
    startNewEncounter,
    addCardToDeck,
    removeCardFromDeck,
    spendChips,
    earnChips,
    healPlayer,
    resetGame,
  };
  
  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};
