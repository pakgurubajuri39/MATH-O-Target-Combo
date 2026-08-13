import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';
import {
  Card,
  GameMode,
  Player,
  MoveHistoryItem,
  AILevel,
  MathOperator,
} from './types';
import {
  generateDeck,
  isValidSinglePlay,
  findAIComboSolution,
} from './utils/cardUtils';
import { sounds } from './utils/sound';
import { triggerComboParticles } from './utils/particleUtils';

import { GameHeader } from './components/GameHeader';
import { ActiveTargetCard } from './components/ActiveTargetCard';
import { PlayerHand } from './components/PlayerHand';
import { ComboBuilderModal } from './components/ComboBuilderModal';
import { HistoryLog } from './components/HistoryLog';
import { GuruHintModal } from './components/GuruHintModal';
import { PassAndPlayOverlay } from './components/PassAndPlayOverlay';
import { PracticeSandbox } from './components/PracticeSandbox';
import { TutorialModal } from './components/TutorialModal';
import { Footer } from './components/Footer';
import { ScoreboardModal } from './components/ScoreboardModal';
import { SingleplayerGraphic } from './components/SingleplayerGraphic';
import { PassAndPlayGraphic } from './components/PassAndPlayGraphic';

import {
  Bot,
  Users,
  Play,
  Trophy,
  Sparkles,
  Layers,
  HelpCircle,
  RotateCcw,
  Volume2,
  VolumeX,
  AlertCircle,
  Calculator,
  Zap,
  Brain,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

export default function App() {
  // Game Setup State
  const [gameMode, setGameMode] = useState<GameMode>('menu');
  const [numPlayers, setNumPlayers] = useState<number>(2);
  const [playerNames, setPlayerNames] = useState<string[]>([
    'Pemain 1',
    'Pemain 2',
    'Pemain 3',
    'Pemain 4',
  ]);
  const [aiLevel, setAiLevel] = useState<AILevel>('sedang');
  const [privacyPassMode, setPrivacyPassMode] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Active Game State
  const [deck, setDeck] = useState<Card[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [activePlayerIndex, setActivePlayerIndex] = useState<number>(0);
  const [activeTargetCard, setActiveTargetCard] = useState<Card | null>(null);
  const [direction, setDirection] = useState<number>(1); // 1 = clockwise, -1 = counter
  const [history, setHistory] = useState<MoveHistoryItem[]>([]);
  const [winner, setWinner] = useState<Player | null>(null);
  const [currentGameRound, setCurrentGameRound] = useState<number>(1);
  const [comboBurstTrigger, setComboBurstTrigger] = useState<number>(0);

  // UI Modals & Screens
  const [isComboModalOpen, setIsComboModalOpen] = useState<boolean>(false);
  const [isPassScreenOpen, setIsPassScreenOpen] = useState<boolean>(false);
  const [isPracticeOpen, setIsPracticeOpen] = useState<boolean>(false);
  const [isScoreboardOpen, setIsScoreboardOpen] = useState<boolean>(false);
  const [isGuruHintOpen, setIsGuruHintOpen] = useState<boolean>(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(false);
  const [guruHintText, setGuruHintText] = useState<string>('');
  const [isHintLoading, setIsHintLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'info' | 'success' | 'error' | 'warning';
  } | null>(null);

  const isAITurnRef = useRef<boolean>(false);

  // Show temporary banner notification
  const showBanner = (
    message: string,
    type: 'info' | 'success' | 'error' | 'warning' = 'info'
  ) => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Start / Initialize Game
  const startNewGame = (mode: GameMode) => {
    sounds.playCard();
    const fullDeck = generateDeck();

    let newPlayers: Player[] = [];

    if (mode === 'ai') {
      newPlayers = [
        {
          id: 'p1',
          name: playerNames[0] || 'Kamu',
          isAI: false,
          hand: fullDeck.slice(0, 7),
          isMathOCalled: false,
          avatar: '🎮',
          colorTheme: 'bg-emerald-600',
        },
        {
          id: 'p2',
          name: 'Pak GuruAI Bot',
          isAI: true,
          hand: fullDeck.slice(7, 14),
          isMathOCalled: false,
          avatar: '🤖',
          colorTheme: 'bg-purple-600',
        },
      ];
    } else {
      // Multiplayer mode
      const colors = [
        'bg-emerald-600',
        'bg-blue-600',
        'bg-purple-600',
        'bg-rose-600',
      ];
      const avatars = ['🎮', '🎯', '🚀', '⭐'];

      for (let i = 0; i < numPlayers; i++) {
        newPlayers.push({
          id: `p${i + 1}`,
          name: playerNames[i] || `Pemain ${i + 1}`,
          isAI: false,
          hand: fullDeck.slice(i * 7, (i + 1) * 7),
          isMathOCalled: false,
          avatar: avatars[i % avatars.length],
          colorTheme: colors[i % colors.length],
        });
      }
    }

    const remainingDeck = fullDeck.slice(newPlayers.length * 7);

    // Initial target card must be a number card
    let targetIdx = 0;
    while (
      targetIdx < remainingDeck.length &&
      remainingDeck[targetIdx].type !== 'number'
    ) {
      targetIdx++;
    }

    const initialTarget = remainingDeck[targetIdx] || remainingDeck[0];
    const finalDeck = remainingDeck.filter((_, idx) => idx !== targetIdx);

    setDeck(finalDeck);
    setPlayers(newPlayers);
    setActiveTargetCard(initialTarget);
    setActivePlayerIndex(0);
    setDirection(1);
    setHistory([]);
    setWinner(null);
    setGameMode(mode);

    if (mode === 'multiplayer' && privacyPassMode) {
      setIsPassScreenOpen(true);
    }

    showBanner(
      `Permainan Dimulai! Target Meja saat ini: ${initialTarget.color} ${initialTarget.value}`,
      'success'
    );
  };

  // Next Turn advancement
  const advanceTurn = (
    nextPlayersList: Player[],
    nextDeck: Card[],
    skipCount: number = 1
  ) => {
    // Check win state
    const currentP = nextPlayersList[activePlayerIndex];
    if (currentP.hand.length === 0) {
      setWinner(currentP);
      sounds.playVictory();
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      return;
    }

    let nextIndex =
      (activePlayerIndex + direction * skipCount + nextPlayersList.length) %
      nextPlayersList.length;

    setActivePlayerIndex(nextIndex);
    setPlayers(nextPlayersList);
    setDeck(nextDeck);

    const nextPlayer = nextPlayersList[nextIndex];

    if (gameMode === 'multiplayer' && privacyPassMode && !nextPlayer.isAI) {
      setIsPassScreenOpen(true);
    }
  };

  // Single Card Play
  const handlePlaySingleCard = async (card: Card) => {
    if (!activeTargetCard) return;

    const currentPlayer = players[activePlayerIndex];

    if (!isValidSinglePlay(card, activeTargetCard)) {
      sounds.playPenalty();
      showBanner(
        `Kartu ${card.color} ${
          card.value !== undefined ? card.value : card.label
        } tidak cocok dengan Target ${activeTargetCard.color} ${
          activeTargetCard.value !== undefined
            ? activeTargetCard.value
            : activeTargetCard.label
        }!`,
        'error'
      );
      return;
    }

    sounds.playCard();

    // Remove card from player hand
    const newHand = currentPlayer.hand.filter(c => c.id !== card.id);
    const updatedPlayer: Player = {
      ...currentPlayer,
      hand: newHand,
      score: (currentPlayer.score || 0) + 5,
      isMathOCalled: newHand.length === 1 ? currentPlayer.isMathOCalled : false,
    };

    const updatedPlayers = [...players];
    updatedPlayers[activePlayerIndex] = updatedPlayer;

    // Log history
    const targetVal =
      activeTargetCard.type === 'number' ? activeTargetCard.value! : 0;
    const newTargetVal = card.type === 'number' ? card.value! : targetVal;

    const historyEntry: MoveHistoryItem = {
      id: `m_${Date.now()}`,
      playerName: currentPlayer.name,
      timestamp: new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      actionType: 'single',
      cardsPlayed: [card],
      targetValueBefore: targetVal,
      targetValueAfter: newTargetVal,
      description: `Menurunkan kartu Single ${card.color} ${
        card.value !== undefined ? card.value : card.label
      }`,
    };

    setHistory([historyEntry, ...history]);
    setActiveTargetCard(card);

    // Auto NUMERIX alert check
    if (newHand.length === 1 && !currentPlayer.isMathOCalled) {
      sounds.playMathOAlert();
      showBanner(`${currentPlayer.name} menyisakan 1 kartu: "NUMERIX!"`, 'warning');
    }

    // Handle Action Cards (+2, Skip, Reverse)
    let skipCount = 1;
    if (card.type === '+2') {
      // Next player draws 2 cards
      const nextIdx = (activePlayerIndex + direction + players.length) % players.length;
      const targetP = updatedPlayers[nextIdx];
      let currentDeck = [...deck];
      let drawnCards: Card[] = [];

      for (let i = 0; i < 2; i++) {
        if (currentDeck.length === 0) currentDeck = generateDeck();
        drawnCards.push(currentDeck.shift()!);
      }

      updatedPlayers[nextIdx] = {
        ...targetP,
        hand: [...targetP.hand, ...drawnCards],
      };

      showBanner(
        `Kartu +2 dimainkan! ${targetP.name} harus mengambil 2 kartu dan kehilangan giliran!`,
        'info'
      );
      skipCount = 2; // skip turn
    } else if (card.type === 'skip') {
      showBanner(`Kartu SKIP dimainkan! Giliran dilewati.`, 'info');
      skipCount = 2;
    } else if (card.type === 'reverse') {
      setDirection(-direction);
      showBanner(`Kartu REVERSE dimainkan! Arah giliran dibalik.`, 'info');
    }

    advanceTurn(updatedPlayers, deck, skipCount);
  };

  // Combo Math Submit
  const handleSubmitCombo = async (
    selectedCards: Card[],
    operators: MathOperator[],
    isCorrect: boolean,
    errorMessage?: string
  ) => {
    if (!activeTargetCard) return;

    const currentPlayer = players[activePlayerIndex];
    const targetVal =
      activeTargetCard.type === 'number' ? activeTargetCard.value! : 0;

    if (!isCorrect) {
      // PENALTY +2 CARDS FOR INVALID COMBO!
      sounds.playPenalty();
      let currentDeck = [...deck];
      let penaltyCards: Card[] = [];

      for (let i = 0; i < 2; i++) {
        if (currentDeck.length === 0) currentDeck = generateDeck();
        penaltyCards.push(currentDeck.shift()!);
      }

      const updatedPlayer: Player = {
        ...currentPlayer,
        hand: [...currentPlayer.hand, ...penaltyCards],
      };

      const updatedPlayers = [...players];
      updatedPlayers[activePlayerIndex] = updatedPlayer;

      const historyEntry: MoveHistoryItem = {
        id: `m_${Date.now()}`,
        playerName: currentPlayer.name,
        timestamp: new Date().toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
        actionType: 'penalty',
        cardsPlayed: selectedCards,
        targetValueBefore: targetVal,
        targetValueAfter: targetVal,
        description: `❌ Gagal Combo Matematika! Penalti +2 Kartu diberikan.`,
        isCorrect: false,
      };

      setHistory([historyEntry, ...history]);
      showBanner(
        `SALAH HITUNG! ${errorMessage || ''} Penalti +2 Kartu telah ditambahkan ke tanganmu.`,
        'error'
      );

      advanceTurn(updatedPlayers, currentDeck);
      return;
    }

    // PERFECT COMBO EXECUTION!
    sounds.playComboSuccess();
    setComboBurstTrigger(prev => prev + 1);
    triggerComboParticles('active-target-card-container');

    // Remove selected cards from hand
    const selectedIds = new Set(selectedCards.map(c => c.id));
    const newHand = currentPlayer.hand.filter(c => !selectedIds.has(c.id));

    // The top / last card in the combo becomes the new Active Target Card!
    const newTargetCard = selectedCards[selectedCards.length - 1];

    const updatedPlayer: Player = {
      ...currentPlayer,
      hand: newHand,
      score: (currentPlayer.score || 0) + 15 + (selectedCards.length * 5),
      combosCount: (currentPlayer.combosCount || 0) + 1,
      isMathOCalled: newHand.length === 1 ? currentPlayer.isMathOCalled : false,
    };

    const updatedPlayers = [...players];
    updatedPlayers[activePlayerIndex] = updatedPlayer;

    // Construct equation text
    let eqText = `${selectedCards[0].value}`;
    for (let i = 0; i < operators.length; i++) {
      eqText += ` ${operators[i]} ${selectedCards[i + 1].value}`;
    }
    eqText += ` = ${targetVal}`;

    const historyEntry: MoveHistoryItem = {
      id: `m_${Date.now()}`,
      playerName: currentPlayer.name,
      timestamp: new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      actionType: 'combo',
      cardsPlayed: selectedCards,
      equationText: eqText,
      targetValueBefore: targetVal,
      targetValueAfter: newTargetCard.value || targetVal,
      description: `✨ BERHASIL COMBO MATEMATIKA! [${eqText}]`,
      isCorrect: true,
    };

    setHistory([historyEntry, ...history]);
    setActiveTargetCard(newTargetCard);

    showBanner(
      `COMBO SANGAT HEBAT! ${currentPlayer.name} berhasil: ${eqText}`,
      'success'
    );

    if (newHand.length === 1) {
      sounds.playMathOAlert();
      showBanner(`${currentPlayer.name} menyisakan 1 kartu: "NUMERIX!"`, 'warning');
    }

    advanceTurn(updatedPlayers, deck);
  };

  // Draw Card
  const handleDrawCard = async () => {
    sounds.playDrawCard();
    let currentDeck = [...deck];

    if (currentDeck.length === 0) {
      currentDeck = generateDeck();
    }

    const drawnCard = currentDeck.shift()!;
    const currentPlayer = players[activePlayerIndex];

    const updatedPlayer: Player = {
      ...currentPlayer,
      hand: [...currentPlayer.hand, drawnCard],
    };

    const updatedPlayers = [...players];
    updatedPlayers[activePlayerIndex] = updatedPlayer;

    const historyEntry: MoveHistoryItem = {
      id: `m_${Date.now()}`,
      playerName: currentPlayer.name,
      timestamp: new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      actionType: 'draw',
      cardsPlayed: [],
      targetValueBefore:
        activeTargetCard?.type === 'number' ? activeTargetCard.value! : 0,
      targetValueAfter:
        activeTargetCard?.type === 'number' ? activeTargetCard.value! : 0,
      description: `Mengambil 1 kartu dari tumpukan`,
    };

    setHistory([historyEntry, ...history]);
    showBanner(`${currentPlayer.name} mengambil 1 kartu.`, 'info');

    advanceTurn(updatedPlayers, currentDeck);
  };

  // Call NUMERIX!
  const handleCallMathO = () => {
    sounds.playMathOAlert();
    const currentPlayer = players[activePlayerIndex];
    const updatedPlayer = { ...currentPlayer, isMathOCalled: true };
    const updatedPlayers = [...players];
    updatedPlayers[activePlayerIndex] = updatedPlayer;
    setPlayers(updatedPlayers);
    showBanner(`📣 ${currentPlayer.name} berteriak "NUMERIX!"`, 'warning');
  };

  // Request Hint from Pak GuruAI
  const handleRequestGuruHint = async () => {
    if (!activeTargetCard) return;
    setIsGuruHintOpen(true);
    setIsHintLoading(true);

    const currentPlayer = players[activePlayerIndex];
    const targetVal =
      activeTargetCard.type === 'number' ? activeTargetCard.value! : 0;

    try {
      const res = await fetch('/api/guru-hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetValue: targetVal,
          activeColor: activeTargetCard.color,
          handCards: currentPlayer.hand,
          playerName: currentPlayer.name,
        }),
      });

      const data = await res.json();
      setGuruHintText(data.hint || 'Kombinasikan dua kartu dengan operasi matematika yang pas!');
    } catch (err) {
      console.error(err);
      setGuruHintText(
        `Pak GuruAI: Cobalah kombinasikan dua kartu angkamu dengan operasi (+, -, x, /) agar hasilnya = ${targetVal}!`
      );
    } finally {
      setIsHintLoading(false);
    }
  };

  // Smart AI Engine Logic
  useEffect(() => {
    if (gameMode !== 'ai' || !activeTargetCard || winner) return;

    const currentPlayer = players[activePlayerIndex];

    if (currentPlayer && currentPlayer.isAI && !isAITurnRef.current) {
      isAITurnRef.current = true;

      const aiTimer = setTimeout(() => {
        const targetVal =
          activeTargetCard.type === 'number' ? activeTargetCard.value! : 0;

        // 1. First priority: Check if AI can play a COMBO!
        const comboSolution = findAIComboSolution(currentPlayer.hand, targetVal);

        if (comboSolution) {
          handleSubmitCombo(
            comboSolution.cards,
            comboSolution.operators,
            true
          );
        } else {
          // 2. Second priority: Single Card matching
          const playableSingle = currentPlayer.hand.find(card =>
            isValidSinglePlay(card, activeTargetCard)
          );

          if (playableSingle) {
            handlePlaySingleCard(playableSingle);
          } else {
            // 3. No move available -> Draw card
            handleDrawCard();
          }
        }

        isAITurnRef.current = false;
      }, 1400);

      return () => clearTimeout(aiTimer);
    }
  }, [activePlayerIndex, activeTargetCard, gameMode, winner]);

  const activePlayer = players[activePlayerIndex];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-900">
      {/* Game Top Header (In Game) */}
      {gameMode !== 'menu' && activePlayer && (
        <GameHeader
          mode={gameMode}
          currentTurnName={activePlayer.name}
          isAITurn={activePlayer.isAI}
          deckCount={deck.length}
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled(!soundEnabled)}
          onResetGame={() => {
            setGameMode('menu');
          }}
          onOpenPractice={() => setIsPracticeOpen(true)}
          onOpenScoreboard={() => setIsScoreboardOpen(true)}
        />
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-3 sm:p-6 flex flex-col justify-between">
        {/* Banner Toast Notification */}
        {notification && (
          <div
            className={`fixed top-16 left-1/2 -translate-x-1/2 z-50 max-w-md w-full px-4 py-3 rounded-2xl shadow-2xl border text-xs sm:text-sm font-extrabold flex items-center justify-between animate-in slide-in-from-top-4 duration-300 ${
              notification.type === 'error'
                ? 'bg-rose-600 text-white border-rose-700'
                : notification.type === 'success'
                ? 'bg-emerald-600 text-white border-emerald-700'
                : notification.type === 'warning'
                ? 'bg-amber-500 text-slate-950 border-amber-600'
                : 'bg-indigo-600 text-white border-indigo-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="ml-2 font-bold opacity-80 hover:opacity-100"
            >
              ×
            </button>
          </div>
        )}

        {/* MODE SELECTOR MAIN MENU SCREEN */}
        {gameMode === 'menu' && (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-6 px-3 sm:px-4 relative overflow-hidden">
            {/* Background Glow Effects */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-emerald-600/15 rounded-full blur-[100px] pointer-events-none" />

            {/* Hero Main Wrapper */}
            <div className="max-w-5xl w-full mx-auto relative z-10">
              {/* Header Title Banner */}
              <div className="bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 mb-6 shadow-2xl relative overflow-hidden text-center">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60" />
                
                <div className="flex justify-center items-center mb-4">
                  <motion.div
                    whileHover={{ scale: 1.05, rotate: 3 }}
                    className="relative w-20 h-20 bg-slate-950 ring-2 ring-purple-500/40 rounded-3xl flex items-center justify-center shadow-2xl overflow-hidden gap-1"
                  >
                    <span className="text-4xl font-black text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.7)] tracking-tighter">√</span>
                    <span className="text-4xl font-black text-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.7)] tracking-tighter">π</span>
                  </motion.div>
                </div>

                <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tighter mb-2 leading-tight flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
                  <span>NUMERIX</span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-purple-400 drop-shadow-sm">
                    MATH CLASH
                  </span>
                </h1>
                <p className="text-xs sm:text-base text-slate-300 font-medium leading-relaxed max-w-2xl mx-auto">
                  Adu cepat perhitungan, racik <span className="font-bold text-cyan-300">Combo Matematika</span>, dan jadilah juara di arena strategi angka oleh <span className="font-extrabold text-amber-400">Pak GuruAI</span>!
                </p>
              </div>

              {/* 2 Interactive Animated Game Mode Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 text-left">
                
                {/* 1. Singleplayer Mode Card */}
                <div
                  id="btn-mode-ai"
                  className="bg-slate-900/80 backdrop-blur-xl border border-purple-500/40 hover:border-purple-400 rounded-3xl p-5 sm:p-6 shadow-[0_0_30px_rgba(168,85,247,0.15)] hover:shadow-[0_0_40px_rgba(168,85,247,0.25)] transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all duration-500 -mr-10 -mt-10" />

                  <div>
                    {/* Header Badge */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-purple-500/20 rounded-xl group-hover:scale-110 transition-transform">
                          <Bot className="w-5 h-5 text-purple-300" />
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-white group-hover:text-purple-200 transition-colors">
                            Singleplayer AI
                          </h3>
                          <p className="text-[11px] text-purple-200/70 font-medium">
                            Lawan Pak GuruAI Bot
                          </p>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono font-bold text-purple-300 bg-purple-950/90 border border-purple-500/40 px-2.5 py-1 rounded-full uppercase tracking-wider">
                        MODERAT / SOLO
                      </span>
                    </div>

                    {/* Animated Visual Component */}
                    <SingleplayerGraphic
                      aiLevel={aiLevel}
                      onSelectAiLevel={setAiLevel}
                    />
                  </div>

                  {/* Play Action Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => startNewGame('ai')}
                    className="w-full mt-3 py-3 px-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg border border-purple-400/40 flex items-center justify-center gap-2 cursor-pointer transition"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>MULAI TANTANGAN AI</span>
                    <ChevronRight className="w-4 h-4 text-purple-200" />
                  </motion.button>
                </div>

                {/* 2. Pass & Play Mode Card */}
                <div
                  id="btn-mode-multiplayer"
                  className="bg-slate-900/80 backdrop-blur-xl border border-emerald-500/40 hover:border-emerald-400 rounded-3xl p-5 sm:p-6 shadow-[0_0_30px_rgba(16,185,129,0.15)] hover:shadow-[0_0_40px_rgba(16,185,129,0.25)] transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all duration-500 -mr-10 -mt-10" />

                  <div>
                    {/* Header Badge */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-emerald-500/20 rounded-xl group-hover:scale-110 transition-transform">
                          <Users className="w-5 h-5 text-emerald-300" />
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-white group-hover:text-emerald-200 transition-colors">
                            Pass & Play
                          </h3>
                          <p className="text-[11px] text-emerald-200/70 font-medium">
                            Duel Lokal 1 Perangkat
                          </p>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono font-bold text-emerald-300 bg-emerald-950/90 border border-emerald-500/40 px-2.5 py-1 rounded-full uppercase tracking-wider">
                        LOKAL 2-4 PEMAIN
                      </span>
                    </div>

                    {/* Animated Visual Component */}
                    <PassAndPlayGraphic
                      numPlayers={numPlayers}
                      onSelectNumPlayers={setNumPlayers}
                    />
                  </div>

                  {/* Play Action Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => startNewGame('multiplayer')}
                    className="w-full mt-3 py-3 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg border border-emerald-400/40 flex items-center justify-center gap-2 cursor-pointer transition"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>MULAI DUEL LOKAL ({numPlayers} PEMAIN)</span>
                    <ChevronRight className="w-4 h-4 text-emerald-200" />
                  </motion.button>
                </div>

              </div>

              {/* Bottom Quick Links */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => setIsTutorialOpen(true)}
                  className="text-xs font-bold text-cyan-300 hover:text-cyan-200 bg-cyan-500/10 hover:bg-cyan-500/20 px-4 py-2.5 rounded-full transition border border-cyan-500/30 flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <HelpCircle className="w-4 h-4 text-cyan-400" />
                  <span>Tutorial Cara Bermain</span>
                </button>

                <button
                  onClick={() => setIsPracticeOpen(true)}
                  className="text-xs font-bold text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 px-4 py-2.5 rounded-full transition border border-amber-500/30 flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Calculator className="w-4 h-4 text-amber-400" />
                  <span>Mode Latihan Combo Bebas</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ACTIVE GAMEPLAY PLAYING VIEW */}
        {gameMode !== 'menu' && activeTargetCard && activePlayer && (
          <div className="flex-1 flex flex-col gap-4 my-2">
            {/* Top Table Arena: Center Target Card & Draw Pile */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              {/* Opponent Info / AI Status */}
              <div className="bg-slate-800/90 backdrop-blur-md rounded-2xl p-4 border border-slate-700 flex flex-col justify-between min-h-[140px]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Lawan di Meja
                  </span>
                  <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full font-bold">
                    {players.length - 1} Lawan
                  </span>
                </div>

                <div className="space-y-2">
                  {players.map((p, idx) => {
                    if (idx === activePlayerIndex) return null;
                    return (
                      <div
                        key={p.id}
                        className="flex items-center justify-between bg-slate-900/60 p-2 rounded-xl border border-slate-800"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{p.avatar}</span>
                          <span className="text-xs font-bold text-slate-200">
                            {p.name}
                          </span>
                        </div>
                        <span className="text-xs font-black text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded-lg border border-amber-800">
                          {p.hand.length} Kartu
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Central Target Card */}
              <ActiveTargetCard
                card={activeTargetCard}
                onOpenComboModal={() => setIsComboModalOpen(true)}
                onRequestHint={handleRequestGuruHint}
                canCombo={!activePlayer.isAI}
                comboBurstTrigger={comboBurstTrigger}
              />

              {/* Draw Pile & Pass Control */}
              <div className="bg-slate-800/90 backdrop-blur-md rounded-2xl p-4 border border-slate-700 flex flex-col items-center justify-between min-h-[140px] text-center">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span>Tumpukan Kartu Deck</span>
                </div>

                <button
                  onClick={handleDrawCard}
                  disabled={activePlayer.isAI}
                  id="btn-draw-card"
                  className={`w-24 h-32 bg-gradient-to-br from-indigo-700 to-purple-800 hover:from-indigo-600 hover:to-purple-700 rounded-2xl border-2 border-indigo-400 shadow-xl flex flex-col items-center justify-center gap-1 cursor-pointer transition active:scale-95 ${
                    activePlayer.isAI ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                >
                  <span className="text-2xl">🃏</span>
                  <span className="text-xs font-black text-white">AMBIL</span>
                  <span className="text-[10px] text-indigo-200 font-bold">
                    ({deck.length})
                  </span>
                </button>

                <p className="text-[10px] text-slate-400">
                  Klik untuk ambil 1 kartu jika tidak bisa jalan
                </p>
              </div>
            </div>

            {/* Animated Turn Change Banner Badge */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`turn-alert-${activePlayerIndex}-${activePlayer.id}`}
                initial={{ opacity: 0, scale: 0.9, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="flex items-center justify-between bg-slate-900/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-cyan-500/30 shadow-lg text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl p-1 bg-slate-800 rounded-xl border border-slate-700 shadow-xs">
                    {activePlayer.avatar}
                  </span>
                  <div>
                    <div className="flex items-center gap-1.5 font-black text-white">
                      <span>Giliran Aktif:</span>
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-black ${activePlayer.colorTheme}`}>
                        {activePlayer.name}
                      </span>
                      {activePlayer.isAI && (
                        <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-500/50 px-1.5 py-0.5 rounded font-mono font-bold animate-pulse">
                          🤖 BOT AI
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {activePlayer.isAI
                        ? 'Pak GuruAI sedang menghitung strategi angka...'
                        : 'Mainkan kartu yang sesuai atau rangkai Combo Matematika!'}
                    </p>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-1.5 font-extrabold text-amber-400 bg-amber-950/70 px-3 py-1 rounded-xl border border-amber-500/30">
                  <Zap className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                  <span>{activePlayer.hand.length} Kartu</span>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Active Player Hand Area with Animated Slide & Scale Transition */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`player-hand-wrapper-${activePlayer.id}-${activePlayerIndex}`}
                initial={{ opacity: 0, scale: 0.94, x: 25 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.94, x: -25 }}
                transition={{ type: 'spring', stiffness: 350, damping: 26 }}
                className="w-full"
              >
                <PlayerHand
                  player={activePlayer}
                  activeTargetCard={activeTargetCard}
                  isCurrentTurn={!activePlayer.isAI}
                  onPlaySingleCard={handlePlaySingleCard}
                  onCallMathO={handleCallMathO}
                />
              </motion.div>
            </AnimatePresence>

            {/* Recent History Feed */}
            <HistoryLog history={history} />
          </div>
        )}

        {/* WINNER CONGRATULATIONS MODAL */}
        {winner && (
          <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
            <div id="winner-modal" className="bg-white rounded-3xl max-w-md w-full p-6 text-center text-slate-900 shadow-2xl border border-amber-300 relative overflow-hidden">
              <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-4 shadow-inner">
                🏆
              </div>

              <span className="text-xs font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                Pemenang NUMERIX!
              </span>

              <h2 className="text-2xl sm:text-3xl font-black mt-2 mb-1">
                Selamat, {winner.name}!
              </h2>

              <p className="text-xs text-slate-600 mb-6 font-medium">
                Berhasil menghabiskan seluruh kartu di tangan dan memenangkan game!
              </p>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left mb-6 text-xs space-y-1">
                <p className="font-bold text-slate-700">Statistik Permainan:</p>
                <p className="text-slate-600">• Mode: {gameMode === 'ai' ? 'Lawan AI' : 'Multiplayer'}</p>
                <p className="text-slate-600">• Total Langkah Dimainkan: {history.length}</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => startNewGame(gameMode)}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm rounded-xl cursor-pointer shadow-md transition"
                >
                  Main Lagi
                </button>
                <button
                  onClick={() => setGameMode('menu')}
                  className="px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs sm:text-sm rounded-xl cursor-pointer transition"
                >
                  Menu Utama
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODALS */}
        <ScoreboardModal
          isOpen={isScoreboardOpen}
          onClose={() => setIsScoreboardOpen(false)}
          players={players}
          currentGameRound={currentGameRound}
        />

        <ComboBuilderModal
          isOpen={isComboModalOpen}
          onClose={() => setIsComboModalOpen(false)}
          hand={activePlayer?.hand || []}
          targetValue={
            activeTargetCard?.type === 'number' ? activeTargetCard.value! : 0
          }
          onSubmitCombo={handleSubmitCombo}
        />

        <GuruHintModal
          isOpen={isGuruHintOpen}
          onClose={() => setIsGuruHintOpen(false)}
          hintText={guruHintText}
          isLoading={isHintLoading}
          playerName={activePlayer?.name || 'Pemain'}
          targetValue={
            activeTargetCard?.type === 'number' ? activeTargetCard.value! : 0
          }
          targetColor={activeTargetCard?.color || 'Merah'}
        />

        <TutorialModal
          isOpen={isTutorialOpen}
          onClose={() => setIsTutorialOpen(false)}
        />

        {isPassScreenOpen && (
          <PassAndPlayOverlay
            nextPlayerName={activePlayer?.name || 'Pemain'}
            nextPlayerAvatar={activePlayer?.avatar || '🎮'}
            onReady={() => setIsPassScreenOpen(false)}
          />
        )}

        <PracticeSandbox
          isOpen={isPracticeOpen}
          onClose={() => setIsPracticeOpen(false)}
        />
      </main>

      {/* MANDATORY FOOTER CONTAINING @copyright Pak GuruAI */}
      <Footer />
    </div>
  );
}
