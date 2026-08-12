import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface ParticleItem {
  id: string;
  symbol: string;
  x: number; // translateX target (px)
  y: number; // translateY target (px)
  scale: number;
  rotate: number;
  color: string;
  delay: number;
  size: string;
}

interface TargetCardParticlesProps {
  triggerCount: number;
}

const MATH_SYMBOLS = ['+', '-', '×', '÷', '=', '√', 'π', '∫', '∑', '★', 'NUMERIX!', '✨', '+15'];
const PARTICLE_COLORS = [
  'text-emerald-500 bg-emerald-100 border-emerald-300',
  'text-amber-500 bg-amber-100 border-amber-300',
  'text-blue-500 bg-blue-100 border-blue-300',
  'text-rose-500 bg-rose-100 border-rose-300',
  'text-purple-500 bg-purple-100 border-purple-300',
  'text-teal-500 bg-teal-100 border-teal-300',
  'text-cyan-500 bg-cyan-100 border-cyan-300',
];

export const TargetCardParticles: React.FC<TargetCardParticlesProps> = ({ triggerCount }) => {
  const [particles, setParticles] = useState<ParticleItem[]>([]);

  useEffect(() => {
    if (triggerCount <= 0) return;

    // Generate burst particles radiating outward from card center
    const newParticles: ParticleItem[] = [];
    const particleCount = 16;

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * 2 * Math.PI + (Math.random() * 0.4 - 0.2);
      const distance = 70 + Math.random() * 90; // explosion radius

      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance - 20; // bias upwards

      const symbol = MATH_SYMBOLS[i % MATH_SYMBOLS.length];
      const color = PARTICLE_COLORS[i % PARTICLE_COLORS.length];

      newParticles.push({
        id: `particle_${triggerCount}_${i}_${Math.random()}`,
        symbol,
        x,
        y,
        scale: 0.8 + Math.random() * 0.6,
        rotate: (Math.random() - 0.5) * 180,
        color,
        delay: Math.random() * 0.1,
        size: symbol.length > 2 ? 'text-xs px-2 py-0.5' : 'text-sm font-black w-7 h-7 flex items-center justify-center',
      });
    }

    setParticles(newParticles);

    // Auto cleanup after animation finishes
    const timer = setTimeout(() => {
      setParticles([]);
    }, 1500);

    return () => clearTimeout(timer);
  }, [triggerCount]);

  if (particles.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center overflow-visible">
      <AnimatePresence>
        {particles.map(p => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, scale: 0, x: 0, y: 0, rotate: 0 }}
            animate={{
              opacity: [0, 1, 1, 0],
              scale: [0.2, p.scale, p.scale * 1.1, 0],
              x: p.x,
              y: p.y,
              rotate: p.rotate,
            }}
            transition={{
              duration: 1.1,
              delay: p.delay,
              ease: [0.16, 1, 0.3, 1], // snappy spring ease
            }}
            className={`absolute rounded-full shadow-lg border backdrop-blur-xs font-black tracking-wider uppercase select-none ${p.color} ${p.size}`}
          >
            {p.symbol}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
