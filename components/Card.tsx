import React from 'react';
import { CardData, Suit, Rank } from '../types';
import { getSuitColor, getSuitSymbol } from '../utils';

interface CardProps {
  card: CardData;
  onClick?: () => void;
  isPlayable?: boolean;
  isHidden?: boolean; // For CPU hand
  isHoverable?: boolean;
}

const Card: React.FC<CardProps> = ({ card, onClick, isPlayable, isHidden, isHoverable = true }) => {
  const color = getSuitColor(card.suit);
  const symbol = getSuitSymbol(card.suit);

  if (isHidden) {
    return (
      <div 
        className="w-32 h-48 rounded-lg shadow-xl relative overflow-hidden border-2 border-stone-800 bg-stone-900 mx-[-30px] transition-transform duration-300 transform"
      >
        {/* Back Pattern */}
        <div className="absolute inset-2 border border-stone-600 opacity-50 flex items-center justify-center">
            <div className="text-stone-700 text-4xl opacity-20 font-serif font-black">墨</div>
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-stone-800 to-black opacity-80"></div>
      </div>
    );
  }

  return (
    <div 
      onClick={isPlayable ? onClick : undefined}
      className={`
        w-32 h-48 rounded-lg shadow-2xl relative overflow-hidden border border-stone-400/50 
        bg-[#F5F5DC] hanji-texture mx-[-30px]
        flex flex-col items-center justify-between p-2 select-none
        transition-all duration-300 ease-out card-enter
        ${isHoverable && isPlayable ? 'cursor-pointer hover:-translate-y-8 hover:rotate-1 hover:shadow-orange-500/30' : ''}
        ${isHoverable && !isPlayable ? 'opacity-90 cursor-not-allowed grayscale-[0.3]' : ''}
        ${!isHoverable ? 'scale-100' : ''}
      `}
      style={{
        boxShadow: isPlayable && isHoverable ? '0 10px 25px -5px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}
    >
      {/* Ink Splatter Background Decoration */}
      <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-multiply" 
           style={{
             background: `radial-gradient(circle at 50% 50%, ${color}, transparent 70%)`
           }} 
      />

      {/* Top Left Rank/Suit */}
      <div className="self-start text-lg font-bold leading-none flex flex-col items-center" style={{ color }}>
        <span>{card.rank}</span>
        <span className="text-sm opacity-80">{symbol}</span>
      </div>

      {/* Center Art */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-6xl filter blur-[0.5px] drop-shadow-lg transform scale-150 opacity-90" style={{ color }}>
           {symbol}
        </div>
        {/* Brush Stroke Ring */}
        <div className="absolute w-24 h-24 border-4 rounded-full opacity-30 rotate-12" 
             style={{ borderColor: color, borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%' }}></div>
      </div>

      {/* Bottom Right Rank/Suit (Inverted) */}
      <div className="self-end text-lg font-bold leading-none flex flex-col items-center rotate-180" style={{ color }}>
        <span>{card.rank}</span>
        <span className="text-sm opacity-80">{symbol}</span>
      </div>

      {/* Rough Border Effect (Inner) */}
      <div className="absolute inset-1 border-2 border-stone-800/10 rounded pointer-events-none mix-blend-multiply"
           style={{ borderRadius: '6px' }}></div>
    </div>
  );
};

export default Card;