export type Report = {
  repo: { owner: string; name: string; description: string | null; stars: number; forks: number; url: string };
  scores: { health: number; readme: number; documentation: number; portfolio: number; maturity: number };
  readiness: { recruiter: boolean; client: boolean; openSource: boolean; internship: boolean };
  missing: string[]; suggestions: string[]; checklist: { label: string; ok: boolean }[]; stack: string[];
};
export const SAMPLE: Report = {
  repo: { owner: 'demo', name: 'taskflow-app', description: 'Sample repository', stars: 12, forks: 2, url: '#' },
  scores: { health: 64, readme: 58, documentation: 49, portfolio: 61, maturity: 72 },
  readiness: { recruiter: false, client: false, openSource: false, internship: true },
  missing: ['Screenshots', 'Live demo', 'Architecture', 'Deployment guide', 'Changelog'],
  suggestions: ['Add screenshots or a GIF near the top of the README to improve first impression.', 'Include deployment instructions for easier project evaluation.', 'Explain business value instead of only technical implementation.'],
  checklist: [{ label: 'Clear project description', ok: true }, { label: 'Screenshots', ok: false }, { label: 'Live demo', ok: false }, { label: 'Setup guide', ok: true }, { label: 'Architecture', ok: false }, { label: 'Clean folder structure', ok: true }],
  stack: ['TypeScript', 'CSS', 'JavaScript'],
};
