import React, { useState, useEffect } from 'react';
import { Card, MathOperator } from '../types';
import { CardView } from './CardView';
import { evaluateCombo } from '../utils/cardUtils';
import { Calculator, X, AlertCircle, CheckCircle2, RotateCcw, Zap } from 'lucide-react';

interface ComboBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  hand: Card[];
  targetValue: number;
  onSubmitCombo: (selectedCards: Card[], operators: MathOperator[], isCorrect: boolean, errorMessage?: string) => void;
}

export const ComboBuilderModal: React.FC<ComboBuilderModalProps> = ({
  isOpen,
  onClose,
  hand,
  targetValue,
  onSubmitCombo,
}) => {
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [operators, setOperators] = useState<MathOperator[]>([]);

  // Filter only number cards or Wild Operator
  const availableNumberCards = hand.filter(
    c => c.type === 'number' || c.type === 'wild_operator'
  );

  useEffect(() => {
    if (isOpen) {
      setSelectedCards([]);
      setOperators([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleCardSelection = (card: Card) => {
    const isAlreadySelected = selectedCards.some(c => c.id === card.id);
    if (isAlreadySelected) {
      // Find index
      const idx = selectedCards.findIndex(c => c.id === card.id);
      const newCards = selectedCards.filter(c => c.id !== card.id);
      setSelectedCards(newCards);

      // Remove corresponding operator
      if (operators.length > 0) {
        const newOps = [...operators];
        if (idx > 0) {
          newOps.splice(idx - 1, 1);
        } else {
          newOps.splice(0, 1);
        }
        setOperators(newOps);
      }
    } else {
      if (selectedCards.length >= 4) return; // Limit max 4 cards combo
      const newCards = [...selectedCards, card];
      setSelectedCards(newCards);

      if (newCards.length > 1) {
        // Default new operator '+'
        setOperators([...operators, '+']);
      }
    }
  };

  const setOperatorAtIndex = (index: number, op: MathOperator) => {
    const newOps = [...operators];
    newOps[index] = op;
    setOperators(newOps);
  };

  const comboAttempt = evaluateCombo(selectedCards, operators);
  const isTargetMatched =
    comboAttempt.isValid && comboAttempt.calculatedValue === targetValue;

  const handleExecute = () => {
    if (selectedCards.length < 2) return;

    if (isTargetMatched) {
      onSubmitCombo(selectedCards, operators, true);
    } else {
      // Incorrect combo execution -> Penalty +2!
      const errorMsg = comboAttempt.errorMessage ||
        `Hasil operasi hitungan (${comboAttempt.calculatedValue}) tidak sesuai dengan Kartu Target (${targetValue}).`;
      onSubmitCombo(selectedCards, operators, false, errorMsg);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div id="combo-builder-modal" className="bg-white rounded-3xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl border border-slate-200 relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <Calculator className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-800">
                Papan Hitung Combo Matematika
              </h2>
              <p className="text-xs text-slate-500">
                Gabungkan 2 kartu atau lebih agar hasilnya ={' '}
                <span className="font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  Target {targetValue}
                </span>
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

        {/* Equation Builder Preview Box */}
        <div className="bg-slate-900 text-white p-4 rounded-2xl mb-4 border border-slate-800 flex flex-col items-center justify-center min-h-[110px]">
          {selectedCards.length === 0 ? (
            <p className="text-slate-400 text-xs sm:text-sm italic text-center">
              Pilih kartu dari tanganmu di bawah untuk menyusun persamaan matematika...
            </p>
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-2 my-2">
              {selectedCards.map((card, idx) => (
                <React.Fragment key={`selected_${card.id}_${idx}`}>
                  {/* Card Display in Equation */}
                  <div className="flex items-center bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
                    <span className="font-extrabold text-lg text-amber-400 mr-1.5">
                      {card.value}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-slate-300">
                      ({card.color})
                    </span>
                  </div>

                  {/* Operator Selector Between Cards */}
                  {idx < selectedCards.length - 1 && (
                    <div className="flex gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
                      {(['+', '-', '×', '÷'] as MathOperator[]).map(op => (
                        <button
                          key={op}
                          onClick={() => setOperatorAtIndex(idx, op)}
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg font-extrabold text-sm transition cursor-pointer flex items-center justify-center ${
                            operators[idx] === op
                              ? 'bg-emerald-500 text-white shadow-xs'
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

          {/* Equation Status & Calculation Output */}
          {selectedCards.length >= 2 && (
            <div className="mt-3 flex flex-col items-center gap-1">
              <div className="text-base sm:text-xl font-extrabold text-amber-300">
                {comboAttempt.equationDisplay}
              </div>

              {isTargetMatched ? (
                <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-600 animate-pulse">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>PERFECT COMBO! Tepat sama dengan Target ({targetValue})</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-xs font-semibold text-rose-400 bg-rose-950/80 px-3 py-1 rounded-full border border-rose-800">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>
                    {comboAttempt.errorMessage ||
                      `Hasil (${comboAttempt.calculatedValue}) ≠ Target (${targetValue}) [Penalti +2 jika dijalankan!]`}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Card Selection List from Hand */}
        <div className="flex-1 overflow-y-auto mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Pilih Kartu dari Tangan ({availableNumberCards.length} Kartu Angka Tersedia)
            </span>
            {selectedCards.length > 0 && (
              <button
                onClick={() => {
                  setSelectedCards([]);
                  setOperators([]);
                }}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Pilihan
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2 justify-center p-2 bg-slate-50 rounded-2xl border border-slate-200 min-h-[120px] items-center">
            {availableNumberCards.length === 0 ? (
              <p className="text-xs text-slate-400">Tidak ada kartu angka yang bisa digabungkan di tanganmu.</p>
            ) : (
              availableNumberCards.map((card, idx) => {
                const isSelected = selectedCards.some(c => c.id === card.id);
                return (
                  <div key={`avail_${card.id}_${idx}`} className="transform transition active:scale-95">
                    <CardView
                      card={card}
                      size="sm"
                      isSelected={isSelected}
                      onClick={() => toggleCardSelection(card)}
                    />
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <p className="text-[11px] text-slate-500">
            *Catatan: Kartu terakhir yang dipilih dalam combo menjadi Warna Target Baru!
          </p>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs sm:text-sm cursor-pointer"
            >
              Batal
            </button>
            <button
              onClick={handleExecute}
              disabled={selectedCards.length < 2}
              id="btn-submit-combo"
              className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm shadow-md transition cursor-pointer ${
                isTargetMatched
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : selectedCards.length >= 2
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>
                {isTargetMatched
                  ? 'Jalankan Combo Perfect!'
                  : 'Coba Kirim (Cek Risiko Penalti)'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
