import React, { useState, useEffect } from 'react';
import { Player } from '../types';

interface ScoreboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  players: Player[];
  currentGameRound: number;
}

interface PlayerStatsHistory {
  playerName: string;
  totalGames: number;
  wins: number;
  totalCombos: number;
  highestComboScore: number;
  totalScore: number;
}

export const ScoreboardModal: React.FC<ScoreboardModalProps> = ({
  isOpen,
  onClose,
  players,
  currentGameRound,
}) => {
  const [statsHistory, setStatsHistory] = useState<Record<string, PlayerStatsHistory>>({});

  useEffect(() => {
    // Load historical stats from localStorage
    const saved = localStorage.getItem('matho_scoreboard_stats');
    if (saved) {
      try {
        setStatsHistory(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Merge current live match scores with historical data
  const combinedStats = players.map(p => {
    const hist = statsHistory[p.name] || {
      playerName: p.name,
      totalGames: 1,
      wins: 0,
      totalCombos: 0,
      highestComboScore: 0,
      totalScore: 0,
    };

    return {
      id: p.id,
      name: p.name,
      avatar: p.avatar,
      colorTheme: p.colorTheme,
      currentScore: p.score,
      currentCombos: p.combosCount,
      cardsLeft: p.hand.length,
      historicalWins: hist.wins,
      historicalGames: Math.max(hist.totalGames, 1),
      totalScore: (hist.totalScore || 0) + p.score,
    };
  }).sort((a, b) => b.currentScore - a.currentScore);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-orange-600 px-6 py-4 flex items-center justify-between border-b border-amber-400/30">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏆</span>
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-wide">Papan Skor & Klasemen</h2>
              <p className="text-xs text-amber-100 font-medium">
                Ronde Ke-{currentGameRound} • Statistik Poin & Combo Pemain
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-950/40 text-amber-100 hover:text-white hover:bg-slate-950/70 flex items-center justify-center font-bold text-lg transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Top Leaderboard Podium */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {combinedStats.map((player, idx) => {
              const rankBadge = idx === 0 ? '🥇 Juara 1' : idx === 1 ? '🥈 Juara 2' : idx === 2 ? '🥉 Juara 3' : `#${idx + 1}`;
              const rankBg = idx === 0 ? 'bg-amber-500/20 border-amber-500/50 text-amber-300' : idx === 1 ? 'bg-slate-400/20 border-slate-400/50 text-slate-200' : 'bg-orange-700/20 border-orange-600/50 text-orange-300';

              return (
                <div
                  key={player.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between ${rankBg} transition-all hover:scale-[1.02]`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black uppercase px-2 py-0.5 rounded bg-black/40 border border-white/10">
                      {rankBadge}
                    </span>
                    <span className="text-2xl">{player.avatar}</span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-base text-white truncate">{player.name}</h3>
                    <div className="text-2xl font-black text-amber-400 mt-1">
                      {player.currentScore} <span className="text-xs font-semibold text-slate-300">PTS</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Combo Sukses</span>
                      <span className="font-bold text-emerald-400">✨ {player.currentCombos}x</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Sisa Kartu</span>
                      <span className="font-bold text-sky-400">🎴 {player.cardsLeft}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Leaderboard Table */}
          <div className="bg-slate-950/60 rounded-xl border border-slate-800 overflow-hidden">
            <div className="px-4 py-3 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-200 flex items-center gap-2">
                <span>📊</span> Detail Statistik Ronde Ini
              </h4>
              <span className="text-xs text-slate-400">Real-Time Sync</span>
            </div>

            <div className="divide-y divide-slate-800/80">
              {combinedStats.map((p, idx) => (
                <div key={p.id} className="p-3.5 flex items-center justify-between hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-center font-black text-sm text-slate-500">
                      #{idx + 1}
                    </span>
                    <span className="text-xl">{p.avatar}</span>
                    <div>
                      <div className="font-bold text-sm text-white flex items-center gap-2">
                        {p.name}
                        {idx === 0 && <span className="text-[10px] bg-amber-400/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-400/30">LEADER</span>}
                      </div>
                      <span className="text-[11px] text-slate-400">
                        Sisa kartu di tangan: {p.cardsLeft} kartu
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <div className="text-sm font-black text-amber-400">{p.currentScore} Poin</div>
                      <div className="text-[10px] text-emerald-400 font-medium">{p.currentCombos} Combo Dibuat</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rules & Scoring System Explanation */}
          <div className="bg-amber-950/30 border border-amber-500/20 rounded-xl p-4 text-xs text-amber-200/90 space-y-1">
            <span className="font-bold text-amber-300 block text-xs">💡 Sistem Perhitungan Poin NUMERIX:</span>
            <ul className="list-disc list-inside space-y-0.5 pl-1 opacity-90">
              <li><b>Turunkan Kartu Single:</b> +5 Poin</li>
              <li><b>Berhasil NUMERIX Combo:</b> +15 Poin Dasar + (+5 Poin per Kartu Combo)</li>
              <li><b>Menang Ronde (Kartu Habis):</b> +50 Poin Bonus Juara</li>
              <li><b>Salah Hitung Combo:</b> Penalti Ambil 2 Kartu Tambahan</li>
            </ul>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl transition-all shadow-md active:scale-95"
          >
            Tutup Papan Skor
          </button>
        </div>

      </div>
    </div>
  );
};
