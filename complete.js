async function readJson(req) {
  return await new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk) => (data += chunk));
    req.on('end', () => {
      try { resolve(JSON.parse(data || '{}')); }
      catch { resolve({}); }
    });
  });
}

const supabase = require('../utils/supabaseClient');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.end(JSON.stringify({ error: 'Method not allowed' }));
  }
  const body = await readJson(req);
  const id = body.id;
  if (!id) {
    res.statusCode = 400;
    return res.end(JSON.stringify({ error: 'Missing id' }));
  }
  const { data, error } = await supabase
    .from('reports')
    .update({ completed: true, completion_date: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) {
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: error.message }));
  }
  res.setHeader('Content-Type', 'application/json');
  return res.end(JSON.stringify({ ok: true, report: data }));
};
