import React from 'react';
import { HelpCircle, X, Sparkles, Lightbulb } from 'lucide-react';

interface GuruHintModalProps {
  isOpen: boolean;
  onClose: () => void;
  hintText: string;
  isLoading: boolean;
  playerName: string;
  targetValue: number;
  targetColor: string;
}

export const GuruHintModal: React.FC<GuruHintModalProps> = ({
  isOpen,
  onClose,
  hintText,
  isLoading,
  playerName,
  targetValue,
  targetColor,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div id="guru-hint-modal" className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-amber-200 relative overflow-hidden">
        {/* Top Decorative Header */}
        <div className="bg-gradient-to-r from-amber-500 to-rose-500 -m-6 mb-4 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center text-2xl font-black">
              👨‍🏫
            </div>
            <div>
              <h3 className="font-extrabold text-base">Petunjuk Pak GuruAI</h3>
              <p className="text-xs text-amber-100 font-medium">
                Asisten Logika Matematika
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target Reminder Pill */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 mb-4 flex items-center justify-between text-xs font-bold text-amber-900">
          <span>Target Aktif:</span>
          <span className="bg-amber-200 text-amber-950 px-2 py-0.5 rounded-lg text-sm font-black">
            {targetColor} {targetValue}
          </span>
        </div>

        {/* Content Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-5 min-h-[100px] flex items-center justify-center">
          {isLoading ? (
            <div className="flex flex-col items-center gap-2 text-slate-500 py-4">
              <Sparkles className="w-6 h-6 text-amber-500 animate-spin" />
              <p className="text-xs font-semibold">
                Pak GuruAI sedang menghitung strategi terbaik...
              </p>
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                {hintText}
              </p>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs sm:text-sm rounded-xl transition shadow-xs cursor-pointer"
          >
            Siap, Terima Kasih Pak Guru!
          </button>
        </div>
      </div>
    </div>
  );
};
