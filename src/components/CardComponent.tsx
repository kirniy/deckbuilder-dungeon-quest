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
        return "text-red-600 font-bold"; // Darker red for better contrast
      case "clubs":
      case "spades":
      default:
        return "text-black font-bold"; // Bold black for better readability
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
  const getCardValueDisplay = (value: number | number[]) => {
    // Handle array values (like Aces which can be [1, 11])
    if (Array.isArray(value)) {
      // For display purposes, just show the first value
      value = value[0];
    }
    
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
    : "w-12 h-16 text-xxs";

  return (
    <div 
      className={`relative ${cardClasses} rounded-md shadow-md overflow-hidden transform transition-transform duration-200
        ${faceDown ? "bg-blue-900 border-2 border-blue-700" : "bg-white border-2 border-gray-300"}
        ${aiCard ? "mt-1" : "mb-1"}
      `}
    >
      {!faceDown ? (
        <>
          {/* Card corners with value and suit */}
          <div className={`absolute top-0.5 left-0.5 ${getSuitColor(card.suit)}`}>
            <div className="flex flex-col items-center">
              <span className={`text-xxs leading-tight`}>{getCardValueDisplay(card.value)}</span>
              <span className={`text-xxs leading-tight`}>{getSuitSymbol(card.suit)}</span>
            </div>
          </div>
          
          <div className={`absolute bottom-0.5 right-0.5 ${getSuitColor(card.suit)} rotate-180`}>
            <div className="flex flex-col items-center">
              <span className={`text-xxs leading-tight`}>{getCardValueDisplay(card.value)}</span>
              <span className={`text-xxs leading-tight`}>{getSuitSymbol(card.suit)}</span>
            </div>
          </div>

          {/* Card center */}
          <div className={`absolute inset-0 flex items-center justify-center ${getSuitColor(card.suit)}`}>
            {small ? (
              <span className="text-sm">{getSuitSymbol(card.suit)}</span>
            ) : (
              <div className="flex flex-col items-center">
                <span className="text-xs font-bold mb-0.5">{getCardValueDisplay(card.value)}</span>
                <span className="text-xs">{getSuitSymbol(card.suit)}</span>
              </div>
            )}
          </div>
          
          {/* Special card indicator */}
          {card.type !== "standard" && (
            <div className="absolute bottom-0 left-0 right-0 bg-black text-white text-center text-xxs py-0.5 font-medium">
              {card.type}
            </div>
          )}
        </>
      ) : (
        // Card back design
        <div className="absolute inset-0 bg-blue-900 flex items-center justify-center border border-blue-700">
          <div className="w-3/4 h-3/4 border-2 border-white opacity-80 rounded-sm flex items-center justify-center">
            <div className="text-white text-xs font-bold">♠♣</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardComponent;
