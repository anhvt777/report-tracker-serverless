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
  const { id, newDueDate, reason } = body;
  if (!id || !newDueDate) {
    res.statusCode = 400;
    return res.end(JSON.stringify({ error: 'Missing id or newDueDate' }));
  }
  const { data, error } = await supabase
    .from('reports')
    .update({ due_date: new Date(newDueDate).toISOString(), extension_reason: reason || null, reminder_sent: false })
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
