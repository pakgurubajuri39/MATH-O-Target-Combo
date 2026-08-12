import confetti from 'canvas-confetti';

/**
 * Triggers a multi-stage confetti particle explosion directly centered over the Active Target Card element.
 */
export function triggerComboParticles(targetElementId: string = 'active-target-card-container') {
  const element = document.getElementById(targetElementId) || document.getElementById('active-target-section');

  let originX = 0.5;
  let originY = 0.42;

  if (element) {
    const rect = element.getBoundingClientRect();
    originX = (rect.left + rect.width / 2) / window.innerWidth;
    originY = (rect.top + rect.height / 2) / window.innerHeight;
  }

  // 1. Primary Confetti Burst directly over the target card
  confetti({
    particleCount: 80,
    spread: 85,
    origin: { x: originX, y: originY },
    colors: ['#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6', '#eab308', '#06b6d4'],
    shapes: ['square', 'circle'],
    scalar: 1.15,
    ticks: 180,
    gravity: 0.85,
    drift: 0,
    startVelocity: 30,
    zIndex: 9999,
  });

  // 2. Secondary Starburst Sparkles slightly delayed
  setTimeout(() => {
    confetti({
      particleCount: 45,
      angle: 90,
      spread: 120,
      origin: { x: originX, y: originY },
      colors: ['#fbbf24', '#34d399', '#60a5fa', '#f472b6', '#a78bfa'],
      scalar: 0.95,
      ticks: 150,
      startVelocity: 24,
      zIndex: 9999,
    });
  }, 100);

  // 3. Side burst left & right from the card
  setTimeout(() => {
    confetti({
      particleCount: 30,
      angle: 60,
      spread: 60,
      origin: { x: Math.max(0.05, originX - 0.04), y: originY },
      colors: ['#10b981', '#f59e0b', '#06b6d4'],
      scalar: 0.85,
      ticks: 130,
      startVelocity: 20,
      zIndex: 9999,
    });
    confetti({
      particleCount: 30,
      angle: 120,
      spread: 60,
      origin: { x: Math.min(0.95, originX + 0.04), y: originY },
      colors: ['#ec4899', '#8b5cf6', '#eab308'],
      scalar: 0.85,
      ticks: 130,
      startVelocity: 20,
      zIndex: 9999,
    });
  }, 200);
}
