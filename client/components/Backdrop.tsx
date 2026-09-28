'use client';
import { motion, useMotionValue, useSpring, useMotionTemplate } from 'framer-motion';
export default function Backdrop() {
  const x = useSpring(useMotionValue(-400), { stiffness: 80, damping: 20 }), y = useSpring(useMotionValue(-400), { stiffness: 80, damping: 20 });
  const bg = useMotionTemplate`radial-gradient(420px circle at ${x}px ${y}px, rgba(99,120,255,.10), transparent 70%)`;
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden" onMouseMove={undefined}>
      <motion.div className="absolute inset-0" style={{ background: bg }} />
      <div className="absolute -left-40 top-[-10%] h-[560px] w-[560px] rounded-full bg-indigo-600/20 blur-[140px]" style={{ animation: 'drift 22s ease-in-out infinite' }} />
      <div className="absolute -right-40 top-[30%] h-[480px] w-[480px] rounded-full bg-cyan-500/10 blur-[140px]" style={{ animation: 'drift 28s ease-in-out infinite reverse' }} />
      <MouseTracker x={x} y={y} />
    </div>
  );
}
import { useEffect } from 'react';
import type { MotionValue } from 'framer-motion';
function MouseTracker({ x, y }: { x: MotionValue<number>; y: MotionValue<number> }) {
  useEffect(() => { const m = (e: MouseEvent) => { x.set(e.clientX); y.set(e.clientY); }; window.addEventListener('mousemove', m); return () => window.removeEventListener('mousemove', m); }, [x, y]);
  return null;
}
