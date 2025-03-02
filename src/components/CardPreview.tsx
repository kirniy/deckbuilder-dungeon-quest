import React from "react";
import { Card } from "@/lib/cards";
import { cn } from "@/lib/utils";

interface CardPreviewProps {
  card: Card;
  onClick?: () => void;
  disabled?: boolean;
  faceDown?: boolean;
  removable?: boolean;
}

export const CardPreview: React.FC<CardPreviewProps> = ({
  card,
  onClick,
  disabled = false,
  faceDown = false,
  removable = false,
}) => {
  // Determine card color based on suit
  const getSuitColor = (suit: string): string => {
    switch (suit) {
      case "hearts":
      case "diamonds":
        return "text-red-600 font-bold"; // Stronger red color
      case "business":
        return "text-yellow-500 font-bold"; 
      case "tarot":
        return "text-purple-500 font-bold";
      case "special":
        return "text-blue-500 font-bold";
      default:
        return "text-gray-900 font-bold"; // Darker text for better contrast
    }
  };
  
  // Format card value for display
  const getCardValue = (value: number | number[]): string => {
    if (Array.isArray(value)) {
      return value.join("/");
    }
    
    if (value === 21) {
      return "∞";
    }
    
    return value.toString();
  };
  
  // Effect description for tooltip
  const effectDescription = card.effect?.description || "";
  
  return (
    <div
      className={cn(
        "relative h-36 w-22 rounded-md border-2 p-2 flex flex-col justify-between",
        "transition-all duration-200 shadow-md cursor-pointer hover:shadow-lg transform hover:scale-105",
        "bg-white", // Always white background for better contrast
        card.type !== "standard" && "border-2",
        card.type === "tarot" && "border-purple-500",
        card.type === "business" && "border-yellow-500",
        card.type === "special" && "border-blue-500",
        card.type === "standard" && "border-gray-400", // Border for standard cards
        disabled && "opacity-70 cursor-not-allowed"
      )}
      onClick={!disabled ? onClick : undefined}
      title={effectDescription}
    >
      {/* Card Value and Suit */}
      <div className="flex justify-between items-start">
        <span className={cn("text-base font-bold", getSuitColor(card.suit))}>
          {getCardValue(card.value)}
        </span>
        <span className={cn("text-xs font-medium", getSuitColor(card.suit))}>
          {card.suit}
        </span>
      </div>
      
      {/* Card Name */}
      <div className="text-center text-xs font-medium text-gray-900">
        {card.name}
      </div>
      
      {/* Card Type and Effect Indicator */}
      <div className="flex justify-between items-end text-xs">
        <span className="text-gray-700 capitalize font-medium">
          {card.type}
        </span>
        {card.effect && (
          <span className="text-purple-600 font-bold">
            ✨
          </span>
        )}
      </div>
      
      {/* Removable indicator */}
      {removable && (
        <div className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
          -
        </div>
      )}
    </div>
  );
}; 