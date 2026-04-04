const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

/**
 * Kirim email reset password
 * @param {{ to: string, name: string, resetUrl: string }} param
 */
const sendResetPasswordEmail = async ({ to, name, resetUrl }) => {
    const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8"/>
    <style>
      body{font-family:'Segoe UI',sans-serif;background:#f1f5f9;margin:0;padding:30px}
      .card{max-width:480px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)}
      .hdr{background:linear-gradient(135deg,#2563eb,#1d4ed8);padding:36px 32px;text-align:center}
      .hdr h1{color:#fff;margin:0;font-size:20px;font-weight:800;letter-spacing:-.3px}
      .hdr p{color:#bfdbfe;margin:6px 0 0;font-size:13px}
      .body{padding:32px}
      .body p{color:#475569;line-height:1.7;margin:0 0 16px;font-size:14px}
      .btn{display:block;text-align:center;background:#2563eb;color:#fff!important;padding:14px 24px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;margin:24px 0}
      .note{font-size:12px;color:#94a3b8;margin-top:8px}
      .url{word-break:break-all;font-size:11px;color:#94a3b8;background:#f8fafc;padding:10px;border-radius:8px;margin-top:8px}
      .footer{padding:20px 32px;border-top:1px solid #f1f5f9;text-align:center}
      .footer p{color:#94a3b8;font-size:11px;margin:0}
    </style>
  </head>
  <body>
    <div class="card">
      <div class="hdr">
        <h1>🔐 Reset Password</h1>
        <p>Cashier App · Permintaan reset password</p>
      </div>
      <div class="body">
        <p>Halo <strong>${name}</strong>,</p>
        <p>Kami menerima permintaan untuk mereset password akun kamu. Klik tombol di bawah untuk melanjutkan:</p>
        <a href="${resetUrl}" class="btn">Reset Password Sekarang</a>
        <p class="note">⏰ Link ini akan kedaluwarsa dalam <strong>1 jam</strong>.</p>
        <p class="note">Jika kamu tidak meminta reset password, abaikan email ini — akun kamu tetap aman.</p>
        <p class="note">Atau copy URL ini ke browser:</p>
        <div class="url">${resetUrl}</div>
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} Cashier App. All rights reserved.</p>
      </div>
    </div>
  </body>
  </html>
  `;

    await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to,
        subject: "Reset Password - Cashier App",
        html,
    });
};

module.exports = { sendResetPasswordEmail };