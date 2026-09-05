// Telegram Bot Alert Notification Utility

function parseDeviceAndBrowser(ua: string): { device: string; browser: string } {
  if (!ua) return { device: 'Computer', browser: 'Browser' };

  let device = 'PC / Laptop';
  if (/iPhone/i.test(ua)) device = 'iPhone (iOS)';
  else if (/iPad/i.test(ua)) device = 'iPad (iPadOS)';
  else if (/Android/i.test(ua)) device = 'Android Phone';
  else if (/Windows NT 10.0/i.test(ua)) device = 'Windows 10/11';
  else if (/Windows/i.test(ua)) device = 'Windows PC';
  else if (/Macintosh|Mac OS X/i.test(ua)) device = 'MacBook / macOS';
  else if (/Linux/i.test(ua)) device = 'Linux PC';

  let browser = 'Web Browser';
  if (/Edg\//i.test(ua)) browser = 'Edge';
  else if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua)) browser = 'Chrome';
  else if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) browser = 'Safari';
  else if (/Firefox\//i.test(ua)) browser = 'Firefox';

  return { device, browser };
}

function formatIpAddress(ip: string): string {
  if (!ip || ip === '::1' || ip === '127.0.0.1') {
    return '127.0.0.1 (Localhost)';
  }
  return ip.replace('::ffff:', '');
}

function getFormattedPhnomPenhTime(): string {
  const d = new Date();
  return d.toLocaleString('en-GB', {
    timeZone: 'Asia/Phnom_Penh',
    hour12: true,
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

let cachedTelegramUsername: string | null = null;

export async function getTelegramUsername(): Promise<string | null> {
  if (cachedTelegramUsername) return cachedTelegramUsername;

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) return null;

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/getChat?chat_id=${chatId}`);
    if (res.ok) {
      const data = await res.json();
      if (data.ok && data.result?.username) {
        cachedTelegramUsername = `@${data.result.username}`;
        return cachedTelegramUsername;
      }
    }
  } catch (e) {
    console.error('Failed to get Telegram username:', e);
  }

  return null;
}

export async function sendTelegramNotification(message: string): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    return false;
  }

  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });

    return res.ok;
  } catch (err) {
    console.error('Telegram notification failed:', err);
    return false;
  }
}

export async function sendAdminLoginAlert(params: {
  email: string;
  name: string;
  ip: string;
  userAgent: string;
}) {
  const time = getFormattedPhnomPenhTime();
  const { device, browser } = parseDeviceAndBrowser(params.userAgent);
  const cleanIp = formatIpAddress(params.ip);
  const tgUser = await getTelegramUsername();

  const text = `
🚨 <b>ADMIN LOGIN ALERT</b>
━━━━━━━━━━━━━━━━━━━━
• <b>Admin:</b> <code>${params.name}</code> ${tgUser ? `(${tgUser})` : ''}
• <b>Email:</b> <code>${params.email}</code>
• <b>ឧបករណ៍:</b> ${device} (${browser})
• <b>IP Address:</b> <code>${cleanIp}</code>
• <b>ពេលវេលា:</b> ${time}
━━━━━━━━━━━━━━━━━━━━
⚠️ <i>ប្រសិនបើមិនមែនជាអ្នក Login សូមចុចខាងក្រោម៖</i>
🔐 <a href="http://localhost:3000/admin/profile"><b>ចូលទៅប្តូរ Password ភ្លាម</b></a>
  `.trim();

  return await sendTelegramNotification(text);
}

export async function sendAdminSecurityChangeAlert(params: {
  email: string;
  name: string;
  changedPassword: boolean;
  changedEmail: boolean;
  ip: string;
  userAgent: string;
}) {
  const time = getFormattedPhnomPenhTime();
  const { device, browser } = parseDeviceAndBrowser(params.userAgent);
  const cleanIp = formatIpAddress(params.ip);
  const tgUser = await getTelegramUsername();

  const changes: string[] = [];
  if (params.changedPassword) changes.push('• <b>ពាក្យសម្ងាត់:</b> បានផ្លាស់ប្តូរថ្មី (Password Changed)');
  if (params.changedEmail) changes.push(`• <b>Email ថ្មី:</b> <code>${params.email}</code>`);
  if (changes.length === 0) changes.push('• <b>Profile:</b> បានកែប្រែព័ត៌មាន');

  const text = `
🛡️ <b>ADMIN SECURITY UPDATE</b>
━━━━━━━━━━━━━━━━━━━━
• <b>Admin:</b> <code>${params.name}</code> ${tgUser ? `(${tgUser})` : ''}
${changes.join('\n')}
• <b>ឧបករណ៍:</b> ${device} (${browser})
• <b>IP Address:</b> <code>${cleanIp}</code>
• <b>ពេលវេលា:</b> ${time}
━━━━━━━━━━━━━━━━━━━━
✅ <i>ការកែប្រែសុវត្ថិភាពត្រូវបានរក្សាទុកដោយជោគជ័យ។</i>
  `.trim();

  return await sendTelegramNotification(text);
}

export async function sendBruteForceAlert(params: {
  email: string;
  ip: string;
  userAgent: string;
  attempts: number;
}) {
  const time = getFormattedPhnomPenhTime();
  const { device, browser } = parseDeviceAndBrowser(params.userAgent);
  const cleanIp = formatIpAddress(params.ip);
  const tgUser = await getTelegramUsername();

  const text = `
🚨 <b>BRUTE-FORCE ATTACK DETECTED!</b>
━━━━━━━━━━━━━━━━━━━━
• <b>Email គោលដៅ:</b> <code>${params.email}</code> ${tgUser ? `(${tgUser})` : ''}
• <b>ការប៉ុនប៉ង:</b> <b>${params.attempts} ដងខុសជាប់គ្នា</b>
• <b>ឧបករណ៍ Attacker:</b> ${device} (${browser})
• <b>IP Address:</b> <code>${cleanIp}</code>
• <b>ស្ថានភាព:</b> 🔒 <b>បានចាក់សោ IP រយៈពេល ១៥ នាទី</b>
• <b>ពេលវេលា:</b> ${time}
━━━━━━━━━━━━━━━━━━━━
⚠️ <i>មានជនសង្ស័យកំពុងព្យាយាមទាយ Password គណនីរបស់អ្នក!</i>
🔐 <a href="http://localhost:3000/admin/profile"><b>ចូលទៅពិនិត្យសុវត្ថិភាព Admin</b></a>
  `.trim();

  return await sendTelegramNotification(text);
}

export async function sendTelegramPhoto(params: {
  photo: string; // base64 data URL or HTTP URL
  caption: string;
}): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    return false;
  }

  try {
    if (params.photo.startsWith('data:image/')) {
      // Extract base64 and mime
      const match = params.photo.match(/^data:(image\/[a-zA-Z0-9.+]+);base64,(.+)$/);
      if (match) {
        const mimeType = match[1];
        const base64Data = match[2];
        const buffer = Buffer.from(base64Data, 'base64');
        const blob = new Blob([buffer], { type: mimeType });

        const formData = new FormData();
        formData.append('chat_id', chatId);
        formData.append('photo', blob, 'payment_slip.jpg');
        formData.append('caption', params.caption);
        formData.append('parse_mode', 'HTML');

        const res = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
          method: 'POST',
          body: formData,
        });
        return res.ok;
      }
    }

    // Direct URL
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        photo: params.photo,
        caption: params.caption,
        parse_mode: 'HTML',
      }),
    });
    return res.ok;
  } catch (err) {
    console.error('Telegram photo notification failed:', err);
    return false;
  }
}

export async function sendNewOrderAlert(params: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  total: number;
  paymentMethod: string;
  paymentSlip?: string | null;
  items: Array<{ name: string; quantity: number }>;
}) {
  const time = getFormattedPhnomPenhTime();
  const itemList = params.items.map((i) => `  ▫️ ${i.name} (x${i.quantity})`).join('\n');
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const caption = `
🛍️ <b>NEW ORDER RECEIVED! (#${params.orderNumber})</b>
━━━━━━━━━━━━━━━━━━━━
• <b>អតិថិជន:</b> <code>${params.customerName}</code>
• <b>Email:</b> <code>${params.customerEmail}</code>
${params.customerPhone ? `• <b>ទូរស័ព្ទ:</b> <code>${params.customerPhone}</code>\n` : ''}• <b>វិធីទូទាត់:</b> <b>${params.paymentMethod}</b>
• <b>ទឹកប្រាក់សរុប:</b> <b>$${params.total.toFixed(2)}</b> (~៛${Math.round(params.total * 4100).toLocaleString()})
• <b>ទំនិញបញ្ជាទិញ:</b>
${itemList}
• <b>បង្កាន់ដៃ Slip:</b> ${params.paymentSlip ? '✅ បានភ្ជាប់ Slip ខាងលើ' : '⚠️ មិនមានរូបភាព Slip ទេ'}
• <b>ពេលវេលា:</b> ${time}
━━━━━━━━━━━━━━━━━━━━
👉 <a href="${appUrl}/admin/orders"><b>ពិនិត្យ & ផ្ទៀងផ្ទាត់ Order ក្នុង Dashboard</b></a>
  `.trim();

  if (params.paymentSlip) {
    const photoSent = await sendTelegramPhoto({
      photo: params.paymentSlip,
      caption,
    });
    if (photoSent) return true;
  }

  return await sendTelegramNotification(caption);
}

export async function sendPasswordResetAlert(params: {
  email: string;
  name: string;
  resetUrl: string;
  ip: string;
  userAgent: string;
}) {
  const time = getFormattedPhnomPenhTime();
  const { device, browser } = parseDeviceAndBrowser(params.userAgent);
  const cleanIp = formatIpAddress(params.ip);

  const text = `
🔑 <b>PASSWORD RESET REQUEST</b>
━━━━━━━━━━━━━━━━━━━━
• <b>គណនី:</b> <code>${params.name}</code>
• <b>Email:</b> <code>${params.email}</code>
• <b>ឧបករណ៍:</b> ${device} (${browser})
• <b>IP Address:</b> <code>${cleanIp}</code>
• <b>ពេលវេលា:</b> ${time}
━━━━━━━━━━━━━━━━━━━━
👉 <a href="${params.resetUrl}"><b>ចុចត្រង់នេះដើម្បីកំណត់ Password ថ្មី</b></a>
<i>(Link នេះមានសុពលភាពរយៈពេល ៣០ នាទី)</i>
  `.trim();

  return await sendTelegramNotification(text);
}

