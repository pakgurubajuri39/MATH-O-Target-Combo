export type CardColor = 'Merah' | 'Biru' | 'Hijau' | 'Kuning' | 'Wild';

export type CardType = 'number' | '+2' | 'skip' | 'reverse' | 'wild_operator';

export type MathOperator = '+' | '-' | '×' | '÷';

export interface Card {
  id: string;
  color: CardColor;
  type: CardType;
  value?: number; // 0-9 for number cards
  label?: string; // "+2", "SKIP", "REV", "WILD"
}

export type GameMode = 'menu' | 'ai' | 'multiplayer' | 'practice';

export interface Player {
  id: string;
  name: string;
  isAI: boolean;
  hand: Card[];
  isMathOCalled: boolean;
  avatar: string;
  colorTheme: string;
}

export interface MoveHistoryItem {
  id: string;
  playerName: string;
  timestamp: string;
  actionType: 'single' | 'combo' | 'draw' | 'action' | 'penalty';
  cardsPlayed: Card[];
  equationText?: string;
  targetValueBefore: number;
  targetValueAfter: number;
  description: string;
  isCorrect?: boolean;
}

export interface ComboAttempt {
  cards: Card[];
  operators: MathOperator[];
  equationDisplay: string;
  calculatedValue: number | null;
  isValid: boolean;
  errorMessage?: string;
}

export type AILevel = 'mudah' | 'sedang' | 'jenius';

export interface GameSettings {
  mode: GameMode;
  numPlayers: number;
  aiLevel: AILevel;
  soundEnabled: boolean;
  privacyPassMode: boolean; // Hide hand between players in local multiplayer
}
