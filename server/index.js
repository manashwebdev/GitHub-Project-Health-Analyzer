require('dotenv').config();
const express = require('express'), cors = require('cors');
const { analyze } = require('./analyzer');
const app = express();
app.use(cors(), express.json());
app.post('/api/analyze', async (req, res) => {
  const m = /github\.com\/([\w.-]+)\/([\w.-]+?)(?:\.git)?(?:[/?#]|$)/.exec(req.body?.url || '');
  if (!m) return res.status(400).json({ error: 'Enter a URL like https://github.com/owner/repo' });
  try { res.json(await analyze(m[1], m[2])); }
  catch (e) { res.status(e.status || 500).json({ error: e.message }); }
});
app.listen(process.env.PORT || 4000, () => console.log('API on :4000'));
