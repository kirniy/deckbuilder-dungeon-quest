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

  // Add console logging to debug HP rendering
  useEffect(() => {
    console.log("DEBUG - HP values:", { 
      playerHP, 
      playerMaxHP, 
      aiHP, 
      aiMaxHP 
    });
  }, [playerHP, playerMaxHP, aiHP, aiMaxHP]);

  return (
    <div className="flex flex-col items-center w-full max-w-md sm:max-w-lg md:max-w-xl mx-auto">
      {/* Main Game Board */}
      <div className="flex flex-col h-[80vh] max-h-[500px] w-full bg-green-900 bg-opacity-60 rounded-xl overflow-hidden shadow-2xl border border-green-700 relative backdrop-blur-sm">
        {/* Dealer label */}
        <div className="absolute top-2 left-2 bg-green-700 text-white px-2 py-1 rounded-md text-sm font-pixel border border-green-600 shadow-md z-10">
          DEALER
        </div>

        {/* Container for AI and Player Areas */}
        <div className="flex flex-col justify-between h-[420px]">
          {/* AI Area */}
          <div className="w-full px-3 pt-6 pb-2 sm:px-4 sm:pt-8 sm:pb-3 bg-green-950 bg-opacity-40">
            {/* AI Status and HP */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <span className="ml-6 sm:ml-8 mr-2 text-white font-pixel text-sm sm:text-base">
                  AI
                </span>
                <StatusEffects shield={0} bonusDamage={0} />
              </div>
              {/* AI HP Bar - Fixed position */}
              <div className="w-1/2 max-w-44">
                <HealthBar
                  current={aiHP}
                  max={aiMaxHP}
                  barColor="bg-red-600"
                  textColor="text-red-100"
                />
              </div>
            </div>

            {/* AI Deck Piles */}
            <div className="flex space-x-3 mb-2 ml-1">
              <DeckPile deck={aiDeck} label="DECK" isAI />
              <DeckPile deck={aiDiscardPile} label="DISC" isAI />
            </div>

            {/* Total */}
            <div className="flex items-center justify-center space-x-2 bg-green-800 px-4 py-1.5 rounded-full border border-green-700 shadow-md">
              <span className="font-pixel text-base text-white">
                Total: {aiTotal}
              </span>
              {aiStood && aiTotal > 0 && (
                <span className="bg-yellow-600 text-white px-2 py-0.5 rounded text-xs font-pixel font-bold w-[44px] text-center">
                  STAND
                </span>
              )}
              {!aiStood && (
                  <span className="text-white px-2 py-0.5 rounded text-xs font-pixel font-bold w-[44px] text-center">
                    &nbsp;
                  </span>
              )}
            </div>

            {/* AI Desk */}
            <AIDesk
              hand={aiHand}
              total={aiTotal}
              isStood={aiStood}
              revealCards={true}
            />
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
            {/* Player HP Bar - New position */}
              <div className="w-1/2 max-w-44">
                <HealthBar
                  current={playerHP}
                  max={playerMaxHP}
                  barColor="bg-blue-600"
                  textColor="text-blue-100"
                />
              </div>
            </div>

            {/* Player Status and HP */}
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center">
                <span className="ml-1 mr-2 text-white font-pixel text-sm sm:text-base">
                  YOU {playerChips > 0 ? `$${playerChips}` : ''}
                </span>
                <StatusEffects shield={playerShield} bonusDamage={playerBonusDamage} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Game Controls as Separate Buttons */}
      <div className="flex justify-between mt-2 gap-4 w-full">
        <button
          onClick={hitPlayer}
          disabled={controlsDisabled}
          className={`
            flex-1 py-6 rounded-lg font-pixel text-2xl shadow-lg relative
            ${controlsDisabled
              ? 'bg-gray-700 text-gray-400 border-b-4 border-gray-900 cursor-not-allowed opacity-70' 
              : 'bg-green-600 text-white border-b-8 border-green-900 hover:brightness-110 active:border-b-4 active:translate-y-1 transition-all duration-100'
            }
            before:absolute before:inset-0 before:rounded-lg before:bg-white before:opacity-10 before:top-0 before:left-0 before:w-full before:h-1/2
          `}
          aria-label="Hit - Draw another card"
        >
          <span className="drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">HIT</span>
        </button>
        
        <button
          onClick={standPlayer}
          disabled={controlsDisabled}
          className={`
            flex-1 py-6 rounded-lg font-pixel text-2xl shadow-lg relative
            ${controlsDisabled
              ? 'bg-gray-700 text-gray-400 border-b-4 border-gray-900 cursor-not-allowed opacity-70' 
              : 'bg-red-600 text-white border-b-8 border-red-900 hover:brightness-110 active:border-b-4 active:translate-y-1 transition-all duration-100'
            }
            before:absolute before:inset-0 before:rounded-lg before:bg-white before:opacity-10 before:top-0 before:left-0 before:w-full before:h-1/2
          `}
          aria-label="Stand - End your turn"
        >
          <span className="drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">STAND</span>
        </button>
      </div>
    </div>
  );
};

export default GameScreen;
