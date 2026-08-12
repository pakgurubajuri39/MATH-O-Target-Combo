import React from 'react';
import { GameMode } from '../types';
import { Volume2, VolumeX, RotateCcw, Calculator, Users, Bot, Layers, Trophy, Globe } from 'lucide-react';

interface GameHeaderProps {
  mode: GameMode;
  currentTurnName: string;
  isAITurn: boolean;
  deckCount: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onResetGame: () => void;
  onOpenPractice: () => void;
  onOpenScoreboard: () => void;
  onOpenRoomMultiplayer: () => void;
  activeRoomCode?: string | null;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  mode,
  currentTurnName,
  isAITurn,
  deckCount,
  soundEnabled,
  onToggleSound,
  onResetGame,
  onOpenPractice,
  onOpenScoreboard,
  onOpenRoomMultiplayer,
  activeRoomCode,
}) => {
  return (
    <header id="game-header" className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30 px-3 sm:px-6 py-2.5 shadow-xl">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-2.5">
          <div className="relative group cursor-pointer shrink-0">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-xl sm:rounded-2xl blur opacity-70 group-hover:opacity-100 transition duration-500"></div>
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 bg-slate-900 ring-1 ring-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg overflow-hidden gap-0.5">
              <span className="text-lg sm:text-xl font-black text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)] tracking-tighter">√</span>
              <span className="text-lg sm:text-xl font-black text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.6)] tracking-tighter">π</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-white text-base sm:text-lg tracking-tight">
                NUMERIX
              </h1>
              <span className="text-[10px] font-black bg-gradient-to-r from-cyan-400 to-blue-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                Math Clash
              </span>
              {activeRoomCode && (
                <span className="text-[10px] font-mono font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded-full animate-pulse">
                  KODE: {activeRoomCode}
                </span>
              )}
            </div>
            <p className="text-[10px] sm:text-xs text-slate-400 font-medium">
              Game Kartu Matematika Edukatif
            </p>
          </div>
        </div>

        {/* Turn Status & Deck Counter */}
        <div className="flex items-center gap-2 sm:gap-4 bg-slate-950/80 px-3.5 py-1.5 rounded-2xl border border-slate-800 shadow-inner">
          <div className="flex items-center gap-1.5">
            {mode === 'ai' ? (
              <Bot className="w-4 h-4 text-purple-400" />
            ) : (
              <Users className="w-4 h-4 text-cyan-400" />
            )}
            <span className="text-xs font-bold text-slate-300">
              Giliran:{' '}
              <span className={`font-black ${isAITurn ? 'text-purple-400 animate-pulse' : 'text-emerald-400'}`}>
                {currentTurnName}
              </span>
            </span>
          </div>

          <div className="h-4 w-px bg-slate-800" />

          <div className="flex items-center gap-1 text-xs font-bold text-slate-300">
            <Layers className="w-4 h-4 text-amber-400" />
            <span>Tumpukan: <span className="font-black text-white">{deckCount}</span></span>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          
          {/* Room Multiplayer Button */}
          <button
            onClick={onOpenRoomMultiplayer}
            id="btn-room-multiplayer"
            className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-cyan-600/30 to-blue-600/30 hover:from-cyan-600/50 hover:to-blue-600/50 text-cyan-200 border border-cyan-500/40 rounded-xl text-xs font-extrabold transition cursor-pointer shadow-xs active:scale-95"
            title="Main Multiplayer via Kode Ruang"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-300" />
            <span className="hidden sm:inline">Kode Ruang</span>
          </button>

          {/* Scoreboard Button */}
          <button
            onClick={onOpenScoreboard}
            id="btn-scoreboard"
            className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/40 hover:to-orange-500/40 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-extrabold transition cursor-pointer shadow-xs active:scale-95"
            title="Lihat Papan Skor & Klasemen"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Papan Skor</span>
          </button>

          {/* Combo Sandbox Practice */}
          <button
            onClick={onOpenPractice}
            id="btn-practice-mode"
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition cursor-pointer border border-slate-700"
            title="Latihan Combo Bebas"
          >
            <Calculator className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden md:inline">Latihan</span>
          </button>

          {/* Toggle Sound */}
          <button
            onClick={onToggleSound}
            id="btn-toggle-sound"
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition cursor-pointer border border-slate-700"
            title={soundEnabled ? 'Matikan Suara' : 'Nyalakan Suara'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* Reset Game */}
          <button
            onClick={onResetGame}
            id="btn-reset-game"
            className="flex items-center gap-1 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 rounded-xl text-xs font-extrabold transition cursor-pointer border border-rose-500/30"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
            <span>Reset</span>
          </button>
        </div>

      </div>
    </header>
  );
};

