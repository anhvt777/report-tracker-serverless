const supabase = require('../utils/supabaseClient');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    return res.end(JSON.stringify({ error: 'Method not allowed' }));
  }
  const url = new URL(req.url, 'http://localhost');
  const email = url.searchParams.get('email');
  try {
    let query = supabase.from('reports').select('*').order('due_date', { ascending: true });
    if (email) {
      // filter: assignees json array contains the email OR lead_email == email
      query = query.or(`assignees.cs.["${email}"],lead_email.eq.${email}`);
    }
    const { data, error } = await query;
    if (error) throw error;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ reports: data || [] }));
  } catch (e) {
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: e.message }));
  }
};
