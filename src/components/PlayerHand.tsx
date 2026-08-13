import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, Player } from '../types';
import { CardView } from './CardView';
import { isValidSinglePlay } from '../utils/cardUtils';
import { Volume2, Sparkles, User, ShieldAlert, Zap } from 'lucide-react';

interface PlayerHandProps {
  player: Player;
  activeTargetCard: Card;
  isCurrentTurn: boolean;
  onPlaySingleCard: (card: Card) => void;
  onCallMathO: () => void;
  selectedCardId?: string;
  onSelectCard?: (card: Card) => void;
}

export const PlayerHand: React.FC<PlayerHandProps> = ({
  player,
  activeTargetCard,
  isCurrentTurn,
  onPlaySingleCard,
  onCallMathO,
  selectedCardId,
  onSelectCard,
}) => {
  return (
    <motion.div
      id={`player-hand-${player.id}`}
      initial={{ opacity: 0, scale: 0.95, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -15 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className={`bg-white/95 backdrop-blur-md rounded-2xl p-4 border transition-all duration-300 shadow-xl w-full relative overflow-hidden ${
        isCurrentTurn
          ? 'border-emerald-400 ring-2 ring-emerald-400/30 shadow-[0_0_25px_rgba(16,185,129,0.15)]'
          : 'border-slate-200 opacity-90'
      }`}
    >
      {/* Top Active Turn Pulse Accent */}
      {isCurrentTurn && (
        <motion.div
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 rounded-t-2xl"
        />
      )}

      {/* Player Hand Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-xl text-white font-extrabold text-sm ${player.colorTheme} shadow-md`}>
            {player.avatar}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-extrabold text-slate-800 text-sm sm:text-base">
                {player.name}
              </h3>
              {isCurrentTurn && (
                <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  GILIRAN AKTIF
                </span>
              )}
              {player.isAI && (
                <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded border border-purple-200">
                  BOT AI
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-semibold">
              Tersisa <span className="text-emerald-600 font-black">{player.hand.length}</span> Kartu
            </p>
          </div>
        </div>

        {/* NUMERIX! Announcement Alert Button */}
        <div className="flex items-center gap-2">
          {player.hand.length <= 2 && (
            <button
              onClick={onCallMathO}
              disabled={player.isMathOCalled}
              id="btn-call-math-o"
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-black text-xs transition cursor-pointer shadow-xs ${
                player.isMathOCalled
                  ? 'bg-amber-400 text-slate-900 border border-amber-500 ring-2 ring-amber-300'
                  : 'bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-700 hover:to-amber-600 text-white animate-bounce'
              }`}
            >
              <Volume2 className="w-4 h-4" />
              <span>{player.isMathOCalled ? 'NUMERIX! TERPANGGIL' : 'TERIAK "NUMERIX!"'}</span>
            </button>
          )}

          {player.isMathOCalled && player.hand.length > 2 && (
            <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Numerix Terdeteksi
            </span>
          )}
        </div>
      </div>

      {/* Cards List Horizontal Container */}
      <div className="flex gap-2 overflow-x-auto pb-3 pt-1 px-1 justify-center sm:justify-start min-h-[140px] items-center">
        {player.hand.length === 0 ? (
          <div className="w-full py-6 text-center text-slate-400 font-bold text-sm">
            Kartu habis! Pemenang! 🎉
          </div>
        ) : (
          <AnimatePresence>
            {player.hand.map((card, idx) => {
              const isPlayable = isValidSinglePlay(card, activeTargetCard);
              const isSelected = selectedCardId === card.id;

              return (
                <motion.div
                  key={`${card.id}_${idx}`}
                  initial={{ opacity: 0, scale: 0.8, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.5, y: -20 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 25, delay: idx * 0.03 }}
                  className={`transform transition duration-200 ${
                    isCurrentTurn && isPlayable ? 'hover:-translate-y-2' : ''
                  }`}
                >
                  <CardView
                    card={card}
                    size="md"
                    isSelected={isSelected}
                    isPlayable={isPlayable}
                    disabled={!isCurrentTurn}
                    onClick={() => {
                      if (!isCurrentTurn) return;
                      if (onSelectCard) onSelectCard(card);
                      if (isPlayable) {
                        onPlaySingleCard(card);
                      }
                    }}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Helper text */}
      {isCurrentTurn && (
        <p className="text-[11px] text-slate-500 text-center mt-1">
          💡 <span className="font-semibold text-slate-700">Petunjuk:</span> Klik kartu dengan warna atau angka sama untuk main Single, atau klik tombol <span className="font-bold text-emerald-700">"Buat Combo Matematika"</span> untuk menggabungkan kartu!
        </p>
      )}
    </motion.div>
  );
};
