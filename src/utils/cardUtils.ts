import { Card, CardColor, MathOperator, ComboAttempt } from '../types';

const COLORS: CardColor[] = ['Merah', 'Biru', 'Hijau', 'Kuning'];

export function generateDeck(): Card[] {
  const deck: Card[] = [];
  const sessionNonce = Math.random().toString(36).substring(2, 8);
  let idCounter = 1;

  COLORS.forEach(color => {
    // 0 appears once per color
    deck.push({
      id: `card_${sessionNonce}_${idCounter++}`,
      color,
      type: 'number',
      value: 0,
      label: '0'
    });

    // 1-9 appear twice per color
    for (let val = 1; val <= 9; val++) {
      for (let count = 0; count < 2; count++) {
        deck.push({
          id: `card_${sessionNonce}_${idCounter++}`,
          color,
          type: 'number',
          value: val,
          label: `${val}`
        });
      }
    }

    // Action cards per color (+2, Skip, Reverse)
    for (let count = 0; count < 2; count++) {
      deck.push({
        id: `card_${sessionNonce}_${idCounter++}`,
        color,
        type: '+2',
        label: '+2'
      });
      deck.push({
        id: `card_${sessionNonce}_${idCounter++}`,
        color,
        type: 'skip',
        label: 'SKIP'
      });
      deck.push({
        id: `card_${sessionNonce}_${idCounter++}`,
        color,
        type: 'reverse',
        label: 'REV'
      });
    }
  });

  // Wild Operator cards (4 total)
  for (let i = 0; i < 4; i++) {
    deck.push({
      id: `card_${sessionNonce}_${idCounter++}`,
      color: 'Wild',
      type: 'wild_operator',
      label: 'WILD'
    });
  }

  return shuffleDeck(deck);
}

export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function isValidSinglePlay(card: Card, activeTarget: Card): boolean {
  // Wild card can always be played
  if (card.color === 'Wild') return true;

  // Same color
  if (card.color === activeTarget.color) return true;

  // Same number value
  if (
    card.type === 'number' &&
    activeTarget.type === 'number' &&
    card.value !== undefined &&
    card.value === activeTarget.value
  ) {
    return true;
  }

  // Same action card type
  if (card.type !== 'number' && card.type === activeTarget.type) {
    return true;
  }

  return false;
}

/**
 * Calculates result of a mathematical expression built from cards & operators.
 * E.g., cards [8, 2], operator ['-'] => 8 - 2 = 6
 * E.g., cards [2, 3, 4], operators ['×', '+'] => (2 × 3) + 4 = 10
 */
export function evaluateCombo(cards: Card[], operators: MathOperator[]): ComboAttempt {
  if (cards.length < 2) {
    return {
      cards,
      operators,
      equationDisplay: '',
      calculatedValue: null,
      isValid: false,
      errorMessage: 'Combo membutuhkan minimal 2 kartu angka.'
    };
  }

  if (operators.length !== cards.length - 1) {
    return {
      cards,
      operators,
      equationDisplay: '',
      calculatedValue: null,
      isValid: false,
      errorMessage: 'Jumlah operator matematika tidak sesuai dengan jumlah kartu.'
    };
  }

  // Check all cards are number cards (or Wild Operator acting as number if value given)
  for (const card of cards) {
    if (card.type !== 'number' && card.value === undefined) {
      return {
        cards,
        operators,
        equationDisplay: '',
        calculatedValue: null,
        isValid: false,
        errorMessage: 'Semua kartu dalam Combo harus memiliki nilai angka.'
      };
    }
  }

  let currentValue = cards[0].value!;
  let equationDisplay = `${cards[0].value}`;

  for (let i = 0; i < operators.length; i++) {
    const op = operators[i];
    const nextVal = cards[i + 1].value!;

    equationDisplay += ` ${op} ${nextVal}`;

    switch (op) {
      case '+':
        currentValue = currentValue + nextVal;
        break;
      case '-':
        currentValue = currentValue - nextVal;
        break;
      case '×':
        currentValue = currentValue * nextVal;
        break;
      case '÷':
        if (nextVal === 0) {
          return {
            cards,
            operators,
            equationDisplay: `${equationDisplay} = Error`,
            calculatedValue: null,
            isValid: false,
            errorMessage: 'Pembagian dengan angka nol (0) tidak diperbolehkan!'
          };
        }
        currentValue = currentValue / nextVal;
        break;
    }
  }

  // Check if result is integer
  if (!Number.isInteger(currentValue)) {
    return {
      cards,
      operators,
      equationDisplay: `${equationDisplay} = ${currentValue.toFixed(2)}`,
      calculatedValue: currentValue,
      isValid: false,
      errorMessage: 'Hasil operasi pembagian harus merupakan bilangan bulat!'
    };
  }

  return {
    cards,
    operators,
    equationDisplay: `${equationDisplay} = ${currentValue}`,
    calculatedValue: currentValue,
    isValid: true
  };
}

/**
 * Searches AI's hand for any pair/triplet combo that equals targetValue.
 */
export function findAIComboSolution(
  hand: Card[],
  targetValue: number
): { cards: Card[]; operators: MathOperator[]; equation: string } | null {
  const numberCards = hand.filter(c => c.type === 'number' && c.value !== undefined);
  if (numberCards.length < 2) return null;

  const operators: MathOperator[] = ['+', '-', '×', '÷'];

  // Try 2-card combos
  for (let i = 0; i < numberCards.length; i++) {
    for (let j = 0; j < numberCards.length; j++) {
      if (i === j) continue;
      const cardA = numberCards[i];
      const cardB = numberCards[j];

      for (const op of operators) {
        const attempt = evaluateCombo([cardA, cardB], [op]);
        if (attempt.isValid && attempt.calculatedValue === targetValue) {
          return {
            cards: [cardA, cardB],
            operators: [op],
            equation: attempt.equationDisplay
          };
        }
      }
    }
  }

  // Try 3-card combos if available
  if (numberCards.length >= 3) {
    for (let i = 0; i < numberCards.length; i++) {
      for (let j = 0; j < numberCards.length; j++) {
        if (i === j) continue;
        for (let k = 0; k < numberCards.length; k++) {
          if (i === k || j === k) continue;

          const cardA = numberCards[i];
          const cardB = numberCards[j];
          const cardC = numberCards[k];

          for (const op1 of operators) {
            for (const op2 of operators) {
              const attempt = evaluateCombo([cardA, cardB, cardC], [op1, op2]);
              if (attempt.isValid && attempt.calculatedValue === targetValue) {
                return {
                  cards: [cardA, cardB, cardC],
                  operators: [op1, op2],
                  equation: attempt.equationDisplay
                };
              }
            }
          }
        }
      }
    }
  }

  return null;
}

export function getColorBgClass(color: CardColor): string {
  switch (color) {
    case 'Merah':
      return 'bg-gradient-to-b from-red-500 via-red-600 to-red-800 text-white border-red-400/50 shadow-red-950/40';
    case 'Biru':
      return 'bg-gradient-to-b from-sky-500 via-blue-600 to-indigo-800 text-white border-sky-400/50 shadow-blue-950/40';
    case 'Hijau':
      return 'bg-gradient-to-b from-emerald-400 via-emerald-600 to-teal-800 text-white border-emerald-300/50 shadow-emerald-950/40';
    case 'Kuning':
      return 'bg-gradient-to-b from-amber-300 via-amber-400 to-amber-600 text-slate-950 border-amber-200/80 shadow-amber-950/40 font-bold';
    case 'Wild':
      return 'bg-gradient-to-tr from-purple-700 via-fuchsia-600 via-pink-500 to-amber-400 text-white border-fuchsia-300/80 shadow-purple-950/50';
    default:
      return 'bg-gradient-to-b from-slate-700 to-slate-900 text-white border-slate-600';
  }
}

export function getColorBadgeClass(color: CardColor): string {
  switch (color) {
    case 'Merah':
      return 'bg-red-100 text-red-800 border-red-300';
    case 'Biru':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'Hijau':
      return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    case 'Kuning':
      return 'bg-amber-100 text-amber-900 border-amber-300';
    case 'Wild':
      return 'bg-purple-100 text-purple-900 border-purple-300';
    default:
      return 'bg-slate-100 text-slate-800 border-slate-300';
  }
}
