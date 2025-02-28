
import { useState, useEffect } from "react";
import { useGame } from "@/context/GameContext";
import PlayerHand from "./PlayerHand";
import AIHand from "./AIHand";
import HealthBar from "./HealthBar";
import GameControls from "./GameControls";
import StatusEffects from "./StatusEffects";
import { toast } from "@/hooks/use-toast";

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
    
    aiHP,
    aiMaxHP,
    aiHand,
    aiTotal,
    aiStood,
    
    roundActive,
    gameOver,
    
    hitPlayer,
    standPlayer,
    resetRound
  } = useGame();
  
  const [roundResult, setRoundResult] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  
  // Check for game over
  useEffect(() => {
    if (gameOver) {
      const result = playerHP <= 0 ? "lose" : "win";
      onGameOver(result);
    }
  }, [gameOver, playerHP, onGameOver]);
  
  // Handle round end
  useEffect(() => {
    if (!roundActive && !gameOver) {
      // Show round results
      setShowResults(true);
      
      // Determine round result message
      let resultMessage = "";
      
      if (playerTotal > 21 && aiTotal > 21) {
        resultMessage = "Both busted! No damage dealt.";
      } else if (playerTotal > 21) {
        resultMessage = `You busted! AI deals ${aiTotal} damage.`;
      } else if (aiTotal > 21) {
        resultMessage = `AI busted! You deal ${playerTotal} damage.`;
        
        if (playerBonusDamage > 0) {
          resultMessage += ` (+${playerBonusDamage} bonus damage)`;
        }
      } else if (playerTotal === aiTotal) {
        resultMessage = `Tie at ${playerTotal}! No damage dealt.`;
      } else if (playerTotal > aiTotal) {
        const damage = playerTotal - aiTotal;
        resultMessage = `You win with ${playerTotal}! Deal ${damage} damage`;
        
        if (playerBonusDamage > 0) {
          resultMessage += ` (+${playerBonusDamage} bonus damage)`;
        }
      } else {
        resultMessage = `AI wins with ${aiTotal}! You take ${aiTotal - playerTotal} damage.`;
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
      
      // Proceed to shop after a delay
      const timer = setTimeout(() => {
        setShowResults(false);
        onRoundEnd();
        
        // Reset for next round after shop
        resetRound();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [roundActive, gameOver, playerTotal, aiTotal, playerHand, playerBonusDamage, onRoundEnd, resetRound]);
  
  return (
    <div className="flex flex-col w-full h-full max-w-md mx-auto">
      {/* AI Section */}
      <div className="mb-6">
        <h2 className="text-lg font-pixel mb-2 text-white">Opponent</h2>
        <HealthBar 
          current={aiHP} 
          max={aiMaxHP}
          barColor="bg-red-500"
          textColor="text-red-300"
        />
        <AIHand 
          hand={aiHand} 
          total={aiTotal} 
          isStood={aiStood}
          revealCards={!roundActive || showResults}
        />
      </div>
      
      {/* Round Result Overlay */}
      {showResults && roundResult && (
        <div className="fixed inset-0 flex items-center justify-center z-20 bg-black bg-opacity-60">
          <div className="bg-dark-card p-6 rounded-lg border-2 border-card-border shadow-glow animate-scale-in">
            <h2 className="text-xl font-pixel mb-4 text-white">Round Result</h2>
            <p className="text-lg text-white font-pixel mb-4">{roundResult}</p>
            <p className="text-sm text-white opacity-70">Continuing in a moment...</p>
          </div>
        </div>
      )}
      
      {/* Player Status */}
      <div className="mt-auto mb-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-pixel text-white">You</h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <span className="text-yellow-400 font-pixel">🪙 {playerChips}</span>
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
      
      {/* Player Cards */}
      <div className="mb-6">
        <PlayerHand 
          hand={playerHand} 
          total={playerTotal} 
        />
      </div>
      
      {/* Controls */}
      <GameControls
        onHit={hitPlayer}
        onStand={standPlayer}
        disabled={!roundActive || gameOver}
      />
    </div>
  );
};

export default GameScreen;
