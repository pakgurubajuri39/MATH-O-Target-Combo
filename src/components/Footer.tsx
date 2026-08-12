import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer id="app-footer" className="w-full py-4 text-center border-t border-slate-200/80 bg-white/80 backdrop-blur-xs mt-auto">
      <div className="max-w-6xl mx-auto px-4 flex flex-col items-center justify-center gap-1">
        <p className="text-xs sm:text-sm font-extrabold text-slate-700 tracking-tight">
          @copyright Pak GuruAI
        </p>
        <p className="text-[10px] text-slate-400 font-medium">
          MATH-O! Target Combo • Game Kartu Matematika Edukatif Interaktif
        </p>
      </div>
    </footer>
  );
};
