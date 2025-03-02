import { useState, useEffect } from "react";
import { useGame } from "@/context/GameContext";
import PlayerDesk from "./PlayerDesk";
import AIDesk from "./AIDesk";
import HealthBar from "./HealthBar";
import StatusEffects from "./StatusEffects";
import DeckPile from "./DeckPile";
import { useToast } from "@/hooks/use-toast";

interface GameScreenProps {
  onRoundEnd: () => void;
  onGameOver: (result: "win" | "lose") => void;
}

const GameScreen = ({ onRoundEnd, onGameOver }: GameScreenProps) => {
  const {
    playerHP,
    playerMaxHP,
    playerTotal,
    playerHand,
    playerShield,
    playerBonusDamage,
    playerChips,
    playerDeck,
    playerDiscardPile,
    
    aiHP,
    aiMaxHP,
    aiHand,
    aiTotal,
    aiStood,
    aiDeck,
    aiDiscardPile,
    
    roundActive,
    gameOver,
    encounterCount,
    
    hitPlayer,
    standPlayer,
    resetRound,
    startNewEncounter,
    startRound,
    currentPhaseRef,
    playerStood
  } = useGame();
  
  const [roundResult, setRoundResult] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();
  
  // The following effects handle the game flow
  
  // Start the round when needed
  useEffect(() => {
    if (!roundActive && !gameOver) {
      startRound();
      console.log("DEBUG: Starting new round automatically");
    }
  }, [roundActive, gameOver, startRound]);
  
  // Check for game over
  useEffect(() => {
    if (playerHP <= 0) {
      onGameOver("lose");
    } else if (aiHP <= 0) {
      onGameOver("win");
    }
  }, [playerHP, aiHP, onGameOver]);
  
  // Handle round results calculation and display
  useEffect(() => {
    // Only calculate results if we're in the resolution phase
    if (currentPhaseRef.current === 'resolution' && roundActive && !gameOver) {
      let resultMessage = "";
      
      // Both busted - it's a tie
      if (playerTotal > 21 && aiTotal > 21) {
        resultMessage = `Both busted with Player: ${playerTotal} vs AI: ${aiTotal}! It's a tie - no damage dealt.`;
      }
      // Player bust only
      else if (playerTotal > 21) {
        resultMessage = `You busted with ${playerTotal}! AI deals ${aiTotal} damage.`;
      } 
      // AI bust only 
      else if (aiTotal > 21) {
        let damage = playerTotal;
        
        if (playerBonusDamage > 0) {
          damage += playerBonusDamage;
        }
        
        resultMessage = `AI busted with ${aiTotal}! You deal ${damage} damage`;
        
        if (playerBonusDamage > 0) {
          resultMessage += ` (including ${playerBonusDamage} bonus damage)`;
        }
      } 
      // Both players stood, compare values
      else if (playerStood && aiStood) {
        // It's a tie
        if (playerTotal === aiTotal) {
          resultMessage = `It's a tie at ${playerTotal}! No damage dealt.`;
        }
        // Player wins
        else if (playerTotal > aiTotal) {
          let damage = playerTotal - aiTotal;
          
          if (playerBonusDamage > 0) {
            damage += playerBonusDamage;
          }
          
          resultMessage = `You win with ${playerTotal} vs AI's ${aiTotal}! Deal ${damage} damage`;
          
          if (playerBonusDamage > 0) {
            resultMessage += ` (+${playerBonusDamage} bonus damage)`;
          }
        } 
        // AI wins
        else {
          const damage = aiTotal - playerTotal;
          resultMessage = `AI wins with ${aiTotal} vs your ${playerTotal}! You take ${damage} damage.`;
        }
        
        // Add bonus effect info if player hit 21
        if (playerTotal === 21 && playerHand.length > 0) {
          const lastCard = playerHand[playerHand.length - 1];
          
          switch (lastCard.suit) {
            case "hearts":
              resultMessage += " ♥ Bonus: Heal 5 HP.";
              break;
            case "diamonds":
              resultMessage += " ♦ Bonus: Gain 5 chips.";
              break;
            case "clubs":
              resultMessage += " ♣ Bonus: +5 damage next round.";
              break;
            case "spades":
              resultMessage += " ♠ Bonus: Gain a 5 HP shield.";
              break;
          }
        }
        
        setRoundResult(resultMessage);
        
        // Show toast with round result
        toast({
          variant: "info",
          title: "Round Over",
          description: resultMessage,
        });
        
        // Proceed to next round after delay
        const timer = setTimeout(() => {
          setShowResults(false);
          onRoundEnd();
          resetRound();
        }, 3000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [roundActive, gameOver, playerTotal, aiTotal, playerHand, playerBonusDamage, aiHP, onRoundEnd, resetRound, toast, playerStood, aiStood, currentPhaseRef]);

  // Add a new effect to control the round start message visibility
  const [showStartMessage, setShowStartMessage] = useState(true);

  useEffect(() => {
    if (roundActive) {
      setShowStartMessage(true);
      // Hide the start message after a delay
      const timer = setTimeout(() => {
        setShowStartMessage(false);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [roundActive]);

  const controlsDisabled = !roundActive || gameOver || currentPhaseRef.current !== 'playerTurn' || playerStood;

  return (
    <div className="flex flex-col items-center w-full max-w-md sm:max-w-lg md:max-w-xl mx-auto">
      {/* Main Game Board */}
      <div className="flex flex-col h-[80vh] max-h-[550px] w-full bg-green-900 bg-opacity-60 rounded-xl overflow-hidden shadow-2xl border border-green-700 relative backdrop-blur-sm">
        {/* Dealer label */}
        <div className="absolute top-2 left-2 bg-green-700 text-white px-2 py-1 rounded-md text-sm font-pixel border border-green-600 shadow-md z-10">
          DEALER
        </div>
        
        {/* AI Area */}
        <div className="w-full px-3 pt-6 pb-2 sm:px-4 sm:pt-8 sm:pb-3 bg-green-950 bg-opacity-40">
          {/* AI Status */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <span className="ml-6 sm:ml-8 mr-2 text-white font-pixel text-sm sm:text-base">
                AI
              </span>
              <StatusEffects shield={0} bonusDamage={0} />
            </div>
            <HealthBar 
              current={aiHP} 
              max={aiMaxHP} 
              barColor="bg-red-600"
              textColor="text-red-100"
            />
          </div>
          
          {/* AI Deck Piles */}
          <div className="flex space-x-3 mb-2 ml-1">
            <DeckPile deck={aiDeck} label="DECK" isAI />
            <DeckPile deck={aiDiscardPile} label="DISC" isAI />
          </div>
          
          {/* AI Desk */}
          <AIDesk 
            hand={aiHand} 
            total={aiTotal} 
            isStood={aiStood} 
            revealCards={true} 
          />
        </div>
        
        {/* Center Area - Round Result */}
        <div className="flex-grow flex items-center justify-center relative backdrop-blur-0">
          {showStartMessage && roundActive && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 z-10 backdrop-blur-sm">
              <div className="bg-green-800 px-4 py-2 rounded-lg border-2 border-yellow-500 text-white font-pixel text-center animate-pulse shadow-xl">
                <p className="text-sm sm:text-base">Round {encounterCount}</p>
                <p className="text-xs sm:text-sm mt-1">Draw your cards!</p>
              </div>
            </div>
          )}
          
          {roundResult && (
            <div className="bg-green-800 px-3 py-2 rounded-lg border-2 border-yellow-500 text-white font-pixel text-center shadow-lg">
              <p className="text-xs sm:text-sm">{roundResult}</p>
            </div>
          )}
        </div>
        
        {/* Player Area */}
        <div className="w-full px-3 pb-3 pt-2 sm:px-4 sm:pb-4 sm:pt-3 bg-green-950 bg-opacity-40">
          {/* Player Desk */}
          <PlayerDesk 
            hand={playerHand} 
            total={playerTotal} 
            isStood={playerStood}
          />
          
          {/* Player Deck Piles */}
          <div className="flex space-x-3 my-2 ml-1">
            <DeckPile deck={playerDeck} label="DECK" />
            <DeckPile deck={playerDiscardPile} label="DISC" />
          </div>
          
          {/* Player Status */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center">
              <span className="ml-1 mr-2 text-white font-pixel text-sm sm:text-base">
                YOU {playerChips > 0 ? `$${playerChips}` : ''}
              </span>
              <StatusEffects shield={playerShield} bonusDamage={playerBonusDamage} />
            </div>
            <HealthBar 
              current={playerHP} 
              max={playerMaxHP} 
              barColor="bg-blue-600"
              textColor="text-blue-100"
            />
          </div>
        </div>
      </div>

      {/* Game Controls as Separate Buttons */}
      <div className="flex justify-between mt-2 gap-4 w-full">
        <button
          onClick={hitPlayer}
          disabled={controlsDisabled}
          className={`
            flex-1 py-8 rounded-lg font-pixel text-2xl shadow-lg border-2
            ${controlsDisabled
              ? 'bg-gray-700 text-gray-400 border-gray-600 cursor-not-allowed' 
              : 'bg-green-600 text-white border-green-500 active:transform active:scale-95'
            }
          `}
          aria-label="Hit - Draw another card"
        >
          HIT
        </button>
        
        <button
          onClick={standPlayer}
          disabled={controlsDisabled}
          className={`
            flex-1 py-8 rounded-lg font-pixel text-2xl shadow-lg border-2
            ${controlsDisabled
              ? 'bg-gray-700 text-gray-400 border-gray-600 cursor-not-allowed' 
              : 'bg-red-600 text-white border-red-500 active:transform active:scale-95'
            }
          `}
          aria-label="Stand - End your turn"
        >
          STAND
        </button>
      </div>
    </div>
  );
};

export default GameScreen;
