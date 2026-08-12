import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, ChevronLeft, BookOpen, Layers, Zap, Lightbulb } from 'lucide-react';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const tutorialSteps = [
  {
    id: 'intro',
    title: 'Tujuan Permainan',
    icon: <BookOpen className="w-8 h-8 text-cyan-400" />,
    content: (
      <div className="space-y-4">
        <p className="text-slate-300">
          Selamat datang di <strong className="text-cyan-400">NUMERIX: MATH CLASH</strong>! Tujuan utama permainan ini adalah menjadi pemain pertama yang <strong className="text-amber-400">menghabiskan semua kartu di tangan</strong>.
        </p>
        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
          <p className="text-sm text-slate-300">
            Setiap putaran, kamu harus menurunkan kartu yang cocok dengan <strong className="text-white">Kartu Target</strong> di tengah meja.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'single',
    title: 'Bermain Kartu Tunggal',
    icon: <Layers className="w-8 h-8 text-emerald-400" />,
    content: (
      <div className="space-y-4">
        <p className="text-slate-300">
          Cara paling dasar untuk membuang kartu adalah dengan memainkan <strong className="text-emerald-400">satu kartu</strong> yang cocok dengan Kartu Target berdasarkan salah satu kriteria ini:
        </p>
        <ul className="list-disc list-inside space-y-2 text-slate-300 ml-2">
          <li>Cocok <strong className="text-white">Warna</strong> (Contoh: Kartu Merah ke Target Merah).</li>
          <li>Cocok <strong className="text-white">Angka / Tipe</strong> (Contoh: Angka 5 ke Target Angka 5).</li>
          <li>Menggunakan kartu <strong className="bg-gradient-to-r from-amber-400 via-pink-400 to-cyan-400 text-slate-950 px-2 py-0.5 rounded-md font-black shadow-sm mx-1">WILD</strong> (Bebas warna).</li>
        </ul>
        <p className="text-sm text-slate-400 italic">
          *Sama seperti aturan dasar permainan kartu warna klasik.
        </p>
      </div>
    ),
  },
  {
    id: 'combo',
    title: 'COMBO MATEMATIKA',
    icon: <Zap className="w-8 h-8 text-purple-400" />,
    content: (
      <div className="space-y-4">
        <p className="text-slate-300">
          Ingin cepat menang? Gunakan fitur unik <strong className="text-purple-400">Combo Matematika</strong> untuk membuang <strong className="text-white">banyak kartu sekaligus</strong>!
        </p>
        <div className="bg-purple-900/20 p-4 rounded-xl border border-purple-500/30">
          <p className="text-sm text-slate-300 mb-2">
            Pilih 2 kartu angka dari tanganmu, lalu buat operasi matematika <strong className="text-white">(+, -, ×, ÷)</strong> agar hasilnya sama dengan nilai angka Kartu Target!
          </p>
          <div className="bg-slate-900 rounded p-2 text-center text-sm font-mono text-cyan-300 border border-slate-700">
            Target: 10<br />
            Pemain Memilih: [Kartu 2] × [Kartu 5] = 10<br />
            <span className="text-emerald-400 font-bold">» 2 Kartu Terbuang!</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'tips',
    title: 'Tips & Trik',
    icon: <Lightbulb className="w-8 h-8 text-amber-400" />,
    content: (
      <div className="space-y-4">
        <ul className="space-y-3">
          <li className="flex gap-3">
            <span className="text-amber-400 font-bold mt-1">1.</span>
            <p className="text-sm text-slate-300">Kartu aksi seperti <strong>+2, Skip, dan Reverse</strong> sangat berguna untuk menghalangi lawanmu.</p>
          </li>
          <li className="flex gap-3">
            <span className="text-amber-400 font-bold mt-1">2.</span>
            <p className="text-sm text-slate-300">Jangan lupa meneriakkan <strong>"NUMERIX!"</strong> ketika kartumu tersisa 1, atau kamu bisa kena penalti jika ketahuan!</p>
          </li>
          <li className="flex gap-3">
            <span className="text-amber-400 font-bold mt-1">3.</span>
            <p className="text-sm text-slate-300">Jika buntu, gunakan kartu <strong className="bg-slate-800 text-pink-400 px-2 py-0.5 rounded border border-pink-500/30 font-bold mx-1">WILD BEBAS OPERATOR</strong> dalam mode Combo untuk mempermudah perhitungan.</p>
          </li>
        </ul>
      </div>
    ),
  }
];

export const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const nextStep = () => setCurrentStep(p => Math.min(p + 1, tutorialSteps.length - 1));
  const prevStep = () => setCurrentStep(p => Math.max(p - 1, 0));

  const step = tutorialSteps[currentStep];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg bg-slate-900 border border-slate-700 shadow-2xl rounded-3xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-800/50">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            Cara Bermain
          </h2>
          <button
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 min-h-[300px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-slate-800 rounded-2xl shadow-inner border border-slate-700">
                  {step.icon}
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight">{step.title}</h3>
              </div>
              
              <div className="text-base leading-relaxed">
                {step.content}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Controls */}
        <div className="p-6 border-t border-slate-800 bg-slate-800/30 flex items-center justify-between">
          <div className="flex gap-1.5">
            {tutorialSteps.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentStep ? 'w-6 bg-cyan-400' : 'w-2 bg-slate-700'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="p-2 sm:px-4 sm:py-2 rounded-xl font-bold text-sm bg-slate-800 text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Kembali</span>
            </button>
            <button
              onClick={currentStep === tutorialSteps.length - 1 ? onClose : nextStep}
              className="px-4 py-2 rounded-xl font-bold text-sm bg-cyan-600 text-white hover:bg-cyan-500 shadow-lg shadow-cyan-500/20 transition-all active:scale-95 flex items-center gap-1"
            >
              {currentStep === tutorialSteps.length - 1 ? 'Selesai' : 'Lanjut'}
              {currentStep !== tutorialSteps.length - 1 && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
