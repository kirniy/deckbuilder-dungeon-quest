
import { Card } from "@/lib/cards";

interface CardComponentProps {
  card: Card;
  faceDown?: boolean;
  small?: boolean;
  aiCard?: boolean;
}

const CardComponent = ({ card, faceDown = false, small = false, aiCard = false }: CardComponentProps) => {
  // Helper for card color based on suit
  const getSuitColor = (suit: string) => {
    switch (suit) {
      case "hearts":
      case "diamonds":
        return "text-red-500";
      case "clubs":
      case "spades":
      default:
        return "text-black";
    }
  };
  
  // Helper for suit symbol
  const getSuitSymbol = (suit: string) => {
    switch (suit) {
      case "hearts": return "♥";
      case "diamonds": return "♦";
      case "clubs": return "♣";
      case "spades": return "♠";
      default: return "";
    }
  };
  
  // Card face value representation
  const getCardValueDisplay = (value: number) => {
    if (value === 1) return "A";
    if (value === 10) return "10";
    if (value === 11) return "J";
    if (value === 12) return "Q";
    if (value === 13) return "K";
    if (value === 0.5) return "½";
    return value.toString();
  };
  
  // Different sizing for small cards vs normal
  const cardClasses = small 
    ? "w-8 h-12 text-xxs" 
    : "w-14 h-20 text-xs";
  
  return (
    <div 
      className={`relative ${cardClasses} rounded-md shadow-md overflow-hidden transform transition-transform hover:scale-105
        ${faceDown ? "bg-card-back" : "bg-white"}
        ${aiCard ? "mt-1" : "mb-1"}
      `}
    >
      {!faceDown ? (
        <>
          {/* Card corners with value and suit */}
          <div className={`absolute top-0.5 left-0.5 font-bold ${getSuitColor(card.suit)}`}>
            <div className="flex flex-col items-center">
              <span className="text-xxs">{getCardValueDisplay(card.value)}</span>
              <span className="text-xxs">{getSuitSymbol(card.suit)}</span>
            </div>
          </div>
          
          <div className={`absolute bottom-0.5 right-0.5 font-bold ${getSuitColor(card.suit)} rotate-180`}>
            <div className="flex flex-col items-center">
              <span className="text-xxs">{getCardValueDisplay(card.value)}</span>
              <span className="text-xxs">{getSuitSymbol(card.suit)}</span>
            </div>
          </div>
          
          {/* Card center */}
          <div className={`absolute inset-0 flex items-center justify-center ${getSuitColor(card.suit)}`}>
            {small ? (
              <span className="text-sm">{getSuitSymbol(card.suit)}</span>
            ) : (
              <div className="flex flex-col items-center">
                <span className="text-sm mb-0.5">{getCardValueDisplay(card.value)}</span>
                <span className="text-base">{getSuitSymbol(card.suit)}</span>
              </div>
            )}
          </div>
          
          {/* Special card indicator */}
          {card.type !== "standard" && (
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-center text-xxs py-0.5">
              {card.type}
            </div>
          )}
        </>
      ) : (
        // Card back design
        <div className="absolute inset-0 bg-card-back-pattern flex items-center justify-center">
          <div className="w-3/4 h-3/4 border-2 border-white opacity-30 rounded-sm"></div>
        </div>
      )}
    </div>
  );
};

export default CardComponent;
