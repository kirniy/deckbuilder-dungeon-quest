import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { Card, Deck, createStandardDeck, drawCard, shuffleDeck } from "@/lib/cards";

type CardSuit = "hearts" | "diamonds" | "clubs" | "spades";

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
  playerStood: boolean;
  
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
  roundPhase: RoundPhase;
  actionLog: string[];
  roundMessage: string | null;
  currentPhaseRef: React.RefObject<RoundPhase>;
  playerStoodRef: React.RefObject<boolean>;
  
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
  startRound: () => void;
  logAction: (message: string) => void;
  applyDamageToPlayer: (damage: number) => void;
  applyDamageToAI: (damage: number) => void;
  checkForGameOver: () => void;
}

type RoundPhase = 'idle' | 'playerTurn' | 'aiTurn' | 'resolution';

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
  const MAX_ENCOUNTERS = 10; // Maximum number of encounters before game is complete
  const MAX_AI_CARDS = 10; // Maximum number of cards the AI can draw to prevent infinite loops
  
  // Player state
  const [playerHP, setPlayerHP] = useState(INITIAL_HP);
  const [playerMaxHP, setPlayerMaxHP] = useState(INITIAL_HP);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [playerTotal, setPlayerTotal] = useState(0);
  const [playerStood, setPlayerStood] = useState(false);
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
  const [aiDeck, setAiDeck] = useState<Deck>(() => {
    // Create a default AI deck (encounter 1)
    return createAIDeck(1); 
  });
  const [aiDiscardPile, setAiDiscardPile] = useState<Deck>([]);
  
  // Game state
  const [roundActive, setRoundActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [encounterCount, setEncounterCount] = useState(1); // Track number of encounters
  const [roundPhase, setRoundPhase] = useState<RoundPhase>('idle');
  const [actionLog, setActionLog] = useState<string[]>([]);
  const [roundMessage, setRoundMessage] = useState<string | null>(null);
  const [hasPlayedCards, setHasPlayedCards] = useState(false);
  
  // Add a ref to track the current phase to avoid asynchronous state issues
  const currentPhaseRef = useRef<RoundPhase>('idle');
  
  // Track player stood state with ref for immediate access
  const playerStoodRef = useRef(false);
  
  // Update the ref whenever roundPhase changes
  useEffect(() => {
    currentPhaseRef.current = roundPhase;
    console.log(`DEBUG: Phase changed to: ${roundPhase}`);
  }, [roundPhase]);

  // Update ref when state changes
  useEffect(() => {
    playerStoodRef.current = playerStood;
  }, [playerStood]);
  
  // Function to create a custom AI deck based on encounter number
  function createAIDeck(currentEncounter: number = 1): Deck {
    const deck: Deck = [];
    const suits: CardSuit[] = ["hearts", "diamonds", "clubs", "spades"];
    
    // Different AI types based on encounter
    const aiType = currentEncounter % 4;
    
    switch (aiType) {
      case 0: // Novice AI - Balanced deck, more low cards
        for (const suit of suits) {
          // More low cards (2-6)
          for (let i = 0; i < 3; i++) {
            for (let value = 2; value <= 6; value++) {
              deck.push({
                value,
                suit,
                type: "standard",
                name: `${value} of ${suit}`,
              });
            }
          }
          
          // Medium cards (7-10)
          for (let i = 0; i < 2; i++) {
            for (let value = 7; value <= 10; value++) {
              deck.push({
                value,
                suit,
                type: "standard",
                name: `${value} of ${suit}`,
              });
            }
          }
          
          // Face cards and Aces
          deck.push({
            value: 10,
            suit,
            type: "standard",
            name: `Jack of ${suit}`,
          });
          deck.push({
            value: 10,
            suit,
            type: "standard",
            name: `Queen of ${suit}`,
          });
          deck.push({
            value: 10,
            suit,
            type: "standard",
            name: `King of ${suit}`,
          });
          deck.push({
            value: 1,
            suit,
            type: "standard",
            name: `Ace of ${suit}`,
          });
        }
        break;
        
      case 1: // Aggressive AI - More high value cards
        for (const suit of suits) {
          // Few low cards (2-6)
          for (let value = 2; value <= 6; value++) {
            deck.push({
              value,
              suit,
              type: "standard",
              name: `${value} of ${suit}`,
            });
          }
          
          // More high cards (7-10)
          for (let i = 0; i < 3; i++) {
            for (let value = 7; value <= 10; value++) {
              deck.push({
                value,
                suit,
                type: "standard",
                name: `${value} of ${suit}`,
              });
            }
          }
          
          // More face cards
          for (let i = 0; i < 2; i++) {
            deck.push({
              value: 10,
              suit,
              type: "standard",
              name: `Jack of ${suit}`,
            });
            deck.push({
              value: 10,
              suit,
              type: "standard",
              name: `Queen of ${suit}`,
            });
            deck.push({
              value: 10,
              suit,
              type: "standard",
              name: `King of ${suit}`,
            });
            deck.push({
              value: 1,
              suit,
              type: "standard",
              name: `Ace of ${suit}`,
            });
          }
        }
        break;
        
      case 2: // Defensive AI - Very conservative, stands at 14+
        for (const suit of suits) {
          // Few low cards (2-5)
          for (let value = 2; value <= 5; value++) {
            deck.push({
              value,
              suit,
              type: "standard",
              name: `${value} of ${suit}`,
            });
          }
          
          // Many medium cards (6-9)
          for (let i = 0; i < 4; i++) {
            for (let value = 6; value <= 9; value++) {
              deck.push({
                value,
                suit,
                type: "standard",
                name: `${value} of ${suit}`,
              });
            }
          }
          
          // Few high cards and face cards
          deck.push({
            value: 10,
            suit,
            type: "standard",
            name: `10 of ${suit}`,
          });
          deck.push({
            value: 10,
            suit,
            type: "standard",
            name: `Jack of ${suit}`,
          });
          deck.push({
            value: 10,
            suit,
            type: "standard",
            name: `Queen of ${suit}`,
          });
          deck.push({
            value: 10,
            suit,
            type: "standard",
            name: `King of ${suit}`,
          });
          deck.push({
            value: 1,
            suit,
            type: "standard",
            name: `Ace of ${suit}`,
          });
        }
        break;
        
      case 3: // Special "Dog" AI with unusual deck (as mentioned in GAMEPLAY.md)
        // Lots of 2s
        for (const suit of suits) {
          for (let i = 0; i < 8; i++) {
            deck.push({
              value: 2,
              suit,
              type: "standard",
              name: `2 of ${suit}`,
            });
          }
        }
        
        // "21-value cards" - cards that help reach 21 easily
        for (const suit of suits) {
          // Add cards that sum to 21 easily
          // 10 + 9 + 2 = 21
          
          // Tens and face cards
          for (let i = 0; i < 6; i++) {
            deck.push({
              value: 10,
              suit,
              type: "standard",
              name: `10 of ${suit}`,
            });
          }
          
          // 9s to pair with 10s and 2s
          for (let i = 0; i < 4; i++) {
            deck.push({
              value: 9,
              suit,
              type: "standard",
              name: `9 of ${suit}`,
            });
          }
          
          // Add aces for blackjack opportunities
          for (let i = 0; i < 2; i++) {
            deck.push({
              value: 1,
              suit,
              type: "standard",
              name: `Ace of ${suit}`,
            });
          }
        }
        break;
    }
    
    // Shuffle the deck
    return shuffleDeck(deck);
  }
  
  // Calculate the total value of a hand, accounting for Aces
  const calculateHandTotal = (hand: Card[]) => {
    console.log("DEBUG: Calculating hand total for:", hand);
    if (hand.length === 0) {
      console.log("DEBUG: Empty hand, returning 0");
      return 0;
    }
    
    let total = 0;
    let aces = 0;
    
    // First pass: count non-Ace cards and track Aces
    for (const card of hand) {
      console.log("DEBUG: Processing card:", card.name, "value:", card.value);
      if (card.name.includes("Ace")) {
        aces++;
      } else {
        total += card.value;
      }
    }
    
    console.log("DEBUG: Before Aces - total:", total, "aces:", aces);
    
    // Second pass: add Aces optimally
    for (let i = 0; i < aces; i++) {
      // Add as 11 if it won't bust, otherwise add as 1
      if (total + 11 <= 21) {
        total += 11;
      } else {
        total += 1;
      }
    }
    
    console.log("DEBUG: Final total:", total);
    return total;
  };
  
  // Update totals whenever hands change
  useEffect(() => {
    console.log("DEBUG: Hand changed useEffect triggered");
    console.log("DEBUG: Player hand:", playerHand);
    console.log("DEBUG: AI hand:", aiHand);
    
    setPlayerTotal(calculateHandTotal(playerHand));
    
    // Only update AI total if AI has cards
    if (aiHand.length > 0) {
      const newAiTotal = calculateHandTotal(aiHand);
      console.log("DEBUG: Setting new AI total:", newAiTotal);
      setAiTotal(newAiTotal);
    }
    
    // Update hasPlayedCards flag
    if (playerHand.length > 0 || aiHand.length > 0) {
      setHasPlayedCards(true);
    }
  }, [playerHand, aiHand]);
  
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
  const drawAiCard = () => {
    // If deck is empty, shuffle discard pile back into deck
    if (aiDeck.length === 0) {
      if (aiDiscardPile.length === 0) {
        // Both deck and discard are empty, create a new deck
        setAiDeck(createAIDeck(encounterCount));
        return drawAiCard();
      } else {
        // Shuffle discard pile into deck
        setAiDeck(shuffleDeck([...aiDiscardPile]));
        setAiDiscardPile([]);
        return drawAiCard();
      }
    }
    
    // Draw from deck
    const card = aiDeck[0];
    setAiDeck(prevDeck => prevDeck.slice(1));
    return card;
  };
  
  // Function to add message to the action log
  const logAction = (message: string) => {
    console.log(message); // Also log to console for debugging
    setActionLog(prev => [...prev, message]);
  };
  
  // Start a new round
  const startRound = () => {
    console.log("DEBUG: Starting new round");
    
    if (!playerDeck || playerDeck.length < 2) {
      console.log("DEBUG: Not enough cards in deck to start round");
      checkForGameOver();
      return;
    }
    
    // Reset any existing state
    setPlayerTotal(0);
    setAiTotal(0);
    setPlayerHand([]);
    setAiHand([]);
    setPlayerBonusDamage(0);
    setPlayerStood(false);
    setAiStood(false);
    
    // Start with no cards
    setRoundActive(true);
    
    // Set phase to player turn
    setRoundPhase('playerTurn');
    currentPhaseRef.current = 'playerTurn';
    
    logAction("Round started! Your turn.");
  };

  // Resolve the round and calculate damage
  const resolveRound = () => {
    console.log("DEBUG: Resolving round");
    console.log(`DEBUG: Player stood: ${playerStood}, AI stood: ${aiStood}`);
    console.log(`DEBUG: Player total: ${playerTotal}, AI total: ${aiTotal}`);
    
    // Make sure we're in the resolution phase
    if (currentPhaseRef.current !== 'resolution') {
      console.log("DEBUG: Called resolveRound but not in resolution phase:", currentPhaseRef.current);
      setRoundPhase('resolution');
      currentPhaseRef.current = 'resolution';
    }
    
    // Don't resolve if no cards have been played by either side
    if (!hasPlayedCards) {
      console.log("DEBUG: No cards played, skipping resolution");
      resetRound();
      return;
    }
    
    // Calculate final results
    console.log(`DEBUG: Final scores - Player: ${playerTotal}, AI: ${aiTotal}`);
    console.log(`DEBUG: Bust status - Player: ${playerTotal > 21}, AI: ${aiTotal > 21}`);
    
    let outcome = '';
    let playerDamage = 0;
    let enemyDamage = 0;
    
    // Determine outcome based on blackjack rules
    if (playerTotal > 21 && aiTotal > 21) {
      // Both bust, no damage - it's a tie
      outcome = "Both busted! It's a tie - no damage dealt.";
    } else if (playerTotal > 21) {
      // Player busts, AI wins
      enemyDamage = aiTotal;
      outcome = `You busted! Enemy deals ${enemyDamage} damage.`;
    } else if (aiTotal > 21) {
      // AI busts, player wins
      playerDamage = playerTotal + playerBonusDamage;
      outcome = `Enemy busted! You deal ${playerDamage} damage.`;
    } else {
      // Compare totals if nobody busted
      if (playerTotal > aiTotal) {
        playerDamage = playerTotal - aiTotal + playerBonusDamage;
        outcome = `You win! You deal ${playerDamage} damage.`;
      } else if (aiTotal > playerTotal) {
        enemyDamage = aiTotal - playerTotal;
        outcome = `Enemy wins! Enemy deals ${enemyDamage} damage.`;
      } else {
        // Equal scores - it's a tie
        outcome = "It's a tie! No damage dealt.";
      }
    }
    
    // Apply damage
    if (playerDamage > 0) {
      applyDamageToAI(playerDamage);
    }
    
    if (enemyDamage > 0) {
      applyDamageToPlayer(enemyDamage);
    }
    
    // Check for special card effects when getting 21
    if (playerTotal === 21 && playerHand.length > 0) {
      const lastCard = playerHand[playerHand.length - 1];
      
      switch (lastCard.suit) {
        case "hearts":
          // Hearts: Heal 5 HP
          healPlayer(5);
          logAction("♥ Bonus: You healed 5 HP.");
          break;
        case "diamonds":
          // Diamonds: Gain 5 chips
          earnChips(5);
          logAction("♦ Bonus: You gained 5 chips.");
          break;
        case "clubs":
          // Clubs: +5 damage next round
          setPlayerBonusDamage(5);
          logAction("♣ Bonus: +5 damage on your next round.");
          break;
        case "spades":
          // Spades: Gain a 5 HP shield
          setPlayerShield(prev => prev + 5);
          logAction("♠ Bonus: You gained a 5 HP shield.");
          break;
      }
    }
    
    // Update game log
    logAction(outcome);
    setRoundMessage(outcome);
    
    // Set round as inactive
    setRoundActive(false);
    
    // Check if the game has ended due to HP
    setTimeout(() => {
      checkForGameOver();
    }, 500);
  };

  // Player actions
  const hitPlayer = () => {
    // Ensure it's the player's turn and the player hasn't stood yet
    if (currentPhaseRef.current !== 'playerTurn' || playerStood) {
      console.log("DEBUG: Hit attempted when not player's turn or already stood");
      return;
    }
    
    const card = drawPlayerCard();
    const newHand = [...playerHand, card];
    setPlayerHand(newHand);
    
    // Mark that cards have been played this round
    setHasPlayedCards(true);
    
    // Calculate new total
    const newTotal = calculateHandTotal(newHand);
    logAction(`You placed ${card.name} on your desk. Your total is now ${newTotal}.`);
    setPlayerTotal(newTotal);
    
    // Check if player busts
    if (newTotal > 21) {
      console.log("DEBUG: Player busted with:", newTotal);
      logAction("You busted!");
      setPlayerStood(true);
      playerStoodRef.current = true;
      
      // Switch to AI turn
      setRoundPhase('aiTurn');
      currentPhaseRef.current = 'aiTurn';
      
      // Start AI turn after a delay to show the player bust
      setTimeout(() => {
        aiStartTurn();
      }, 1000);
      return;
    }
    
    // If player didn't bust, still switch to AI turn
    setRoundPhase('aiTurn');
    currentPhaseRef.current = 'aiTurn';
    
    // Start AI turn after a delay
    setTimeout(() => {
      console.log(`DEBUG: Starting AI turn after player hit, phase: ${currentPhaseRef.current}`);
      aiStartTurn();
    }, 750);
  };
  
  const standPlayer = () => {
    console.log("DEBUG: standPlayer called, current phase:", currentPhaseRef.current);
    
    // Ensure it's the player's turn and the player hasn't stood yet
    if (currentPhaseRef.current !== 'playerTurn' || playerStood) {
      console.log("DEBUG: Stand attempted when not player's turn or already stood");
      return;
    }
    
    // Mark player as stood
    logAction(`You stand with ${playerTotal}.`);
    setPlayerStood(true);
    playerStoodRef.current = true;
    
    // If AI has already stood, move to resolution phase
    if (aiStood) {
      setRoundPhase('resolution');
      currentPhaseRef.current = 'resolution';
      
      setTimeout(() => {
        resolveRound();
      }, 1000);
      return;
    }
    
    // Otherwise switch to AI turn
    setRoundPhase('aiTurn');
    currentPhaseRef.current = 'aiTurn';
    
    // Start AI turn after a delay
    setTimeout(() => {
      console.log(`DEBUG: Starting AI turn after player stands, phase: ${currentPhaseRef.current}`);
      aiStartTurn();
    }, 750);
  };
  
  // AI turn handling
  const aiStartTurn = () => {
    console.log("DEBUG: aiStartTurn called, currentPhase:", currentPhaseRef.current, "roundActive:", roundActive, "AI hand size:", aiHand.length);
    
    // Ensure this only runs during AI turn
    if (currentPhaseRef.current !== 'aiTurn') {
      console.log("DEBUG: Not AI turn, phase is:", currentPhaseRef.current);
      return;
    }
    
    // Verify AI hand and total consistency
    const actualHandTotal = aiHand.length > 0 ? calculateHandTotal(aiHand) : 0;
    if (actualHandTotal !== aiTotal) {
      console.log(`DEBUG: AI total mismatch in aiStartTurn! Stored: ${aiTotal}, Calculated: ${actualHandTotal}`);
      setAiTotal(actualHandTotal);
    }
    
    logAction("AI's turn begins.");
    
    // If AI already busted or has 21+, it's done
    if (aiTotal >= 21) {
      console.log("DEBUG: AI already at or over 21, finishing turn");
      setAiStood(true);
      
      // End round if player has stood
      if (playerStoodRef.current) {
        setRoundPhase('resolution');
        currentPhaseRef.current = 'resolution';
        
        setTimeout(() => {
          resolveRound();
        }, 1000);
      } else {
        // Otherwise, go back to player's turn
        setRoundPhase('playerTurn');
        currentPhaseRef.current = 'playerTurn';
        
        logAction("Your turn!");
      }
      return;
    }
    
    // Call AI turn with a small delay
    console.log("DEBUG: Calling AI turn with a small delay");
    setTimeout(() => {
      aiTakeTurn();
    }, 750);
  };
  
  const aiTakeTurn = () => {
    console.log("DEBUG: AI taking turn, phase:", currentPhaseRef.current);
    
    // Ensure this only runs during AI turn
    if (currentPhaseRef.current !== 'aiTurn') {
      console.log("DEBUG: Not AI's turn, skipping aiTakeTurn");
      return;
    }
    
    // Check if AI busted or stood, in which case we end the turn
    if (aiTotal >= 21 || aiStood) {
      console.log("DEBUG: AI already busted or stood, ending turn");
      setAiStood(true);
      
      // Decide if we should go to resolution or back to player turn
      if (playerStoodRef.current || playerTotal > 21) {
        // Move to resolution if player stood or busted
        setRoundPhase('resolution');
        currentPhaseRef.current = 'resolution';
        setTimeout(() => {
          resolveRound();
        }, 1000);
      } else {
        // Otherwise, go back to player turn
        setRoundPhase('playerTurn');
        currentPhaseRef.current = 'playerTurn';
        logAction("AI stands. Your turn!");
      }
      return;
    }
    
    // Apply AI decision logic
    if (shouldAIHit()) {
      // AI decides to hit
      const card = drawAiCard();
      const newHand = [...aiHand, card];
      setAiHand(newHand);
      
      // Calculate new total
      const newTotal = calculateHandTotal(newHand);
      setAiTotal(newTotal);
      
      logAction(`AI places ${card.name} on their desk. AI total is now ${newTotal}.`);
      
      // Check for bust
      if (newTotal > 21) {
        logAction("AI busted!");
        setAiStood(true);
        
        // Log the current game state for debugging
        console.log("DEBUG: AI busted logic - playerStood state:", playerStood);
        console.log("DEBUG: AI busted logic - playerStoodRef:", playerStoodRef.current);
        console.log("DEBUG: AI busted logic - playerTotal:", playerTotal);
        
        // End round if player has stood or busted
        if (playerStoodRef.current || playerTotal > 21) {
          console.log("DEBUG: Moving to resolution phase after AI bust");
          setRoundPhase('resolution');
          currentPhaseRef.current = 'resolution';
          setTimeout(() => {
            resolveRound();
          }, 1000);
        } else {
          // Go back to player's turn
          console.log("DEBUG: Moving back to player turn after AI bust");
          setRoundPhase('playerTurn');
          currentPhaseRef.current = 'playerTurn';
          logAction("AI busted! Your turn!");
        }
      } else {
        // AI makes a decision whether to continue its turn or give it back to player
        // For more dynamic gameplay, only continue AI turn ~50% of the time when it's reasonable
        if (newTotal >= 17 || Math.random() > 0.5) {
          // Give turn back to player if player hasn't busted or stood
          if (playerTotal <= 21 && !playerStoodRef.current) {
            setRoundPhase('playerTurn');
            currentPhaseRef.current = 'playerTurn';
            logAction("Your turn!");
          } else {
            // Player has busted or stood, so AI is done
            setAiStood(true);
            setRoundPhase('resolution');
            currentPhaseRef.current = 'resolution';
            setTimeout(() => {
              resolveRound();
            }, 1000);
          }
        } else {
          // AI continues its turn by calling itself after a delay
          setTimeout(() => {
            aiTakeTurn();
          }, 1000);
        }
      }
    } else {
      // AI decides to stand
      logAction("AI stands.");
      setAiStood(true);
      
      // End round if player has stood or busted
      if (playerStoodRef.current || playerTotal > 21) {
        setRoundPhase('resolution');
        currentPhaseRef.current = 'resolution';
        setTimeout(() => {
          resolveRound();
        }, 1000);
      } else {
        // Go back to player's turn
        setRoundPhase('playerTurn');
        currentPhaseRef.current = 'playerTurn';
        logAction("AI stands. Your turn!");
      }
    }
  };
  
  const shouldAIHit = () => {
    // Calculate current hand total to ensure we're not using stale data
    const currentAiTotal = aiHand.length > 0 ? calculateHandTotal(aiHand) : 0;
    
    console.log(`DEBUG: shouldAIHit called with aiTotal: ${aiTotal}, actual hand total: ${currentAiTotal}, hand size: ${aiHand.length}`);
    
    // Determine AI strategy based on encounter count
    let thresholdToStand = 17; // Default threshold
    let riskTolerance = 0.5; // Default risk tolerance (0 to 1)
    
    // Encounter type is determined by modulo 4 of encounter count
    const encounterType = (encounterCount - 1) % 4;
    
    switch (encounterType) {
      case 0: // Novice Enemy (1st, 5th, etc.)
        // Conservative play: stands at 16 or higher, low risk tolerance
        thresholdToStand = 16;
        riskTolerance = 0.3;
        break;
      case 1: // Aggressive Enemy (2nd, 6th, etc.)
        // High-risk approach: stands at 18 or higher, high risk tolerance
        thresholdToStand = 18;
        riskTolerance = 0.7;
        break;
      case 2: // Defensive Enemy (3rd, 7th, etc.)
        // Very conservative: stands at 14 or higher, very low risk tolerance
        thresholdToStand = 14;
        riskTolerance = 0.2;
        break;
      case 3: // Special "Dog" Enemy (4th, 8th, etc.)
        // Unpredictable: varies between very aggressive and very conservative
        // For this, we'll use a random approach with some logic
        if (currentAiTotal >= 17) {
          // Higher chance to stand when already close to 21
          thresholdToStand = Math.random() < 0.7 ? 17 : 19;
        } else {
          // More unpredictable when lower
          thresholdToStand = Math.random() < 0.5 ? 15 : 18;
        }
        riskTolerance = Math.random(); // Completely random risk tolerance
        break;
    }
    
    // Consider the player's shown cards when making decisions
    // If player is getting close to 21, AI might take more risks
    if (playerTotal > 17 && playerTotal <= 21) {
      // Player is strong, adjust risk based on AI type
      const adjustedThreshold = Math.max(thresholdToStand - 1, 12);
      thresholdToStand = riskTolerance > 0.5 ? adjustedThreshold : thresholdToStand;
    }
    
    // Make the hit/stand decision based on the calculated threshold
    const shouldHit = currentAiTotal < thresholdToStand;
    console.log(`DEBUG: AI (Encounter ${encounterCount}, Type ${encounterType}) decision:`, 
                shouldHit ? "hit" : "stand", 
                `(Total: ${currentAiTotal}, Threshold: ${thresholdToStand})`);
    return shouldHit;
  };
  
  // Reset the round for a new game
  const resetRound = () => {
    console.log("DEBUG: Reset round called");
    
    // Reset state
    setPlayerHand([]);
    setAiHand([]);
    setPlayerTotal(0);
    setAiTotal(0);
    setPlayerStood(false);
    playerStoodRef.current = false;
    setAiStood(false);
    setPlayerBonusDamage(0);
    setRoundActive(false);
    setHasPlayedCards(false);
    setActionLog([]);
    setRoundMessage(null);
    
    // Reset phase
    setRoundPhase('idle');
    currentPhaseRef.current = 'idle';
    
    // Start new round after a short delay
    setTimeout(() => {
      console.log("DEBUG: Starting new round after delay");
      startRound();
    }, 500);
  };
  
  // Start a new encounter (after defeating an opponent)
  const startNewEncounter = () => {
    // Increment encounter counter
    setEncounterCount(prev => prev + 1);
    
    // Create a new AI with slightly higher HP
    setAiHP(INITIAL_HP + (encounterCount * 10));
    setAiMaxHP(INITIAL_HP + (encounterCount * 10));
    
    // Reset the AI's deck
    setAiDeck(createAIDeck(encounterCount));
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
    setAiDeck(createAIDeck(encounterCount));
    setAiDiscardPile([]);
    
    setAiTurnInProgress(false);
    setPlayerStood(false);
    setEncounterCount(1);
    
    setRoundActive(true);
    setGameOver(false);
  };

  // Apply damage to the player, accounting for shield
  const applyDamageToPlayer = (damage: number) => {
    // Use shield to absorb damage if available
    if (playerShield > 0) {
      const absorbedDamage = Math.min(playerShield, damage);
      const remainingDamage = damage - absorbedDamage;
      
      // Log shield absorption
      logAction(`Shield absorbed ${absorbedDamage} damage.`);
      
      // Update shield
      setPlayerShield(prev => prev - absorbedDamage);
      
      // Apply remaining damage if any
      if (remainingDamage > 0) {
        setPlayerHP(prev => Math.max(0, prev - remainingDamage));
        logAction(`You took ${remainingDamage} damage.`);
      }
    } else {
      // No shield, take full damage
      setPlayerHP(prev => Math.max(0, prev - damage));
      logAction(`You took ${damage} damage.`);
    }
  };
  
  // Apply damage to the AI
  const applyDamageToAI = (damage: number) => {
    setAiHP(prev => Math.max(0, prev - damage));
    logAction(`AI took ${damage} damage.`);
  };
  
  // Check if the game is over (player or AI HP at 0)
  const checkForGameOver = () => {
    // Check if player is defeated
    if (playerHP <= 0) {
      logAction("Game Over! You have been defeated.");
      setGameOver(true);
      return true;
    }
    
    // Check if AI is defeated
    if (aiHP <= 0) {
      logAction("Victory! You have defeated the opponent.");
      
      // Award bonus chips for winning the encounter
      earnChips(20);
      
      // If this was the final encounter, player wins the game
      if (encounterCount >= MAX_ENCOUNTERS) { 
        logAction("Congratulations! You've completed all encounters!");
        setGameOver(true);
      } else {
        // Otherwise prepare for the next encounter
        setEncounterCount(prev => prev + 1);
        setTimeout(() => {
          startNewEncounter();
        }, 2000);
      }
      return true;
    }
    
    // If the game is not over, reset for the next round
    setTimeout(() => {
      resetRound();
    }, 1500);
    
    return false;
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
    playerStood,
    
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
    roundPhase,
    actionLog,
    roundMessage,
    currentPhaseRef,
    playerStoodRef,
    
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
    startRound,
    logAction,
    applyDamageToPlayer,
    applyDamageToAI,
    checkForGameOver,
  };
  
  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};
