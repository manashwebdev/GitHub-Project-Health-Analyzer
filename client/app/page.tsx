'use client';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, GitBranch, Loader2, ScanText, Gauge, Users, ShieldCheck } from 'lucide-react';
import Backdrop from '@/components/Backdrop';
import ReportView from '@/components/Report';
import { Report, SAMPLE } from '@/lib/types';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const FEATURES = [
  [ScanText, 'README analyzer', 'Scores clarity, install steps, usage, screenshots and license against what reviewers look for.'],
  [Gauge, 'Portfolio readiness', 'Tells you if the repo is ready for recruiters, clients, open source or internships.'],
  [Users, 'Recruiter view', 'Shows the first impression a hiring manager gets in under a minute.'],
  [ShieldCheck, 'Best practices', 'Checks tests, CI, structure, env files and deployment docs.'],
] as const;
const FAQ = [
  ['Does it need access to my code?', 'No. It reads public repository metadata, the file list and the README through the GitHub API.'],
  ['Are the scores AI-generated?', 'Scores come from transparent rules in server/analyzer.js. An AI layer can be added on top for written feedback.'],
  ['Why did I hit a rate limit?', 'Unauthenticated GitHub requests are limited. Add a GITHUB_TOKEN to server/.env.'],
];
const STEPS = ['Paste a public repository URL.', 'We read the README, file tree and metadata.', 'Get scores, gaps and a prioritised fix list.'];

export default function Page() {
  const [url, setUrl] = useState(''), [busy, setBusy] = useState(false), [err, setErr] = useState(''), [report, setReport] = useState<Report | null>(null);
  async function run(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr('');
    try {
      const r = await fetch(`${API}/api/analyze`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }) });
      const d = await r.json(); if (!r.ok) throw new Error(d.error);
      setReport(d); setTimeout(() => document.getElementById('report')?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (x) { setErr(x instanceof Error ? x.message : 'Something went wrong. Is the API running on port 4000?'); }
    setBusy(false);
  }
  return (
    <main className="mx-auto max-w-6xl px-6 pb-32">
      <Backdrop />
      <nav className="flex items-center justify-between py-6 text-sm text-white/60"><span className="flex items-center gap-2 font-display text-white"><GitBranch size={18} className="text-indigo-400" />RepoHealth</span><a href="#sample" className="hover:text-white">Sample report</a></nav>

      <section className="pb-24 pt-20 text-center">
        <motion.h1 initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-4xl font-display text-5xl font-semibold leading-[1.02] tracking-tight md:text-8xl">Know why your GitHub projects get ignored.</motion.h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-white/55">Analyze documentation quality, portfolio readiness and repository health in seconds.</p>
        <form onSubmit={run} className="glass gborder mx-auto mt-10 flex max-w-2xl items-center gap-2 rounded-2xl p-2 shadow-[0_0_80px_-20px_rgba(99,120,255,.5)]">
          <GitBranch size={18} className="ml-3 shrink-0 text-white/30" />
          <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://github.com/username/project" aria-label="GitHub repository URL" className="min-w-0 flex-1 bg-transparent px-2 py-3 outline-none placeholder:text-white/25" />
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} disabled={busy || !url} className="flex items-center gap-2 rounded-xl bg-gradient-to-b from-indigo-400 to-indigo-600 px-5 py-3 text-sm font-medium shadow-[0_0_30px_-4px_rgba(99,120,255,.8)] disabled:opacity-40">
            {busy ? <><Loader2 size={16} className="animate-spin" />Analyzing</> : <>Analyze repository<ArrowRight size={16} /></>}</motion.button>
        </form>
        <AnimatePresence>{err && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="alert" className="mt-4 text-sm text-violet-300">{err}</motion.p>}</AnimatePresence>
      </section>

      <section id="report" className="scroll-mt-8">
        {busy && <div className="grid gap-4 md:grid-cols-3">{[0, 1, 2].map(i => <div key={i} className="glass h-56 animate-pulse rounded-3xl" />)}</div>}
        {!busy && report && <ReportView r={report} />}
        {!busy && !report && <p className="text-center text-sm text-white/35">Your report appears here. Try any public repository.</p>}
      </section>

      <section className="mt-32 grid gap-4 md:grid-cols-4">{FEATURES.map(([Icon, t, d], i) => (
        <motion.div key={t} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} whileHover={{ y: -4 }} className="glass rounded-3xl p-6">
          <Icon size={20} className="text-cyan-400" /><h3 className="mt-4 font-display text-lg">{t}</h3><p className="mt-2 text-sm text-white/50">{d}</p></motion.div>))}</section>

      <section className="mt-32"><h2 className="font-display text-4xl">How it works</h2>
        <ol className="mt-8 grid gap-4 md:grid-cols-3">{STEPS.map((s, i) => <li key={s} className="glass rounded-3xl p-6"><span className="font-display text-3xl text-indigo-400">{i + 1}</span><p className="mt-3 text-white/70">{s}</p></li>)}</ol></section>

      <section id="sample" className="mt-32 scroll-mt-8"><h2 className="mb-2 font-display text-4xl">A sample report</h2><p className="mb-8 text-white/50">Example data for a fictional repository.</p><ReportView r={SAMPLE} /></section>

      <section className="mt-32"><h2 className="font-display text-4xl">What developers say</h2><p className="mt-2 text-sm text-white/40">Placeholder quotes. Replace with real feedback before launch.</p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">{['I finally understood why my README lost people in ten seconds.', 'The fix list was specific enough to finish in one evening.'].map(q => <blockquote key={q} className="glass rounded-3xl p-6 text-lg text-white/80">{q}</blockquote>)}</div></section>

      <section className="mt-32 max-w-3xl"><h2 className="font-display text-4xl">Questions</h2>
        {FAQ.map(([q, a]) => <details key={q} className="glass group mt-3 rounded-2xl p-5"><summary className="cursor-pointer list-none font-medium">{q}</summary><p className="mt-3 text-sm text-white/55">{a}</p></details>)}</section>

      <section className="glass gborder mt-32 rounded-3xl p-12 text-center"><h2 className="font-display text-4xl md:text-5xl">Make your next repo worth opening.</h2>
        <a href="#top" onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-medium text-black">Analyze a repository<ArrowRight size={16} /></a></section>
    </main>
  );
}
