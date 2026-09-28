'use client';
import { animate, motion, useMotionValue, useTransform } from 'framer-motion';
import { useEffect } from 'react';
import { Check, X, Lightbulb } from 'lucide-react';
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from 'recharts';
import type { Report } from '@/lib/types';

function Counter({ to }: { to: number }) {
  const v = useMotionValue(0), t = useTransform(v, n => Math.round(n));
  useEffect(() => { const c = animate(v, to, { duration: 1.4, ease: [0.16, 1, 0.3, 1] }); return () => c.stop(); }, [to, v]);
  return <motion.span>{t}</motion.span>;
}
const tone = (n: number) => (n >= 75 ? '#22d3ee' : n >= 50 ? '#6378ff' : '#8b5cf6');
const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export default function ReportView({ r }: { r: Report }) {
  const s = r.scores;
  const bars: [string, number][] = [['README', s.readme], ['Documentation', s.documentation], ['Portfolio', s.portfolio], ['Maturity', s.maturity]];
  const ready: [string, boolean][] = [['Recruiter', r.readiness.recruiter], ['Client', r.readiness.client], ['Open source', r.readiness.openSource], ['Internship', r.readiness.internship]];
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="grid gap-4 md:grid-cols-3">
      <motion.div variants={item} className="glass gborder rounded-3xl p-8 md:row-span-2">
        <p className="text-sm text-white/50">{r.repo.owner}/{r.repo.name}</p>
        <div className="mt-6 font-display text-8xl font-semibold tracking-tight"><Counter to={s.health} /><span className="text-2xl text-white/30">/100</span></div>
        <p className="mt-1 text-white/60">Repository health</p>
        <div className="mt-8 h-52"><ResponsiveContainer><RadarChart data={bars.map(([k, v]) => ({ k, v }))}>
          <PolarGrid stroke="rgba(255,255,255,.08)" /><PolarAngleAxis dataKey="k" tick={{ fill: '#888', fontSize: 11 }} />
          <Radar dataKey="v" stroke="#6378ff" fill="#6378ff" fillOpacity={0.25} /></RadarChart></ResponsiveContainer></div>
      </motion.div>
      <motion.div variants={item} className="glass rounded-3xl p-6 md:col-span-2">
        <h3 className="font-display text-lg">Scores</h3>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">{bars.map(([k, v]) => (
          <div key={k}><div className="flex justify-between text-sm"><span className="text-white/60">{k}</span><span><Counter to={v} /></span></div>
            <div className="mt-2 h-1.5 rounded-full bg-white/5"><motion.div className="h-full rounded-full" style={{ background: tone(v), boxShadow: `0 0 12px ${tone(v)}88` }} initial={{ width: 0 }} animate={{ width: `${v}%` }} transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }} /></div></div>))}</div>
        <div className="mt-6 flex flex-wrap gap-2">{ready.map(([k, ok]) => (
          <span key={k} className={`rounded-full border px-3 py-1 text-sm ${ok ? 'border-cyan-400/30 text-cyan-300' : 'border-white/10 text-white/40'}`}>{k} ready: {ok ? 'Yes' : 'No'}</span>))}</div>
      </motion.div>
      <motion.div variants={item} className="glass rounded-3xl p-6">
        <h3 className="font-display text-lg">Checklist</h3>
        <ul className="mt-4 space-y-2.5">{r.checklist.map(c => (
          <li key={c.label} className="flex items-center gap-2.5 text-sm">{c.ok ? <Check size={16} className="text-cyan-400" /> : <X size={16} className="text-white/25" />}<span className={c.ok ? '' : 'text-white/45'}>{c.label}</span></li>))}</ul>
      </motion.div>
      <motion.div variants={item} className="glass rounded-3xl p-6 md:col-span-3">
        <h3 className="font-display text-lg">What to fix first</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2">{r.suggestions.map(t => (
          <motion.div whileHover={{ y: -3 }} key={t} className="flex gap-3 rounded-2xl border border-white/5 bg-white/[.03] p-4 text-sm text-white/75"><Lightbulb size={16} className="mt-0.5 shrink-0 text-indigo-400" />{t}</motion.div>))}</div>
        {r.missing.length > 0 && <p className="mt-5 text-sm text-white/45">Missing: {r.missing.join(', ')}</p>}
      </motion.div>
    </motion.div>
  );
}
