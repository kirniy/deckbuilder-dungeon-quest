
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Card, Deck, createStandardDeck, drawCard } from "@/lib/cards";

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
  
  // AI state
  aiHP: number;
  aiMaxHP: number;
  aiHand: Card[];
  aiTotal: number;
  aiStood: boolean;
  
  // Game state and actions
  roundActive: boolean;
  gameOver: boolean;
  
  // Game actions
  hitPlayer: () => void;
  standPlayer: () => void;
  resetRound: () => void;
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
  
  // Player state
  const [playerHP, setPlayerHP] = useState(INITIAL_HP);
  const [playerMaxHP, setPlayerMaxHP] = useState(INITIAL_HP);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [playerTotal, setPlayerTotal] = useState(0);
  const [playerShield, setPlayerShield] = useState(0);
  const [playerBonusDamage, setPlayerBonusDamage] = useState(0);
  const [playerChips, setPlayerChips] = useState(INITIAL_CHIPS);
  const [playerDeck, setPlayerDeck] = useState<Deck>(createStandardDeck());
  
  // AI state
  const [aiHP, setAiHP] = useState(INITIAL_HP);
  const [aiMaxHP, setAiMaxHP] = useState(INITIAL_HP);
  const [aiHand, setAiHand] = useState<Card[]>([]);
  const [aiTotal, setAiTotal] = useState(0);
  const [aiStood, setAiStood] = useState(false);
  
  // Game state
  const [roundActive, setRoundActive] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  
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
  
  // AI logic: hit until 17 or higher
  useEffect(() => {
    if (roundActive && aiStood === false && playerHand.length > 0) {
      // AI turn after player stands or busts
      const aiTurn = async () => {
        while (aiTotal < 17) {
          // Wait a bit for animation
          await new Promise(resolve => setTimeout(resolve, 800));
          
          if (aiTotal < 17) {
            // Draw a card
            const [newCard, updatedDeck] = drawCard(playerDeck);
            setAiHand(prev => [...prev, newCard]);
            
            // Check if AI busts
            const newTotal = calculateHandTotal([...aiHand, newCard]);
            if (newTotal > 21) {
              break;
            }
          }
        }
        
        setAiStood(true);
        resolveRound();
      };
      
      if (playerTotal >= 21 || playerHand.length === 0) {
        aiTurn();
      }
    }
  }, [aiTotal, aiStood, playerHand, roundActive]);
  
  // Player actions
  const hitPlayer = () => {
    if (!roundActive) return;
    
    const [newCard, updatedDeck] = drawCard(playerDeck);
    setPlayerHand(prev => [...prev, newCard]);
    setPlayerDeck(updatedDeck);
    
    // Check if player busts
    const newTotal = calculateHandTotal([...playerHand, newCard]);
    if (newTotal > 21) {
      standPlayer();
    }
  };
  
  const standPlayer = () => {
    if (!roundActive) return;
    setAiStood(false); // Trigger AI turn
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
    
    // Reset bonus damage if it was used this round
    if (playerBonusDamage > 0 && playerTotal <= 21) {
      setPlayerBonusDamage(0);
    }
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
    setPlayerHP(prev => Math.max(0, prev - damage));
    
    // Check for game over
    if (playerHP - damage <= 0) {
      setGameOver(true);
    }
  };
  
  const applyDamageToAI = (damage: number) => {
    setAiHP(prev => Math.max(0, prev - damage));
    
    // Check for game over
    if (aiHP - damage <= 0) {
      setGameOver(true);
    }
  };
  
  // Reset for a new round
  const resetRound = () => {
    setPlayerHand([]);
    setAiHand([]);
    setAiStood(false);
    setRoundActive(true);
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
    
    setAiHP(INITIAL_HP);
    setAiMaxHP(INITIAL_HP);
    setAiHand([]);
    setAiTotal(0);
    setAiStood(false);
    
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
    
    // AI state
    aiHP,
    aiMaxHP,
    aiHand,
    aiTotal,
    aiStood,
    
    // Game state
    roundActive,
    gameOver,
    
    // Game actions
    hitPlayer,
    standPlayer,
    resetRound,
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
