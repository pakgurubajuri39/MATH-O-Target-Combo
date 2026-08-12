import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini API client
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

// In-memory Room State Store for Room Code Multiplayer
interface RoomPlayer {
  id: string;
  name: string;
  hand: any[];
  isAI: boolean;
  score: number;
  combosCount: number;
  isMathOCalled: boolean;
  avatar: string;
  colorTheme: string;
}

interface RoomState {
  code: string;
  hostPlayerId: string;
  maxPlayers: number;
  status: 'waiting' | 'playing' | 'finished';
  players: RoomPlayer[];
  deck: any[];
  activeTargetCard: any | null;
  activePlayerIndex: number;
  direction: number;
  history: any[];
  winner: RoomPlayer | null;
  lastUpdated: number;
}

const rooms: Record<string, RoomState> = {};

// Clean up stale rooms older than 2 hours
setInterval(() => {
  const now = Date.now();
  Object.keys(rooms).forEach(code => {
    if (now - rooms[code].lastUpdated > 2 * 60 * 60 * 1000) {
      delete rooms[code];
    }
  });
}, 15 * 60 * 1000);

// Helper to generate 4-digit numeric room code
function generateRoomCode(): string {
  let code = '';
  do {
    code = Math.floor(1000 + Math.random() * 9000).toString();
  } while (rooms[code]);
  return code;
}

// Helper to shuffle card deck server-side
function createShuffledDeck() {
  const colors = ['Merah', 'Biru', 'Hijau', 'Kuning'];
  const deck: any[] = [];
  const sessionNonce = Math.random().toString(36).substring(2, 8);
  let idCounter = 1;

  colors.forEach(color => {
    deck.push({ id: `c_${sessionNonce}_${idCounter++}`, color, type: 'number', value: 0, label: '0' });
    for (let val = 1; val <= 9; val++) {
      for (let count = 0; count < 2; count++) {
        deck.push({ id: `c_${sessionNonce}_${idCounter++}`, color, type: 'number', value: val, label: `${val}` });
      }
    }
    for (let count = 0; count < 2; count++) {
      deck.push({ id: `c_${sessionNonce}_${idCounter++}`, color, type: '+2', label: '+2' });
      deck.push({ id: `c_${sessionNonce}_${idCounter++}`, color, type: 'skip', label: 'SKIP' });
      deck.push({ id: `c_${sessionNonce}_${idCounter++}`, color, type: 'reverse', label: 'REV' });
    }
  });

  for (let i = 0; i < 4; i++) {
    deck.push({ id: `c_${sessionNonce}_${idCounter++}`, color: 'Wild', type: 'wild_operator', label: 'WILD' });
  }

  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

// Create Room Endpoint
app.post("/api/rooms/create", (req, res) => {
  const { hostName, maxPlayers = 4 } = req.body;
  if (!hostName) {
    return res.status(400).json({ error: "Nama pembuat ruang wajib diisi." });
  }

  const roomCode = generateRoomCode();
  const hostId = `player_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const avatars = ['🎮', '🎯', '🚀', '⭐'];
  const colorThemes = ['bg-emerald-600', 'bg-blue-600', 'bg-purple-600', 'bg-rose-600'];

  const hostPlayer: RoomPlayer = {
    id: hostId,
    name: hostName,
    hand: [],
    isAI: false,
    score: 0,
    combosCount: 0,
    isMathOCalled: false,
    avatar: avatars[0],
    colorTheme: colorThemes[0],
  };

  rooms[roomCode] = {
    code: roomCode,
    hostPlayerId: hostId,
    maxPlayers: Math.min(Math.max(2, maxPlayers), 4),
    status: 'waiting',
    players: [hostPlayer],
    deck: [],
    activeTargetCard: null,
    activePlayerIndex: 0,
    direction: 1,
    history: [],
    winner: null,
    lastUpdated: Date.now(),
  };

  return res.json({
    success: true,
    roomCode,
    playerId: hostId,
    roomState: rooms[roomCode],
  });
});

// Join Room Endpoint
app.post("/api/rooms/join", (req, res) => {
  const { roomCode, playerName } = req.body;
  if (!roomCode || !playerName) {
    return res.status(400).json({ error: "Kode Ruang dan Nama Pemain wajib diisi." });
  }

  const cleanCode = String(roomCode).trim().toUpperCase();
  const room = rooms[cleanCode];

  if (!room) {
    return res.status(404).json({ error: `Ruang dengan Kode [${cleanCode}] tidak ditemukan! Periksa kembali kodenya.` });
  }

  if (room.status !== 'waiting' && !room.players.some(p => p.name.toLowerCase() === playerName.toLowerCase())) {
    return res.status(400).json({ error: "Permainan di ruang ini sudah berjalan atau selesai." });
  }

  // Re-join existing player if name matches
  const existingPlayer = room.players.find(p => p.name.toLowerCase() === playerName.toLowerCase());
  if (existingPlayer) {
    return res.json({
      success: true,
      playerId: existingPlayer.id,
      roomState: room,
    });
  }

  if (room.players.length >= room.maxPlayers) {
    return res.status(400).json({ error: "Ruang permainan sudah penuh!" });
  }

  const newPlayerId = `player_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const avatars = ['🎮', '🎯', '🚀', '⭐'];
  const colorThemes = ['bg-emerald-600', 'bg-blue-600', 'bg-purple-600', 'bg-rose-600'];
  const idx = room.players.length;

  const newPlayer: RoomPlayer = {
    id: newPlayerId,
    name: playerName,
    hand: [],
    isAI: false,
    score: 0,
    combosCount: 0,
    isMathOCalled: false,
    avatar: avatars[idx % avatars.length],
    colorTheme: colorThemes[idx % colorThemes.length],
  };

  room.players.push(newPlayer);
  room.lastUpdated = Date.now();

  return res.json({
    success: true,
    playerId: newPlayerId,
    roomState: room,
  });
});

// Get Room State Endpoint
app.get("/api/rooms/:code", (req, res) => {
  const roomCode = req.params.code.trim().toUpperCase();
  const room = rooms[roomCode];

  if (!room) {
    return res.status(404).json({ error: "Ruang permainan tidak ditemukan." });
  }

  return res.json({
    success: true,
    roomState: room,
  });
});

// Start Game in Room Endpoint
app.post("/api/rooms/:code/start", (req, res) => {
  const roomCode = req.params.code.trim().toUpperCase();
  const { playerId } = req.body;
  const room = rooms[roomCode];

  if (!room) return res.status(404).json({ error: "Ruang tidak ditemukan." });
  if (room.hostPlayerId !== playerId) {
    return res.status(403).json({ error: "Hanya pembuat ruang (Host) yang dapat memulai permainan!" });
  }

  if (room.players.length < 2) {
    return res.status(400).json({ error: "Minimal 2 pemain dibutuhkan untuk memulai." });
  }

  const fullDeck = createShuffledDeck();

  // Deal 7 cards per player
  room.players.forEach((p, idx) => {
    p.hand = fullDeck.slice(idx * 7, (idx + 1) * 7);
    p.isMathOCalled = false;
  });

  const remainingDeck = fullDeck.slice(room.players.length * 7);

  let targetIdx = 0;
  while (targetIdx < remainingDeck.length && remainingDeck[targetIdx].type !== 'number') {
    targetIdx++;
  }

  room.activeTargetCard = remainingDeck[targetIdx] || remainingDeck[0];
  room.deck = remainingDeck.filter((_, idx) => idx !== targetIdx);
  room.status = 'playing';
  room.activePlayerIndex = 0;
  room.direction = 1;
  room.winner = null;
  room.history = [{
    id: `m_${Date.now()}`,
    playerName: 'Sistem',
    timestamp: new Date().toLocaleTimeString('id-ID'),
    actionType: 'single',
    cardsPlayed: [room.activeTargetCard],
    targetValueBefore: room.activeTargetCard.value || 0,
    targetValueAfter: room.activeTargetCard.value || 0,
    description: `Permainan Dimulai! Target Meja: ${room.activeTargetCard.color} ${room.activeTargetCard.value}`,
  }];
  room.lastUpdated = Date.now();

  return res.json({ success: true, roomState: room });
});

// Execute Room Player Action Endpoint
app.post("/api/rooms/:code/action", (req, res) => {
  const roomCode = req.params.code.trim().toUpperCase();
  const { playerId, actionType, card, comboCards, comboOperators, isComboCorrect, comboErrorMsg } = req.body;
  const room = rooms[roomCode];

  if (!room) return res.status(404).json({ error: "Ruang tidak ditemukan." });
  if (room.status !== 'playing') return res.status(400).json({ error: "Permainan tidak sedang berjalan." });

  const activeP = room.players[room.activePlayerIndex];
  if (activeP.id !== playerId) {
    return res.status(400).json({ error: "Bukan giliran Anda!" });
  }

  room.lastUpdated = Date.now();

  if (actionType === 'single' && card) {
    // Single play
    activeP.hand = activeP.hand.filter(c => c.id !== card.id);
    activeP.score += 5;

    const oldVal = room.activeTargetCard?.value || 0;
    room.activeTargetCard = card;

    let skipCount = 1;
    if (card.type === '+2') {
      const nextIdx = (room.activePlayerIndex + room.direction + room.players.length) % room.players.length;
      const targetP = room.players[nextIdx];
      let penaltyCards = [];
      for (let i = 0; i < 2; i++) {
        if (room.deck.length === 0) room.deck = createShuffledDeck();
        penaltyCards.push(room.deck.shift());
      }
      targetP.hand.push(...penaltyCards);
      skipCount = 2;
    } else if (card.type === 'skip') {
      skipCount = 2;
    } else if (card.type === 'reverse') {
      room.direction = -room.direction;
    }

    room.history.unshift({
      id: `m_${Date.now()}`,
      playerName: activeP.name,
      timestamp: new Date().toLocaleTimeString('id-ID'),
      actionType: 'single',
      cardsPlayed: [card],
      targetValueBefore: oldVal,
      targetValueAfter: card.value || oldVal,
      description: `${activeP.name} menurunkan kartu Single ${card.color} ${card.value !== undefined ? card.value : card.label}`,
    });

    if (activeP.hand.length === 0) {
      room.status = 'finished';
      room.winner = activeP;
      activeP.score += 50;
    } else {
      room.activePlayerIndex = (room.activePlayerIndex + room.direction * skipCount + room.players.length) % room.players.length;
    }

    return res.json({ success: true, roomState: room });
  }

  if (actionType === 'combo' && comboCards && comboCards.length >= 2) {
    if (!isComboCorrect) {
      // Incorrect combo -> penalty +2
      let penaltyCards = [];
      for (let i = 0; i < 2; i++) {
        if (room.deck.length === 0) room.deck = createShuffledDeck();
        penaltyCards.push(room.deck.shift());
      }
      activeP.hand.push(...penaltyCards);

      room.history.unshift({
        id: `m_${Date.now()}`,
        playerName: activeP.name,
        timestamp: new Date().toLocaleTimeString('id-ID'),
        actionType: 'penalty',
        cardsPlayed: comboCards,
        targetValueBefore: room.activeTargetCard?.value || 0,
        targetValueAfter: room.activeTargetCard?.value || 0,
        description: `❌ ${activeP.name} salah hitung Combo! Penalti +2 kartu. ${comboErrorMsg || ''}`,
      });

      room.activePlayerIndex = (room.activePlayerIndex + room.direction + room.players.length) % room.players.length;
      return res.json({ success: true, roomState: room });
    }

    // Correct Combo
    const comboIds = new Set(comboCards.map((c: any) => c.id));
    activeP.hand = activeP.hand.filter(c => !comboIds.has(c.id));
    activeP.score += 15 + (comboCards.length * 5);
    activeP.combosCount += 1;

    const newTarget = comboCards[comboCards.length - 1];
    const oldVal = room.activeTargetCard?.value || 0;
    room.activeTargetCard = newTarget;

    let eqText = `${comboCards[0].value}`;
    if (comboOperators) {
      for (let i = 0; i < comboOperators.length; i++) {
        eqText += ` ${comboOperators[i]} ${comboCards[i + 1].value}`;
      }
    }
    eqText += ` = ${oldVal}`;

    room.history.unshift({
      id: `m_${Date.now()}`,
      playerName: activeP.name,
      timestamp: new Date().toLocaleTimeString('id-ID'),
      actionType: 'combo',
      cardsPlayed: comboCards,
      equationText: eqText,
      targetValueBefore: oldVal,
      targetValueAfter: newTarget.value || oldVal,
      description: `✨ ${activeP.name} BERHASIL COMBO! [${eqText}]`,
    });

    if (activeP.hand.length === 0) {
      room.status = 'finished';
      room.winner = activeP;
      activeP.score += 50;
    } else {
      room.activePlayerIndex = (room.activePlayerIndex + room.direction + room.players.length) % room.players.length;
    }

    return res.json({ success: true, roomState: room });
  }

  if (actionType === 'draw') {
    if (room.deck.length === 0) room.deck = createShuffledDeck();
    const drawnCard = room.deck.shift();
    activeP.hand.push(drawnCard);

    room.history.unshift({
      id: `m_${Date.now()}`,
      playerName: activeP.name,
      timestamp: new Date().toLocaleTimeString('id-ID'),
      actionType: 'draw',
      cardsPlayed: [],
      targetValueBefore: room.activeTargetCard?.value || 0,
      targetValueAfter: room.activeTargetCard?.value || 0,
      description: `${activeP.name} mengambil 1 kartu dari tumpukan`,
    });

    room.activePlayerIndex = (room.activePlayerIndex + room.direction + room.players.length) % room.players.length;
    return res.json({ success: true, roomState: room });
  }

  if (actionType === 'math_o') {
    activeP.isMathOCalled = true;
    return res.json({ success: true, roomState: room });
  }

  return res.status(400).json({ error: "Aksi tidak valid." });
});


// API Route for Pak GuruAI Hint & Encouragement
app.post("/api/guru-hint", async (req, res) => {
  try {
    const { targetValue, handCards, activeColor, playerName } = req.body;
    const ai = getGenAI();

    if (!ai) {
      // Fallback local heuristic response if no GEMINI_API_KEY is configured
      return res.json({
        success: true,
        hint: `Pak GuruAI (Modus Standar): Cari kartu di tanganmu yang jika dijumlahkan, dikurangi, dikali, atau dibagi menghasilkan target ${targetValue}! Atau turunkan kartu berwarna ${activeColor}.`,
        source: "local"
      });
    }

    const cardsText = handCards
      .map((c: any) => `${c.color} ${c.value !== undefined ? c.value : c.type}`)
      .join(", ");

    const prompt = `Kamu adalah Pak GuruAI, seorang guru matematika yang sangat ramah, suportif, dan edukatif dalam permainan kartu "MATH-O! Target Combo".
Pemain saat ini: ${playerName || 'Pemain'}.
Kartu Target Aktif saat ini: Nilai = ${targetValue}, Warna = ${activeColor}.
Kartu di tangan pemain: [${cardsText}].

Tugasmu:
1. Berikan petunjuk matematika singkat (1-2 kalimat) yang membantu pemain mencari kemungkinan Combo (misal: mencari 2 kartu yang jika ditambah/dikurang/dikali/dibagi menghasilkan ${targetValue}).
2. Jika ada kartu yang sama warna atau angka untuk Single Play, sebutkan sebagai alternatif.
3. Berikan kata-kata semangat yang membakar semangat belajar matematika!
Gunakan bahasa Indonesia yang santun, ceria, dan penuh dorongan positif.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const replyText = response.text || "Tetap semangat! Periksa kombinasi angkamu untuk mencocokkan target!";
    
    return res.json({
      success: true,
      hint: replyText,
      source: "gemini"
    });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return res.json({
      success: true,
      hint: `Pak GuruAI: Cobalah kombinasikan dua kartu angkamu dengan operasi (+, -, x, /) agar hasil hitungannya tepat sama dengan Target ${req.body?.targetValue || 'meja'}!`,
      source: "fallback"
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server MATH-O! Target Combo running on http://localhost:${PORT}`);
  });
}

startServer();
