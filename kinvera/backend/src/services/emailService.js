const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendPasswordResetEmail(email, resetToken) {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:8081'}/reset-password.html?token=${resetToken}`;

  const mailOptions = {
    from: `"Kinvera" <${process.env.SMTP_USER || 'noreply@kinvera.com'}>`,
    to: email,
    subject: 'Recuperação de Password - Kinvera',
    html: `
      <div style="max-width:480px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,sans-serif;background:#0A0A0A;color:#fff;padding:32px;border-radius:16px;">
        <h1 style="font-size:28px;background:linear-gradient(135deg,#FF8A00,#FF0080);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:24px;">Kinvera</h1>
        <p style="font-size:16px;color:#ccc;margin-bottom:16px;">Recebeste este email porque pediste para recuperar a tua password.</p>
        <a href="${resetUrl}" style="display:inline-block;padding:14px 28px;background:linear-gradient(135deg,#FF8A00,#FF0080);color:#fff;text-decoration:none;border-radius:12px;font-size:16px;font-weight:600;">Redefinir Password</a>
        <p style="font-size:13px;color:#888;margin-top:24px;">Este link expira em 1 hora. Se não pediste isto, ignora este email.</p>
        <p style="font-size:13px;color:#888;">O teu código de verificação: <strong style="color:#FF0080;font-size:18px;">${resetToken.substring(0, 6).toUpperCase()}</strong></p>
      </div>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log('Email sent:', info.messageId);
  return info;
}

async function sendTestEmail(to) {
  const mailOptions = {
    from: `"Kinvera" <${process.env.SMTP_USER || 'noreply@kinvera.com'}>`,
    to,
    subject: 'Teste - Kinvera',
    html: '<p>Email de teste do Kinvera!</p>',
  };
  const info = await transporter.sendMail(mailOptions);
  return info;
}

module.exports = { sendPasswordResetEmail, sendTestEmail };
