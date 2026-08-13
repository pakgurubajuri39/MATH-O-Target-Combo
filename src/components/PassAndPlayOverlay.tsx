import React from 'react';
import { User, EyeOff, Play, ShieldAlert, Sparkles, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PassAndPlayOverlayProps {
  nextPlayerName: string;
  nextPlayerAvatar: string;
  onReady: () => void;
}

export const PassAndPlayOverlay: React.FC<PassAndPlayOverlayProps> = ({
  nextPlayerName,
  nextPlayerAvatar,
  onReady,
}) => {
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4 overflow-hidden">
        {/* Glowing Background Orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 left-1/4 w-80 h-80 bg-blue-600/30 rounded-full blur-3xl pointer-events-none"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/30 rounded-full blur-3xl pointer-events-none"
        />

        {/* Floating Secret Math Cards Background */}
        <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden flex items-center justify-around">
          <motion.div
            animate={{ y: [-15, 15, -15], rotate: [-10, 5, -10] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="w-24 h-36 bg-gradient-to-br from-blue-500 to-indigo-700 rounded-2xl border-2 border-white/30 flex items-center justify-center text-4xl font-black text-white shadow-2xl"
          >
            +5
          </motion.div>
          <motion.div
            animate={{ y: [20, -20, 20], rotate: [12, -8, 12] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            className="w-28 h-40 bg-gradient-to-br from-purple-500 to-pink-700 rounded-2xl border-2 border-white/30 flex items-center justify-center text-5xl font-black text-white shadow-2xl"
          >
            ×2
          </motion.div>
          <motion.div
            animate={{ y: [-10, 18, -10], rotate: [-15, 10, -15] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-24 h-36 bg-gradient-to-br from-amber-500 to-rose-700 rounded-2xl border-2 border-white/30 flex items-center justify-center text-4xl font-black text-white shadow-2xl"
          >
            √
          </motion.div>
        </div>

        {/* Main Privacy Shield Card */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: -30 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          id="pass-and-play-screen"
          className="relative z-10 bg-slate-900/90 border border-slate-700/80 rounded-3xl max-w-md w-full p-8 shadow-[0_0_60px_rgba(30,58,138,0.5)] text-center flex flex-col items-center overflow-hidden"
        >
          {/* Top Edge Neon Pulse */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-400 to-purple-500 rounded-t-3xl" />

          {/* Animated Privacy Badge */}
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex items-center gap-1.5 text-xs font-black text-amber-300 bg-amber-950/80 px-4 py-1.5 rounded-full border border-amber-500/50 mb-6 shadow-inner"
          >
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>MODE PRIVASI BERSAMA</span>
          </motion.div>

          {/* Avatar Ring */}
          <div className="relative mb-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
              className="absolute -inset-3 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 blur-sm opacity-80"
            />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, delay: 0.1 }}
              className="relative w-20 h-20 bg-slate-900 border-2 border-white/20 rounded-full flex items-center justify-center text-4xl font-black shadow-2xl"
            >
              {nextPlayerAvatar}
            </motion.div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white mb-2 tracking-tight flex items-center justify-center gap-2">
            <span>Giliran:</span>
            <span className="text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
              {nextPlayerName}
            </span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 mb-8 leading-relaxed max-w-xs">
            Oper HP/perangkat ini ke <strong className="text-amber-300 font-bold">{nextPlayerName}</strong>. Pastikan pemain lain tidak mengintip kartu tangan Anda!
          </p>

          {/* Action Button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onReady}
            id="btn-pass-ready"
            className="w-full flex items-center justify-center gap-2.5 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-extrabold text-sm rounded-2xl transition shadow-xl border border-white/20 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-white text-white" />
            <span>SAYA SIAP, BUKA KARTU!</span>
            <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse" />
          </motion.button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
