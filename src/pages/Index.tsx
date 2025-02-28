
import { useState, useEffect } from "react";
import GameScreen from "@/components/GameScreen";
import ShopScreen from "@/components/ShopScreen";
import TitleScreen from "@/components/TitleScreen";
import GameOverScreen from "@/components/GameOverScreen";
import { GameProvider, useGame } from "@/context/GameContext";
import { useToast } from "@/hooks/use-toast";

type GameState = "title" | "game" | "shop" | "gameOver";

const GameStateManager = ({ 
  onGameOver 
}: { 
  onGameOver: (result: "win" | "lose") => void 
}) => {
  const { aiHP, playerHP, startNewEncounter } = useGame();
  const { toast } = useToast();
  
  // Check for encounter completion
  useEffect(() => {
    if (aiHP <= 0) {
      toast({
        title: "Encounter Complete!",
        description: "You've defeated your opponent! Visit the shop to prepare for the next encounter.",
      });
    }
  }, [aiHP, toast]);
  
  // Check for game over
  useEffect(() => {
    if (playerHP <= 0) {
      onGameOver("lose");
    }
  }, [playerHP, onGameOver]);
  
  return null;
};

const Index = () => {
  const [gameState, setGameState] = useState<GameState>("title");
  const [result, setResult] = useState<"win" | "lose" | null>(null);
  const { toast } = useToast();

  // Handle transitions between game states
  const startGame = () => {
    setGameState("game");
    toast({
      title: "Game Started",
      description: "Defeat your opponent by reducing their HP to zero!",
    });
  };

  const goToShop = () => {
    setGameState("shop");
    toast({
      title: "Shop Time",
      description: "Spend your chips to improve your deck!",
    });
  };

  const continueGame = () => {
    setGameState("game");
  };

  const endGame = (result: "win" | "lose") => {
    setResult(result);
    setGameState("gameOver");
    
    toast({
      title: result === "win" ? "Victory!" : "Defeat!",
      description: result === "win" 
        ? "You've defeated all your opponents!" 
        : "Your HP has reached zero!",
      variant: result === "win" ? "default" : "destructive",
    });
  };

  const returnToTitle = () => {
    setGameState("title");
    setResult(null);
  };

  // Render the appropriate screen based on game state
  return (
    <GameProvider>
      <div className="bg-dark-bg min-h-screen flex flex-col items-center justify-start px-4 py-6 overflow-hidden">
        {gameState === "title" && <TitleScreen onStart={startGame} />}
        
        {gameState === "game" && (
          <>
            <GameStateManager onGameOver={endGame} />
            <GameScreen 
              onRoundEnd={goToShop}
              onGameOver={endGame}
            />
          </>
        )}
        
        {gameState === "shop" && (
          <ShopScreen onContinue={continueGame} />
        )}
        
        {gameState === "gameOver" && (
          <GameOverScreen 
            result={result} 
            onReturnToTitle={returnToTitle}
          />
        )}
      </div>
    </GameProvider>
  );
};

export default Index;
