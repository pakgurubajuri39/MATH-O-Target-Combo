import React from 'react';
import { motion } from 'motion/react';

interface PassAndPlayGraphicProps {
  numPlayers: number;
  onSelectNumPlayers: (num: number) => void;
}

export const PassAndPlayGraphic: React.FC<PassAndPlayGraphicProps> = ({
  numPlayers,
  onSelectNumPlayers,
}) => {
  const avatars = ['🎮', '🎯', '🚀', '⭐'];

  return (
    <div className="flex flex-col gap-3 my-2">
      {/* Animated Arena Canvas */}
      <div className="relative w-full h-44 sm:h-52 bg-slate-950/90 rounded-2xl border border-emerald-500/40 overflow-hidden flex items-center justify-center p-4 shadow-inner group-hover:border-emerald-400/80 transition-colors">
        {/* Felt Casino Table Pattern */}
        <div className="absolute w-48 h-32 sm:w-56 sm:h-36 bg-emerald-900/30 rounded-[50%] border border-emerald-500/30 blur-xs pointer-events-none" />

        {/* Central Deck Target Card */}
        <motion.div
          animate={{ scale: [0.96, 1.04, 0.96] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="w-14 h-20 bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 rounded-xl border-2 border-white shadow-[0_0_20px_rgba(245,158,11,0.5)] flex flex-col items-center justify-center text-slate-950 font-mono font-black relative z-10 pointer-events-none"
        >
          <span className="text-[8px] font-extrabold uppercase tracking-widest text-slate-900">
            TARGET
          </span>
          <span className="text-xl font-black">12</span>
        </motion.div>

        {/* Orbiting Player Avatars */}
        {Array.from({ length: numPlayers }).map((_, i) => {
          const angle = (i * 360) / numPlayers - 90;
          const radius = 68; // radius in px
          const rad = (angle * Math.PI) / 180;
          const x = Math.cos(rad) * radius;
          const y = Math.sin(rad) * radius * 0.65;

          return (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{
                x,
                y,
                scale: 1,
              }}
              transition={{ type: 'spring', stiffness: 350, damping: 22 }}
              className="absolute z-20 flex flex-col items-center pointer-events-none"
            >
              <motion.div
                animate={{ y: [-3, 3, -3] }}
                transition={{
                  duration: 2 + i * 0.4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="w-9 h-9 bg-slate-900 border-2 border-emerald-400 rounded-full flex items-center justify-center text-lg shadow-xl"
              >
                {avatars[i]}
              </motion.div>
              <span className="text-[8px] font-black text-emerald-300 bg-slate-950/90 px-2 py-0.5 rounded-full border border-emerald-500/50 mt-0.5 shadow-xs">
                Pemain {i + 1}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Interactive Player Count Selector inside card */}
      <div className="bg-slate-950/80 p-3 rounded-2xl border border-emerald-500/30 text-left">
        <label className="text-[11px] font-black uppercase text-emerald-300 block mb-2 tracking-wider flex items-center justify-between">
          <span>Jumlah Pemain Lokal:</span>
          <span className="text-[10px] text-emerald-400 font-normal">
            👥 {numPlayers} Pemain di 1 HP
          </span>
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {[2, 3, 4].map((count) => (
            <button
              key={count}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectNumPlayers(count);
              }}
              className={`py-1.5 px-2 rounded-xl text-xs font-extrabold transition cursor-pointer border ${
                numPlayers === count
                  ? 'bg-emerald-600 text-white border-emerald-400 shadow-md scale-[1.02]'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {count} Pemain
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
