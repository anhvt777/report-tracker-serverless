const supabase = require('../utils/supabaseClient');
const { sendEmail } = require('../utils/email');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    return res.end(JSON.stringify({ error: 'Method not allowed' }));
  }
  try {
    const now = new Date();
    const future = new Date(now.getTime() + 3 * 60 * 60 * 1000);
    // Get incomplete tasks
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('completed', false)
      .lte('due_date', future.toISOString())
      .gte('due_date', now.toISOString())
      .eq('reminder_sent', false);

    if (error) throw error;
    const list = data || [];
    for (const r of list) {
      const recipients = [...new Set([...(r.assignees || []), r.lead_email])];
      const subject = `[Sắp đến hạn 3h] ${r.title}`;
      const text = `Báo cáo: ${r.title}\nHạn: ${new Date(r.due_date).toLocaleString()}`;
      try { await sendEmail(recipients.join(','), subject, text, `<p><b>Báo cáo:</b> ${r.title}</p><p><b>Hạn:</b> ${new Date(r.due_date).toLocaleString()}</p>`); } catch (e) {}
      await supabase.from('reports').update({ reminder_sent: true }).eq('id', r.id);
    }
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ ok: true, reminded: list.length }));
  } catch (e) {
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: e.message }));
  }
};
