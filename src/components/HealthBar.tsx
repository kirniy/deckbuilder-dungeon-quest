import { useState, useEffect } from "react";

interface HealthBarProps {
  current: number;
  max: number;
  barColor?: string;
  textColor?: string;
}

const HealthBar = ({ 
  current, 
  max, 
  barColor = "bg-green-500",
  textColor = "text-white"
}: HealthBarProps) => {
  const [width, setWidth] = useState(100);
  const [animate, setAnimate] = useState(false);
  
  // Calculate percentage and animate changes
  useEffect(() => {
    const percentage = Math.max(0, Math.min(100, (current / max) * 100));
    
    // Trigger animation if health changes
    if (width !== percentage) {
      setAnimate(true);
      
      // Reset animation after it completes
      const timer = setTimeout(() => {
        setAnimate(false);
      }, 300);
      
      return () => clearTimeout(timer);
    }
    
    setWidth(percentage);
  }, [current, max, width]);
  
  // Get text color based on health percentage
  const getTextColorClass = () => {
    const percentage = (current / max) * 100;
    if (percentage <= 25) return "text-red-300 font-bold";
    if (percentage <= 50) return "text-yellow-300 font-bold";
    return textColor;
  };
  
  return (
    <div className="mb-2">
      <div className="flex justify-between items-center mb-1">
        <span className={`text-sm sm:text-base font-pixel font-bold ${getTextColorClass()}`}>
          HP: {current}/{max}
        </span>
      </div>
      
      <div className="w-full h-4 sm:h-5 bg-gray-900 rounded-full overflow-hidden border-2 border-gray-700 shadow-inner">
        <div
          className={`h-full ${barColor} ${animate ? 'animate-pulse' : ''} transition-all duration-300 ease-out rounded-full`}
          style={{ width: `${width}%` }}
        ></div>
      </div>
    </div>
  );
};

export default HealthBar;
