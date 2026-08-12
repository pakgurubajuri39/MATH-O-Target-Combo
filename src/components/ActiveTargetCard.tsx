import React from 'react';
import { Card } from '../types';
import { CardView } from './CardView';
import { Target, Sparkles, HelpCircle } from 'lucide-react';
import { TargetCardParticles } from './TargetCardParticles';

interface ActiveTargetCardProps {
  card: Card;
  onOpenComboModal: () => void;
  onRequestHint: () => void;
  canCombo: boolean;
  comboBurstTrigger?: number;
}

export const ActiveTargetCard: React.FC<ActiveTargetCardProps> = ({
  card,
  onOpenComboModal,
  onRequestHint,
  canCombo,
  comboBurstTrigger = 0,
}) => {
  return (
    <div id="active-target-section" className="bg-white/80 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-lg flex flex-col items-center relative overflow-visible">
      {/* Background Accent Glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-200/40 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-blue-200/40 rounded-full blur-2xl pointer-events-none" />

      {/* Header Label */}
      <div className="flex items-center gap-2 mb-3">
        <Target className="w-5 h-5 text-amber-600 animate-pulse" />
        <span className="text-xs sm:text-sm font-extrabold tracking-wider uppercase text-slate-700">
          Kartu Target Aktif
        </span>
      </div>

      {/* Target Card Display Container with Particle Overlay */}
      <div id="active-target-card-container" className="relative group my-1">
        <TargetCardParticles triggerCount={comboBurstTrigger} />
        <CardView card={card} size="lg" />
        <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-emerald-400 rounded-3xl opacity-20 group-hover:opacity-40 transition blur-md -z-10" />
      </div>

      {/* Target Info Badge */}
      <div className="mt-3 text-center bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 max-w-xs">
        <p className="text-xs text-slate-600 font-medium">
          Target Angka:{' '}
          <span className="font-extrabold text-slate-900 text-sm">
            {card.type === 'number' ? card.value : card.label}
          </span>
          {' | '}
          Warna:{' '}
          <span className="font-bold text-slate-800">
            {card.color}
          </span>
        </p>
      </div>

      {/* Action Buttons for Combo & Hint */}
      <div className="flex flex-wrap items-center justify-center gap-2 mt-4 w-full max-w-sm">
        <button
          onClick={onOpenComboModal}
          disabled={!canCombo}
          id="btn-open-combo-builder"
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition shadow-sm ${
            canCombo
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white cursor-pointer hover:shadow-md active:scale-95'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Buat Combo Matematika!</span>
        </button>

        <button
          onClick={onRequestHint}
          id="btn-request-guru-hint"
          className="flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs sm:text-sm transition cursor-pointer border border-amber-300 shadow-xs active:scale-95"
          title="Minta Petunjuk Pak GuruAI"
        >
          <HelpCircle className="w-4 h-4 text-amber-700" />
          <span>Petunjuk</span>
        </button>
      </div>
    </div>
  );
};
