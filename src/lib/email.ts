import nodemailer from 'nodemailer';

interface SendPasswordResetEmailParams {
  to: string;
  name: string;
  resetUrl: string;
}

export async function sendPasswordResetEmail({ to, name, resetUrl }: SendPasswordResetEmailParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const resendApiKey = process.env.RESEND_API_KEY;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = Number(process.env.SMTP_PORT) || 465;
  const emailFrom = process.env.EMAIL_FROM || '"P-Two7 Store" <onboarding@resend.dev>';

  const htmlContent = `
<!DOCTYPE html>
<html lang="km">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>កំណត់ពាក្យសម្ងាត់ឡើងវិញ - P-Two7 Store</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Kantumruy Pro', 'Battambang', Arial, sans-serif;
      color: #1e293b;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #f1f5f9;
      padding: 40px 15px;
    }
    .card {
      max-width: 520px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
      border: 1px solid #e2e8f0;
    }
    .header {
      background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
      padding: 35px 30px;
      text-align: center;
      color: #ffffff;
    }
    .brand-title {
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #bfdbfe;
      margin-bottom: 8px;
    }
    .main-title {
      margin: 0;
      font-size: 24px;
      font-weight: 800;
      color: #ffffff;
    }
    .content {
      padding: 35px 32px;
    }
    .greeting {
      font-size: 17px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 12px;
    }
    .text-desc {
      font-size: 15px;
      line-height: 1.7;
      color: #475569;
      margin: 0 0 28px;
    }
    .user-pill {
      display: inline-block;
      background: #eff6ff;
      border: 1px solid #dbeafe;
      color: #1d4ed8;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 6px;
    }
    .btn-container {
      text-align: center;
      margin: 30px 0;
    }
    .btn-reset {
      display: inline-block;
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      color: #ffffff !important;
      text-decoration: none;
      font-weight: 700;
      font-size: 16px;
      padding: 16px 36px;
      border-radius: 12px;
      box-shadow: 0 8px 20px rgba(37, 99, 235, 0.35);
    }
    .warning-box {
      background: #fefce8;
      border: 1px solid #fef08a;
      border-left: 4px solid #eab308;
      border-radius: 10px;
      padding: 14px 16px;
      margin-top: 25px;
      font-size: 13px;
      color: #854d0e;
      line-height: 1.6;
    }
    .footer {
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      padding: 22px 30px;
      text-align: center;
      font-size: 12px;
      color: #64748b;
    }
    .footer-brand {
      font-weight: 700;
      color: #334155;
      margin-bottom: 4px;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <!-- Header -->
      <div class="header">
        <div class="brand-title">P-TWO7 STORE</div>
        <h1 class="main-title">🔑 កំណត់ពាក្យសម្ងាត់ឡើងវិញ</h1>
      </div>

      <!-- Content -->
      <div class="content">
        <div class="greeting">សួស្តី ${name},</div>
        <p class="text-desc">
          យើងបានទទួលសំណើសុំផ្លាស់ប្ដូរពាក្យសម្ងាត់សម្រាប់គណនី <span class="user-pill">${to}</span>។<br><br>
          សូមចុចប៊ូតុងខាងក្រោម ដើម្បីកំណត់ពាក្យសម្ងាត់ថ្មី៖
        </p>

        <!-- CTA Button -->
        <div class="btn-container">
          <a href="${resetUrl}" class="btn-reset" target="_blank">
            កំណត់ពាក្យសម្ងាត់ថ្មី (Reset Password)
          </a>
        </div>

        <!-- Security Notice -->
        <div class="warning-box">
          ⏰ <b>ចំណាំ៖</b> Link នេះមានសុពលភាពត្រឹមតែ <b>៣០ នាទី</b> ប៉ុណ្ណោះ។<br>
          ប្រសិនបើមិនមែនជាអ្នកស្នើសុំទេ សូមកុំចុច ឬចែករំលែក Link នេះទៅកាន់អ្នកដទៃ។
        </div>
      </div>

      <!-- Footer -->
      <div class="footer">
        <div class="footer-brand">P-Two7 Store</div>
        <div>© ${new Date().getFullYear()} P-Two7 Store. រក្សាសិទ្ធិគ្រប់យ៉ាង។</div>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();

  // 1. Method A: Resend API (Clean, professional, hides personal Gmail)
  if (resendApiKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey.trim()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: emailFrom,
          to: [to],
          subject: '🔐 ផ្ទៀងផ្ទាត់ និងកំណត់ពាក្យសម្ងាត់ថ្មី (Verify & Reset Password)',
          html: htmlContent,
        }),
      });

      const resData = await res.json();
      if (res.ok) {
        console.log('✅ Email sent via Resend API successfully! ID:', resData.id);
        return { success: true, messageId: resData.id };
      } else {
        console.error('❌ Resend API error response:', resData);
      }
    } catch (err: any) {
      console.error('❌ Resend API network error:', err);
    }
  }

  // 2. Method B: Fallback to SMTP
  if (smtpUser && smtpPass) {
    try {
      const cleanPass = smtpPass.replace(/\s+/g, '');
      const cleanUser = smtpUser.trim();
      const isGmail = smtpHost.includes('gmail.com');

      const transporter = nodemailer.createTransport(
        isGmail
          ? {
              service: 'gmail',
              auth: {
                user: cleanUser,
                pass: cleanPass,
              },
            }
          : {
              host: smtpHost,
              port: smtpPort,
              secure: smtpPort === 465,
              auth: {
                user: cleanUser,
                pass: cleanPass,
              },
            }
      );

      const senderAddress = emailFrom || `"P-Two7 Store" <${cleanUser}>`;

      const info = await transporter.sendMail({
        from: senderAddress,
        to,
        subject: 'P-Two7 Store: កំណត់ពាក្យសម្ងាត់ឡើងវិញ (Reset Password)',
        html: htmlContent,
      });

      console.log('✅ Email sent via SMTP successfully:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (err: any) {
      console.error('❌ SMTP delivery failed:', err);
      return { success: false, error: err.message };
    }
  }

  return { success: false, error: 'No email service configured' };
}
