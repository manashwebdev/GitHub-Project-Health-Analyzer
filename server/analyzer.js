const H = { Accept: 'application/vnd.github+json', ...(process.env.GITHUB_TOKEN && { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }) };
async function gh(path, raw) {
  const r = await fetch('https://api.github.com' + path, { headers: raw ? { ...H, Accept: 'application/vnd.github.raw' } : H });
  if (!r.ok) { const e = new Error(r.status === 404 ? 'Repository or README not found. Check the URL and that the repo is public.' : r.status === 403 ? 'GitHub rate limit reached. Add GITHUB_TOKEN to server/.env.' : 'GitHub request failed.'); e.status = r.status; throw e; }
  return raw ? r.text() : r.json();
}
// [key, label, regex, weight, isCore, suggestion]
const RULES = [
  ['description', 'Clear project description', null, 12, 1, 'Open with one sentence on who the project is for and the problem it solves, not just the tech used.'],
  ['screenshots', 'Screenshots', /!\[|<img/i, 12, 1, 'Add screenshots or a GIF near the top of the README to improve first impression.'],
  ['demo', 'Live demo', /live demo|demo|vercel\.app|netlify\.app|github\.io|render\.com/i, 10, 1, 'Link a live demo so reviewers can evaluate the project without cloning it.'],
  ['install', 'Installation guide', /install|getting started|setup|npm i|pip install|git clone/i, 12, 1, 'Add step-by-step install commands that work on a clean machine.'],
  ['usage', 'Usage instructions', /usage|how to use|example|quick ?start/i, 8, 1, 'Show a usage example with real commands or code output.'],
  ['features', 'Features section', /features|highlights|what it does/i, 8, 1, 'List 4 to 6 concrete features, framed by the benefit to the user.'],
  ['stack', 'Tech stack', /tech stack|built with|technolog|stack/i, 6, 1, 'Name your stack and briefly say why you chose each part.'],
  ['contributing', 'Contributing guide', /contribut/i, 5, 1, 'Add a Contributing section with how to open issues and PRs.'],
  ['license', 'License', /licen[cs]e|mit|apache/i, 5, 1, 'Add a LICENSE file so others know how they can use the code.'],
  ['architecture', 'Architecture', /architecture|folder structure|project structure|design decisions/i, 6, 0, 'Explain the architecture with a short diagram or folder map.'],
  ['env', 'Environment variables', /\.env|environment variable/i, 4, 0, 'Document required environment variables and provide a .env.example.'],
  ['deployment', 'Deployment guide', /deploy|hosting|docker/i, 5, 0, 'Include deployment instructions for easier project evaluation.'],
  ['api', 'API documentation', /api|endpoint|swagger|openapi/i, 3, 0, 'Document endpoints or public functions with request and response examples.'],
  ['roadmap', 'Roadmap', /roadmap|todo|planned|future/i, 2, 0, 'Add a short roadmap to show the project has direction.'],
  ['changelog', 'Changelog', /changelog|release notes/i, 2, 0, 'Keep a CHANGELOG or use GitHub Releases.'],
];
const pct = (got, all) => Math.round((got / all) * 100);

async function analyze(owner, name) {
  const [repo, tree, langs, readme] = await Promise.all([
    gh(`/repos/${owner}/${name}`), gh(`/repos/${owner}/${name}/contents`).catch(() => []),
    gh(`/repos/${owner}/${name}/languages`).catch(() => ({})), gh(`/repos/${owner}/${name}/readme`, true).catch(() => ''),
  ]);
  const files = tree.map(f => f.name.toLowerCase());
  const has = re => files.some(f => re.test(f));
  const hit = {};
  RULES.forEach(([k, , re]) => { hit[k] = re ? re.test(readme) : readme.length > 250; });
  hit.license = hit.license || !!repo.license || has(/^license/);
  hit.contributing = hit.contributing || has(/^contributing/);
  hit.changelog = hit.changelog || has(/^changelog/);
  hit.env = hit.env || has(/^\.env\.example/);
  hit.demo = hit.demo || !!repo.homepage;

  const total = RULES.reduce((s, r) => s + r[3], 0), core = RULES.filter(r => r[4]);
  const readmeScore = readme ? pct(core.filter(r => hit[r[0]]).reduce((s, r) => s + r[3], 0), core.reduce((s, r) => s + r[3], 0)) : 0;
  const docScore = pct(RULES.filter(r => hit[r[0]]).reduce((s, r) => s + r[3], 0), total);
  const signals = { tests: has(/^(test|tests|__tests__|spec)$/), ci: has(/^\.github$/), docker: has(/docker/), structure: files.length > 4 && files.some(f => /^(src|app|lib|server|client|packages)$/.test(f)), described: !!repo.description, topics: (repo.topics || []).length >= 3 };
  const sigScore = pct(Object.values(signals).filter(Boolean).length, Object.keys(signals).length);
  const portfolioScore = Math.round(readmeScore * 0.4 + docScore * 0.25 + sigScore * 0.35);
  const health = Math.round((readmeScore + docScore + portfolioScore + sigScore) / 4);
  const age = (Date.now() - new Date(repo.pushed_at)) / 864e5;
  const maturity = Math.min(100, Math.round(sigScore * 0.5 + Math.min(repo.size / 50, 25) + (age < 90 ? 15 : age < 365 ? 8 : 0) + Math.min(repo.stargazers_count * 2, 10)));

  const missing = RULES.filter(r => !hit[r[0]]);
  const showy = hit.screenshots || hit.demo;
  return {
    repo: { owner, name, description: repo.description, stars: repo.stargazers_count, forks: repo.forks_count, url: repo.html_url },
    scores: { health, readme: readmeScore, documentation: docScore, portfolio: portfolioScore, maturity },
    readiness: {
      recruiter: portfolioScore >= 65 && showy, client: portfolioScore >= 75 && hit.install && hit.deployment,
      openSource: hit.license && hit.contributing && readmeScore >= 65, internship: portfolioScore >= 50 && hit.install && hit.description,
    },
    missing: missing.map(r => r[1]),
    suggestions: [...missing].sort((a, b) => b[3] - a[3]).slice(0, 6).map(r => r[5]).concat(!signals.tests ? ['Add automated tests and a CI workflow to signal engineering discipline.'] : []),
    checklist: [...RULES.filter(r => r[4]).slice(0, 4), ...RULES.filter(r => ['architecture', 'env'].includes(r[0]))].map(r => ({ label: r[1], ok: !!hit[r[0]] }))
      .concat([{ label: 'Clean folder structure', ok: signals.structure }, { label: 'Tests or CI present', ok: signals.tests || signals.ci }, { label: 'Professional README', ok: readmeScore >= 70 }]),
    stack: Object.keys(langs).slice(0, 5),
  };
}
module.exports = { analyze };
