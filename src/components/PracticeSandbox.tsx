import React, { useState } from 'react';
import { Card, MathOperator } from '../types';
import { CardView } from './CardView';
import { evaluateCombo } from '../utils/cardUtils';
import { Calculator, X, Sparkles, RefreshCw } from 'lucide-react';

interface PracticeSandboxProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PracticeSandbox: React.FC<PracticeSandboxProps> = ({ isOpen, onClose }) => {
  const [targetVal, setTargetVal] = useState<number>(10);
  const [cards, setCards] = useState<Card[]>([
    { id: 'p1', color: 'Merah', type: 'number', value: 8, label: '8' },
    { id: 'p2', color: 'Biru', type: 'number', value: 2, label: '2' },
  ]);
  const [operators, setOperators] = useState<MathOperator[]>(['+']);

  if (!isOpen) return null;

  const addNumberCard = (val: number, color: 'Merah' | 'Biru' | 'Hijau' | 'Kuning') => {
    if (cards.length >= 4) return;
    const newCard: Card = {
      id: `practice_${Date.now()}_${Math.random()}`,
      color,
      type: 'number',
      value: val,
      label: `${val}`,
    };
    const newCards = [...cards, newCard];
    setCards(newCards);
    if (newCards.length > 1) {
      setOperators([...operators, '+']);
    }
  };

  const removeCard = (index: number) => {
    const newCards = [...cards];
    newCards.splice(index, 1);
    setCards(newCards);

    const newOps = [...operators];
    if (index > 0) {
      newOps.splice(index - 1, 1);
    } else if (newOps.length > 0) {
      newOps.splice(0, 1);
    }
    setOperators(newOps);
  };

  const setOperator = (idx: number, op: MathOperator) => {
    const newOps = [...operators];
    newOps[idx] = op;
    setOperators(newOps);
  };

  const attempt = evaluateCombo(cards, operators);
  const isMatch = attempt.isValid && attempt.calculatedValue === targetVal;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div id="practice-sandbox-modal" className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-100 text-indigo-800 rounded-xl">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800">
                Latihan & Simulator Combo Bebas
              </h2>
              <p className="text-xs text-slate-500">
                Uji coba variasi kombinasi matematika tanpa risiko penalti!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target Slider / Selector */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-900">Atur Target Uji Coba:</span>
            <input
              type="number"
              min="0"
              max="99"
              value={targetVal}
              onChange={e => setTargetVal(parseInt(e.target.value) || 0)}
              className="w-16 px-2 py-1 bg-white border border-amber-300 rounded-lg text-sm font-black text-slate-900 text-center"
            />
          </div>
          <p className="text-[11px] text-amber-800 font-medium">
            Tujuan: Buat persamaan yang menghasilkan nilai = <span className="font-bold">{targetVal}</span>
          </p>
        </div>

        {/* Display Current Equation */}
        <div className="bg-slate-900 text-white p-4 rounded-2xl mb-4 border border-slate-800 flex flex-col items-center justify-center min-h-[120px]">
          {cards.length === 0 ? (
            <p className="text-slate-400 text-xs italic">
              Tambahkan kartu angka dari panel di bawah...
            </p>
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-2">
              {cards.map((c, idx) => (
                <React.Fragment key={c.id}>
                  <div className="relative group">
                    <CardView card={c} size="sm" showBadge={false} />
                    <button
                      onClick={() => removeCard(idx)}
                      className="absolute -top-1 -right-1 bg-rose-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold shadow-xs cursor-pointer opacity-90 hover:scale-110"
                      title="Hapus Kartu"
                    >
                      ×
                    </button>
                  </div>

                  {idx < cards.length - 1 && (
                    <div className="flex gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
                      {(['+', '-', '×', '÷'] as MathOperator[]).map(op => (
                        <button
                          key={op}
                          onClick={() => setOperator(idx, op)}
                          className={`w-7 h-7 rounded-lg font-bold text-xs cursor-pointer ${
                            operators[idx] === op
                              ? 'bg-emerald-500 text-white'
                              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          }`}
                        >
                          {op}
                        </button>
                      ))}
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}

          {cards.length >= 2 && (
            <div className="mt-3 text-center">
              <p className="text-lg font-black text-amber-300">
                {attempt.equationDisplay}
              </p>
              {isMatch ? (
                <span className="text-xs font-bold text-emerald-400 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-700 inline-block mt-1">
                  ✓ SANGAT TEPAT! COCOK DENGAN TARGET {targetVal}
                </span>
              ) : (
                <span className="text-xs font-semibold text-rose-300 bg-rose-950 px-3 py-1 rounded-full border border-rose-800 inline-block mt-1">
                  {attempt.errorMessage || `Hasil = ${attempt.calculatedValue} (Belum Cocok Target ${targetVal})`}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Card Builder Palette */}
        <div className="mb-4">
          <p className="text-xs font-bold text-slate-700 mb-2">
            + Tambah Kartu Angka ke Papan (Maksimal 4 Kartu):
          </p>
          <div className="flex flex-wrap gap-1.5 justify-center">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <button
                key={num}
                onClick={() => addNumberCard(num, 'Biru')}
                className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-xl transition cursor-pointer shadow-xs active:scale-95 flex items-center justify-center"
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl cursor-pointer hover:bg-slate-900"
          >
            Tutup Latihan
          </button>
        </div>
      </div>
    </div>
  );
};
