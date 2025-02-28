
interface StatusEffectsProps {
  shield: number;
  bonusDamage: number;
}

const StatusEffects = ({ shield, bonusDamage }: StatusEffectsProps) => {
  if (shield === 0 && bonusDamage === 0) return null;
  
  return (
    <div className="flex space-x-2">
      {shield > 0 && (
        <div className="bg-blue-900 text-blue-200 px-2 py-1 rounded text-xs font-pixel animate-pulse">
          🛡️ {shield}
        </div>
      )}
      
      {bonusDamage > 0 && (
        <div className="bg-red-900 text-red-200 px-2 py-1 rounded text-xs font-pixel animate-pulse">
          ⚔️ +{bonusDamage}
        </div>
      )}
    </div>
  );
};

export default StatusEffects;
