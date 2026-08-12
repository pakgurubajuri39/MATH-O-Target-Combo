import React from 'react';
import { Card } from '../types';
import { getColorBgClass } from '../utils/cardUtils';
import { motion } from 'motion/react';

interface CardViewProps {
  card: Card;
  onClick?: () => void;
  isSelected?: boolean;
  isPlayable?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showBadge?: boolean;
}

export const CardView: React.FC<CardViewProps> = ({
  card,
  onClick,
  isSelected = false,
  isPlayable = true,
  disabled = false,
  size = 'md',
  showBadge = true,
}) => {
  const bgClass = getColorBgClass(card.color);

  const sizeClasses = {
    sm: 'w-16 h-24 text-xs rounded-xl p-1.5',
    md: 'w-22 h-32 text-sm rounded-2xl p-2.5 sm:w-28 sm:h-40 sm:text-base',
    lg: 'w-32 h-44 text-base rounded-2xl p-3 sm:w-40 sm:h-56 sm:text-lg',
  }[size];

  const centerCircleSize = {
    sm: 'w-8 h-8 text-base font-black',
    md: 'w-12 h-12 text-2xl sm:w-14 sm:h-14 sm:text-3xl font-black',
    lg: 'w-16 h-16 text-4xl sm:w-20 sm:h-20 sm:text-5xl font-black',
  }[size];

  return (
    <motion.div
      layoutId={card.id}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.5, opacity: 0 }}
      whileHover={disabled ? undefined : { y: -5, scale: 1.05 }}
      whileTap={disabled ? undefined : { scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      onClick={disabled ? undefined : onClick}
      id={`card-${card.id}`}
      className={`relative select-none border-2 cursor-pointer flex flex-col justify-between overflow-hidden shadow-lg ${bgClass} ${sizeClasses} ${
        isSelected
          ? 'ring-4 ring-amber-300 ring-offset-2 ring-offset-slate-950 -translate-y-3 z-10 shadow-2xl shadow-amber-500/20'
          : ''
      } ${
        !isPlayable && !disabled
          ? 'opacity-85'
          : ''
      } ${disabled ? 'cursor-not-allowed opacity-50 grayscale-30' : ''}`}
    >
      {/* Glossy Diagonal Shine Sheen Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/15 to-white/0 pointer-events-none transform -rotate-12 scale-150" />

      {/* Cool Geometric Inner Frame */}
      <div className="absolute inset-1 border border-white/30 rounded-xl pointer-events-none flex flex-col justify-between p-1">
        <div className="flex justify-between items-center text-[7px] font-mono tracking-widest opacity-60">
          <span>NUMERIX</span>
          <span>{card.color.substring(0, 3).toUpperCase()}</span>
        </div>
        <div className="flex justify-between items-center text-[7px] font-mono tracking-widest opacity-60 rotate-180">
          <span>NUMERIX</span>
          <span>{card.color.substring(0, 3).toUpperCase()}</span>
        </div>
      </div>

      {/* Background Watermark Math Pattern */}
      <div className="absolute inset-0 flex flex-wrap items-center justify-around opacity-15 pointer-events-none font-serif text-lg leading-none select-none overflow-hidden">
        <span>+</span><span>∑</span><span>×</span>
        <span>√</span><span>÷</span><span>π</span>
        <span>-</span><span>∫</span><span>%</span>
      </div>

      {/* Top Left Corner Index */}
      <div className="relative z-10 flex justify-between items-start w-full">
        <div className="flex flex-col items-center leading-none">
          <span className="font-black text-xs sm:text-sm drop-shadow-xs">
            {card.type === 'number' ? card.value : card.label}
          </span>
          <span className="text-[9px] font-bold opacity-80">
            {card.color === 'Merah' && '🔴'}
            {card.color === 'Biru' && '🔵'}
            {card.color === 'Hijau' && '🟢'}
            {card.color === 'Kuning' && '🟡'}
            {card.color === 'Wild' && '🌈'}
          </span>
        </div>

        {showBadge && (
          <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider bg-black/30 backdrop-blur-md px-1.5 py-0.5 rounded-md border border-white/20 text-white shadow-xs">
            {card.type === 'number' ? `VAL: ${card.value}` : card.label}
          </span>
        )}
      </div>

      {/* Center Value Circle / Wild Badge */}
      <div className="relative z-10 my-auto text-center flex flex-col items-center justify-center">
        {card.type === 'wild_operator' ? (
          <div className="relative flex flex-col items-center justify-center p-2 rounded-xl bg-black/40 backdrop-blur-md border border-amber-300/60 shadow-lg animate-pulse">
            <span className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-pink-300 to-cyan-300">
              WILD
            </span>
            <div className="flex gap-1 text-[10px] sm:text-xs font-black text-amber-200 mt-0.5">
              <span>+</span><span>-</span><span>×</span><span>÷</span>
            </div>
            <span className="text-[8px] uppercase tracking-widest text-emerald-300 font-bold mt-0.5">
              BEBAS OPERATOR
            </span>
          </div>
        ) : (
          <div className={`relative flex items-center justify-center rounded-full bg-slate-950/30 backdrop-blur-md border-2 border-white/40 shadow-inner ${centerCircleSize}`}>
            <span className="drop-shadow-md tracking-tight font-black text-white">
              {card.type === 'number' ? card.value : card.label}
            </span>
          </div>
        )}

        {card.type === 'number' && (
          <span className="text-[9px] sm:text-[10px] font-bold opacity-90 mt-1 tracking-wider uppercase drop-shadow-xs">
            TARGET {card.color}
          </span>
        )}
      </div>

      {/* Bottom Right Corner Index (Inverted) */}
      <div className="relative z-10 flex justify-end items-end w-full">
        <div className="flex flex-col items-center leading-none rotate-180">
          <span className="font-black text-xs sm:text-sm drop-shadow-xs">
            {card.type === 'number' ? card.value : card.label}
          </span>
          <span className="text-[9px] font-bold opacity-80">
            {card.color === 'Merah' && '🔴'}
            {card.color === 'Biru' && '🔵'}
            {card.color === 'Hijau' && '🟢'}
            {card.color === 'Kuning' && '🟡'}
            {card.color === 'Wild' && '🌈'}
          </span>
        </div>
      </div>

      {/* Selection Checkmark Badge */}
      {isSelected && (
        <div className="absolute top-1 right-1 z-20 bg-amber-400 text-slate-950 rounded-full w-5 h-5 flex items-center justify-center text-xs font-black shadow-lg border border-white">
          ✓
        </div>
      )}
    </motion.div>
  );
};


