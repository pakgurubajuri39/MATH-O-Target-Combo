import React, { useState, useEffect } from 'react';
import { Card } from '../types';

interface RoomPlayer {
  id: string;
  name: string;
  hand: Card[];
  isAI: boolean;
  score: number;
  combosCount: number;
  isMathOCalled: boolean;
  avatar: string;
  colorTheme: string;
}

export interface RoomState {
  code: string;
  hostPlayerId: string;
  maxPlayers: number;
  status: 'waiting' | 'playing' | 'finished';
  players: RoomPlayer[];
  deck: Card[];
  activeTargetCard: Card | null;
  activePlayerIndex: number;
  direction: number;
  history: any[];
  winner: RoomPlayer | null;
  lastUpdated: number;
}

interface RoomMultiplayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoomConnected: (roomState: RoomState, myPlayerId: string) => void;
}

export const RoomMultiplayerModal: React.FC<RoomMultiplayerModalProps> = ({
  isOpen,
  onClose,
  onRoomConnected,
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');
  const [playerName, setPlayerName] = useState('');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [maxPlayers, setMaxPlayers] = useState<number>(4);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Active lobby state if created/joined
  const [connectedRoom, setConnectedRoom] = useState<RoomState | null>(null);
  const [myPlayerId, setMyPlayerId] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    // Load default saved player name
    const savedName = localStorage.getItem('matho_player_name') || '';
    if (savedName) setPlayerName(savedName);
  }, []);

  // Poll room state in lobby until game starts
  useEffect(() => {
    if (!connectedRoom || connectedRoom.status !== 'waiting') return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/rooms/${connectedRoom.code}`);
        const data = await res.json();
        if (data.success && data.roomState) {
          setConnectedRoom(data.roomState);
          // If host started game, notify parent App.tsx!
          if (data.roomState.status === 'playing') {
            onRoomConnected(data.roomState, myPlayerId);
            onClose();
          }
        }
      } catch (err) {
        // Silently ignore transient network errors during lobby polling
      }
    }, 1200);

    return () => clearInterval(interval);
  }, [connectedRoom, myPlayerId, onRoomConnected, onClose]);

  if (!isOpen) return null;

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) {
      setErrorMessage('Masukkan nama pemain Anda.');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);
    localStorage.setItem('matho_player_name', playerName.trim());

    try {
      const res = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostName: playerName.trim(),
          maxPlayers,
        }),
      });

      let data;
      let textResponse = '';
      try {
        textResponse = await res.clone().text();
        data = JSON.parse(textResponse);
      } catch (e) {
        console.error("Non-JSON in create:", textResponse);
        throw new Error('Server error: ' + textResponse.substring(0, 50));
      }

      if (!res.ok || !data.success) {
        throw new Error(data?.error || 'Gagal membuat ruang permainan.');
      }

      setConnectedRoom(data.roomState);
      setMyPlayerId(data.playerId);
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan jaringan.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) {
      setErrorMessage('Masukkan nama pemain Anda.');
      return;
    }
    if (!roomCodeInput.trim()) {
      setErrorMessage('Masukkan 4-digit kode ruang.');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);
    localStorage.setItem('matho_player_name', playerName.trim());

    try {
      const res = await fetch('/api/rooms/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomCode: roomCodeInput.trim(),
          playerName: playerName.trim(),
        }),
      });

      let data;
      let textResponse = '';
      try {
        textResponse = await res.clone().text();
        data = JSON.parse(textResponse);
      } catch (e) {
        console.error("Non-JSON in join:", textResponse);
        throw new Error('Server error: ' + textResponse.substring(0, 50));
      }

      if (!res.ok || !data.success) {
        throw new Error(data?.error || 'Gagal bergabung ke ruang.');
      }

      setConnectedRoom(data.roomState);
      setMyPlayerId(data.playerId);

      // If already playing (rejoining), start immediately
      if (data.roomState.status === 'playing') {
        onRoomConnected(data.roomState, data.playerId);
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menghubungkan ke ruang.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartRoomGame = async () => {
    if (!connectedRoom) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/rooms/${connectedRoom.code}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: myPlayerId }),
      });

      let data;
      let textResponse = '';
      try {
        textResponse = await res.clone().text();
        data = JSON.parse(textResponse);
      } catch (e) {
        console.error("Non-JSON in start:", textResponse);
        throw new Error('Server error: ' + textResponse.substring(0, 50));
      }

      if (!res.ok || !data.success) {
        throw new Error(data?.error || 'Gagal memulai permainan.');
      }

      onRoomConnected(data.roomState, myPlayerId);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal memulai permainan.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (!connectedRoom) return;
    navigator.clipboard.writeText(connectedRoom.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between border-b border-cyan-400/30">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🌐</span>
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-wide">Multiplayer Kode Ruang</h2>
              <p className="text-xs text-cyan-100 font-medium">
                Main Bersama di Jaringan yang Sama dengan Kode 4-Digit
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-950/40 text-cyan-100 hover:text-white hover:bg-slate-950/70 flex items-center justify-center font-bold text-lg transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">

          {errorMessage && (
            <div className="bg-rose-500/20 border border-rose-500/50 rounded-xl p-3 text-xs text-rose-200 font-semibold flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Connected Room Lobby State */}
          {connectedRoom ? (
            <div className="space-y-6">
              
              {/* Room Code Display Box */}
              <div className="bg-slate-950/80 border-2 border-cyan-500/40 rounded-2xl p-5 text-center space-y-2 relative overflow-hidden">
                <div className="absolute top-2 right-2">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-[10px] animate-pulse">
                    ● RUANG AKTIF
                  </span>
                </div>

                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Kode Ruang Permainan Anda
                </span>

                <div className="flex items-center justify-center gap-2 mt-4 mb-2">
                  <div className="text-4xl sm:text-5xl font-mono font-black text-cyan-400 tracking-[0.2em] bg-slate-900 px-6 py-3 rounded-xl border-2 border-cyan-500/50 shadow-inner">
                    {connectedRoom.code}
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className="p-3 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-xl border border-slate-600 transition-all active:scale-95 flex flex-col items-center justify-center gap-1"
                    title="Salin Kode"
                  >
                    <span className="text-lg">{copiedCode ? '✓' : '📋'}</span>
                    <span className="text-[10px] font-bold uppercase">{copiedCode ? 'Tersalin' : 'Salin'}</span>
                  </button>
                </div>

                <p className="text-xs text-slate-400">
                  Bagikan kode 4-digit di atas kepada teman Anda di jaringan/perangkat yang sama!
                </p>
              </div>

              {/* Connected Players List */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs text-slate-300 font-bold">
                  <span>Pemain Terhubung ({connectedRoom.players.length}/{connectedRoom.maxPlayers}):</span>
                  {connectedRoom.players.length < 2 && (
                    <span className="text-amber-400">Menunggu pemain lain bergabung...</span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {connectedRoom.players.map((p, idx) => (
                    <div
                      key={p.id}
                      className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="text-xl">{p.avatar}</span>
                        <div className="truncate">
                          <span className="font-bold text-sm text-white block truncate">
                            {p.name}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {p.id === connectedRoom.hostPlayerId ? '👑 Pembuat Ruang (Host)' : `Pemain ${idx + 1}`}
                          </span>
                        </div>
                      </div>
                      {p.id === myPlayerId && (
                        <span className="text-[9px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-1.5 py-0.5 rounded font-black">
                          ANDA
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Start Button or Host Waiting */}
              <div className="pt-2 flex flex-col gap-2">
                {connectedRoom.hostPlayerId === myPlayerId ? (
                  <button
                    onClick={handleStartRoomGame}
                    disabled={isLoading || connectedRoom.players.length < 2}
                    className={`w-full py-3.5 px-4 rounded-xl font-extrabold text-base transition-all shadow-lg flex items-center justify-center gap-2 ${
                      connectedRoom.players.length >= 2
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 shadow-emerald-950/50 active:scale-98 cursor-pointer'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {isLoading ? (
                      <span>Memproses...</span>
                    ) : (
                      <>
                        <span>🚀 Mulai Permainan Multiplayer</span>
                        <span className="text-xs opacity-80">({connectedRoom.players.length} Pemain)</span>
                      </>
                    )}
                  </button>
                ) : (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-center text-xs text-amber-200">
                    ⏳ Menunggu Host (Pembuat Ruang) menekan tombol <b>Mulai Permainan</b>...
                  </div>
                )}
              </div>

            </div>
          ) : (
            <>
              {/* Tabs: Create or Join */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950/80 rounded-xl border border-slate-800">
                <button
                  onClick={() => setActiveTab('create')}
                  className={`py-2.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'create'
                      ? 'bg-cyan-500 text-slate-950 shadow-md font-extrabold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ➕ Buat Ruang Baru
                </button>
                <button
                  onClick={() => setActiveTab('join')}
                  className={`py-2.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'join'
                      ? 'bg-cyan-500 text-slate-950 shadow-md font-extrabold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🔑 Masukkan Kode Ruang
                </button>
              </div>

              {/* Form Create */}
              {activeTab === 'create' ? (
                <form onSubmit={handleCreateRoom} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Nama Anda (Pemain):
                    </label>
                    <input
                      type="text"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder="Contoh: Budi, Sinta, Luky"
                      maxLength={15}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold text-sm focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Kapasitas Maksimal Pemain:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[2, 3, 4].map((num) => (
                        <button
                          type="button"
                          key={num}
                          onClick={() => setMaxPlayers(num)}
                          className={`py-2 rounded-xl text-xs font-extrabold border transition-all ${
                            maxPlayers === num
                              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {num} Pemain
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold rounded-xl transition-all shadow-lg active:scale-98"
                  >
                    {isLoading ? 'Membuat Ruang...' : '✨ Buat Ruang & Dapatkan Kode'}
                  </button>
                </form>
              ) : (
                /* Form Join */
                <form onSubmit={handleJoinRoom} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Nama Anda (Pemain):
                    </label>
                    <input
                      type="text"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder="Contoh: Budi, Luky"
                      maxLength={15}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold text-sm focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Kode Ruang (4 Digit):
                    </label>
                    <input
                      type="text"
                      value={roomCodeInput}
                      onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                      placeholder="Misal: 8492"
                      maxLength={6}
                      className="w-full px-4 py-3 bg-slate-950 border border-cyan-500/60 rounded-xl text-amber-300 font-mono font-black text-center text-2xl tracking-widest uppercase focus:outline-none focus:border-cyan-300"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold rounded-xl transition-all shadow-lg active:scale-98"
                  >
                    {isLoading ? 'Mengecek Kode...' : '🚪 Bergabung ke Ruang'}
                  </button>
                </form>
              )}
            </>
          )}

        </div>

      </div>
    </div>
  );
};
