import { useState, useEffect } from "react";
import { useGame } from "@/context/GameContext";
import PlayerDesk from "./PlayerDesk";
import AIDesk from "./AIDesk";
import HealthBar from "./HealthBar";
import GameControls from "./GameControls";
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

  return (
    <div className="flex flex-col w-full h-full max-w-md mx-auto bg-green-900/80 rounded-xl shadow-lg p-4 relative min-h-[700px]">
      {/* Top Section - AI Area */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <h2 className="text-sm font-pixel text-white">Opponent</h2>
          <div className="flex items-center">
            <span className="text-xs font-pixel text-white mr-2">Encounter: {encounterCount}</span>
          </div>
        </div>
        
        <HealthBar 
          current={aiHP} 
          max={aiMaxHP}
          barColor="bg-red-500"
          textColor="text-red-300"
        />
        
        <div className="my-4">
          <AIDesk 
            hand={aiHand} 
            total={aiTotal} 
            isStood={aiStood}
            revealCards={true} // Always show AI cards face up
          />
        </div>
        
        <div className="flex justify-center space-x-4 mt-1">
          <DeckPile deck={aiDeck} label="Deck" isAI />
          <DeckPile deck={aiDiscardPile} label="Discard" isAI />
        </div>
      </div>
      
      {/* Middle Divider - Table Dealer Position */}
      <div className="border-t-2 border-yellow-500/50 my-4 relative">
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-800 px-3 py-1 rounded-full">
          <span className="text-xs font-pixel text-yellow-400">Dealer</span>
        </div>
      </div>
      
      {/* Bottom Section - Player Area */}
      <div className="mt-auto flex-grow">
        {/* Player Status */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <h2 className="text-sm font-pixel text-white">You</h2>
            <div className="flex items-center space-x-3">
              <div className="flex items-center">
                <span className="text-yellow-400 font-pixel text-xs">🪙 {playerChips}</span>
              </div>
              <StatusEffects 
                shield={playerShield} 
                bonusDamage={playerBonusDamage} 
              />
            </div>
          </div>
          <HealthBar 
            current={playerHP} 
            max={playerMaxHP}
            barColor="bg-green-500"
            textColor="text-green-300"
          />
        </div>
        
        {/* Player Deck Piles */}
        <div className="flex justify-center space-x-4 mb-4">
          <DeckPile deck={playerDeck} label="Deck" />
          <DeckPile deck={playerDiscardPile} label="Discard" />
        </div>
        
        {/* Player Cards */}
        <div className="mb-6">
          <PlayerDesk 
            hand={playerHand} 
            total={playerTotal}
            isStood={playerStood}
          />
        </div>
        
        {/* Round Start Message */}
        {roundActive && (
          <div className="mb-3 text-center">
            <p className="text-sm font-pixel text-yellow-300">
              Draw cards to get as close to 21 as possible without going over!
            </p>
          </div>
        )}
        
        {/* Controls */}
        <div className="mt-auto">
          <GameControls
            onHit={hitPlayer}
            onStand={standPlayer}
            disabled={!roundActive || gameOver || currentPhaseRef.current !== 'playerTurn' || playerStood}
          />
        </div>
      </div>
    </div>
  );
};

export default GameScreen;
