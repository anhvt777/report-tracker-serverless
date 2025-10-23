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
const { sendEmail } = require('../utils/email');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.end(JSON.stringify({ error: 'Method not allowed' }));
  }
  const body = await readJson(req);
  const id = body.id || null;
  try {
    let query = supabase.from('reports').select('*');
    if (id) query = query.eq('id', id);
    const { data, error } = await query;
    if (error) throw error;
    const list = data || [];
    for (const r of list) {
      const recipients = [...new Set([...(r.assignees||[]), r.lead_email])];
      const subject = `[Nhắc việc] ${r.title}`;
      const text = `Báo cáo: ${r.title}\nHạn: ${new Date(r.due_date).toLocaleString()}`;
      try { await sendEmail(recipients.join(','), subject, text, `<p><b>Báo cáo:</b> ${r.title}</p><p><b>Hạn:</b> ${new Date(r.due_date).toLocaleString()}</p>`); } catch (e) {}
    }
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ ok: true, count: list.length }));
  } catch (e) { 
    res.statusCode = 500; 
    return res.end(JSON.stringify({ error: e.message })); 
  }
};
