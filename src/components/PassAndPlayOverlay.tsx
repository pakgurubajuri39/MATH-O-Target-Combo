import React from 'react';
import { User, EyeOff, Play } from 'lucide-react';

interface PassAndPlayOverlayProps {
  nextPlayerName: string;
  nextPlayerAvatar: string;
  onReady: () => void;
}

export const PassAndPlayOverlay: React.FC<PassAndPlayOverlayProps> = ({
  nextPlayerName,
  nextPlayerAvatar,
  onReady,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div id="pass-and-play-screen" className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl text-center border border-slate-200 flex flex-col items-center">
        <div className="w-16 h-16 bg-blue-100 text-blue-700 rounded-3xl flex items-center justify-center text-3xl font-black mb-4 shadow-inner">
          {nextPlayerAvatar}
        </div>

        <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-700 bg-amber-100 px-3 py-1 rounded-full border border-amber-300 mb-2">
          <EyeOff className="w-4 h-4" />
          <span>Mode Privasi Pass & Play</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-1">
          Giliran: {nextPlayerName}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mb-6">
          Serahkan perangkat ini kepada <span className="font-extrabold text-slate-800">{nextPlayerName}</span>. Pastikan pemain lain tidak mengintip kartu!
        </p>

        <button
          onClick={onReady}
          id="btn-pass-ready"
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm rounded-2xl transition shadow-lg cursor-pointer active:scale-95"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Saya Siap, Buka Kartu Tangan!</span>
        </button>
      </div>
    </div>
  );
};
