const supabase = require('../utils/supabaseClient');
const { sendEmail } = require('../utils/email');
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

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.end(JSON.stringify({ error: 'Method not allowed' }));
  }
  const body = await readJson(req);
  const { title, description, dueDate, assignees, leadEmail } = body;

  if (!title || !dueDate || !Array.isArray(assignees) || !assignees.length || !leadEmail) {
    res.statusCode = 400;
    return res.end(JSON.stringify({ error: 'Missing title/dueDate/assignees/leadEmail' }));
  }

  const { data, error } = await supabase
    .from('reports')
    .insert([{
      title,
      description: description || null,
      due_date: new Date(dueDate).toISOString(),
      assignees,
      lead_email: leadEmail
    }])
    .select()
    .single();

  if (error) {
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: error.message }));
  }

  const recipients = [...new Set([...assignees, leadEmail])];
  const subject = `[Phân giao báo cáo] ${title}`;
  const text = `Báo cáo: ${title}\nHạn: ${new Date(dueDate).toLocaleString()}`;
  try { await sendEmail(recipients.join(','), subject, text, `<p><b>Báo cáo:</b> ${title}</p><p><b>Hạn:</b> ${new Date(dueDate).toLocaleString()}</p>`); } catch (e) {}

  res.setHeader('Content-Type', 'application/json');
  return res.end(JSON.stringify({ ok: true, report: data }));
};
