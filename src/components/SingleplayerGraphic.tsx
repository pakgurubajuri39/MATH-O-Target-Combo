import React from 'react';
import { motion } from 'motion/react';
import { AILevel } from '../types';

interface SingleplayerGraphicProps {
  aiLevel: AILevel;
  onSelectAiLevel: (level: AILevel) => void;
}

export const SingleplayerGraphic: React.FC<SingleplayerGraphicProps> = ({
  aiLevel,
  onSelectAiLevel,
}) => {
  return (
    <div className="flex flex-col gap-3 my-2">
      {/* Animated Graphic Canvas */}
      <div className="relative w-full h-44 sm:h-52 bg-slate-950/90 rounded-2xl border border-purple-500/40 overflow-hidden flex items-center justify-center p-4 shadow-inner group-hover:border-purple-400/80 transition-colors">
        {/* Neon Cyberpunk Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#a855f7_1.2px,transparent_1.2px)] [background-size:16px_16px] opacity-20 pointer-events-none" />

        {/* Central Holographic AI Core */}
        <div className="relative z-10 flex flex-col items-center">
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
            className="w-20 h-20 rounded-full border-2 border-dashed border-purple-400/70 absolute -inset-2.5 pointer-events-none"
          />
          <motion.div
            animate={{
              boxShadow: [
                '0 0 15px rgba(168,85,247,0.4)',
                '0 0 35px rgba(168,85,247,0.8)',
                '0 0 15px rgba(168,85,247,0.4)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-16 h-16 bg-gradient-to-br from-purple-600 via-indigo-700 to-slate-900 rounded-2xl border-2 border-purple-300 flex items-center justify-center text-3xl shadow-2xl relative z-10"
          >
            🤖
          </motion.div>

          <span className="text-[10px] font-mono font-black text-purple-300 bg-purple-950/90 px-3 py-0.5 rounded-full border border-purple-500/50 mt-2 z-10 shadow-xs flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>Pak GuruAI v2.0</span>
          </span>
        </div>

        {/* Floating Animated Cards */}
        <motion.div
          animate={{ y: [-8, 8, -8], rotate: [-12, -4, -12] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute left-3 sm:left-6 top-4 sm:top-6 w-14 h-20 bg-gradient-to-br from-purple-500 to-indigo-700 rounded-xl border border-white/40 shadow-xl flex flex-col items-center justify-center text-white font-mono pointer-events-none"
        >
          <span className="text-[9px] font-bold text-purple-200">AKAR</span>
          <span className="text-base font-black">√16</span>
        </motion.div>

        <motion.div
          animate={{ y: [8, -8, 8], rotate: [10, 2, 10] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute right-3 sm:right-6 bottom-4 sm:bottom-6 w-14 h-20 bg-gradient-to-br from-cyan-500 to-blue-700 rounded-xl border border-white/40 shadow-xl flex flex-col items-center justify-center text-white font-mono pointer-events-none"
        >
          <span className="text-[9px] font-bold text-cyan-200">PLUS</span>
          <span className="text-base font-black">+7</span>
        </motion.div>

        {/* Floating Math Symbols */}
        <motion.span
          animate={{ opacity: [0.3, 1, 0.3], y: [-10, -20, -10] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute left-1/4 bottom-3 text-xs font-mono font-extrabold text-purple-300"
        >
          ×3 = 21
        </motion.span>
        <motion.span
          animate={{ opacity: [0.4, 1, 0.4], y: [10, 20, 10] }}
          transition={{ duration: 3.5, repeat: Infinity }}
          className="absolute right-1/4 top-3 text-xs font-mono font-extrabold text-cyan-300"
        >
          π ≈ 3.14
        </motion.span>
      </div>

      {/* Interactive AI Difficulty Selector inside card */}
      <div className="bg-slate-950/80 p-3 rounded-2xl border border-purple-500/30 text-left">
        <label className="text-[11px] font-black uppercase text-purple-300 block mb-2 tracking-wider flex items-center justify-between">
          <span>Pilih Tingkat AI:</span>
          <span className="text-[10px] text-purple-400 font-normal">
            {aiLevel === 'mudah' ? '🌱 Pemula' : aiLevel === 'sedang' ? '⚡ Seimbang' : '🔥 Master'}
          </span>
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {(['mudah', 'sedang', 'sangat_canggih'] as AILevel[]).map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectAiLevel(lvl);
              }}
              className={`py-1.5 px-2 rounded-xl text-xs font-extrabold transition cursor-pointer border ${
                aiLevel === lvl
                  ? 'bg-purple-600 text-white border-purple-400 shadow-md scale-[1.02]'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {lvl === 'mudah' ? 'Mudah' : lvl === 'sedang' ? 'Sedang' : 'Canggih'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
