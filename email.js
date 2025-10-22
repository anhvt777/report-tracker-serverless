const nodemailer = require('nodemailer');

let transporter;
function getTransporter() {
  if (!transporter) {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const secure = String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true';

    if (!host || !user || !pass) {
      console.warn('[email] Missing SMTP_HOST/SMTP_USER/SMTP_PASS env vars.');
    }
    transporter = nodemailer.createTransport({ host, port, secure, auth: { user, pass } });
  }
  return transporter;
}

async function sendEmail(to, subject, text, html) {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const mailer = getTransporter();
  return await mailer.sendMail({ from, to, subject, text, html });
}

module.exports = { sendEmail };
