interface StatusEffectsProps {
  shield: number;
  bonusDamage: number;
}

const StatusEffects = ({ shield, bonusDamage }: StatusEffectsProps) => {
  if (shield === 0 && bonusDamage === 0) return null;
  
  return (
    <div className="flex space-x-2">
      {shield > 0 && (
        <div className="bg-blue-800 text-blue-100 px-2 py-1 rounded-md text-xs font-pixel font-bold animate-pulse border-2 border-blue-700 shadow-md">
          🛡️ {shield}
        </div>
      )}
      
      {bonusDamage > 0 && (
        <div className="bg-red-800 text-red-100 px-2 py-1 rounded-md text-xs font-pixel font-bold animate-pulse border-2 border-red-700 shadow-md">
          ⚔️ +{bonusDamage}
        </div>
      )}
    </div>
  );
};

export default StatusEffects;
