import React, { useState } from 'react';
import { MoveHistoryItem } from '../types';
import { History, ChevronDown, ChevronUp, CheckCircle, AlertTriangle, Sparkles, Layers } from 'lucide-react';

interface HistoryLogProps {
  history: MoveHistoryItem[];
}

export const HistoryLog: React.FC<HistoryLogProps> = ({ history }) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);

  return (
    <div id="history-log-panel" className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200 p-4 shadow-sm">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-indigo-600" />
          <h3 className="font-extrabold text-xs sm:text-sm text-slate-800">
            Riwayat Langkah Terakhir ({history.length})
          </h3>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-slate-400 hover:text-slate-700 transition cursor-pointer p-1"
        >
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isOpen && (
        <div className="mt-3 max-h-48 overflow-y-auto space-y-2 pr-1">
          {history.length === 0 ? (
            <p className="text-xs text-slate-400 italic text-center py-2">
              Belum ada langkah. Permainan baru saja dimulai!
            </p>
          ) : (
            history.map(item => (
              <div
                key={item.id}
                className={`p-2.5 rounded-xl border text-xs flex flex-col gap-1 transition ${
                  item.actionType === 'combo'
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                    : item.actionType === 'penalty'
                    ? 'bg-rose-50/80 border-rose-200 text-rose-950'
                    : item.actionType === 'draw'
                    ? 'bg-slate-50 border-slate-200 text-slate-800'
                    : 'bg-blue-50/80 border-blue-200 text-blue-950'
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1">
                    {item.actionType === 'combo' && <Sparkles className="w-3.5 h-3.5 text-emerald-600" />}
                    {item.actionType === 'penalty' && <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />}
                    {item.actionType === 'draw' && <Layers className="w-3.5 h-3.5 text-slate-500" />}
                    {item.actionType === 'single' && <CheckCircle className="w-3.5 h-3.5 text-blue-600" />}
                    {item.playerName}
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">{item.timestamp}</span>
                </div>

                <p className="font-semibold text-slate-700">
                  {item.description}
                </p>

                {item.equationText && (
                  <div className="bg-white/80 p-1.5 rounded-lg border border-slate-200 font-mono text-[11px] font-bold text-slate-900 mt-0.5">
                    🧮 {item.equationText}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
