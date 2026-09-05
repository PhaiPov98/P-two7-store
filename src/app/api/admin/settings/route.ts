import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { sendTelegramNotification } from '@/lib/telegram';

const DEFAULT_SETTINGS: Record<string, string> = {
  hero_ticker_text: 'ទិញ Product Key និងទាញយក Software & Tools បានភ្លាមៗ និងងាយស្រួល។ ធានាគុណភាពស្របច្បាប់ 100% ដំណើរការទូទាត់រហ័សតាម Bakong KHQR និងប្រព័ន្ធផ្ញើជូន Product Key ស្វ័យប្រវត្តភ្លាមៗ 24/7។',
  bakong_account_id: 'phaipov@abaa',
  bakong_merchant_name: 'P-TWO7 STORE',
  bakong_merchant_city: 'Phnom Penh',
  payment_bank_name: 'ABA Bank',
  payment_account_number: '000 123 456',
  payment_account_name: 'PHAI POV',
  payment_auto_fulfill: 'true',
};

export async function GET() {
  try {
    await requireAdmin();

    const settings = await prisma.setting.findMany();
    const settingsMap: Record<string, string> = { ...DEFAULT_SETTINGS };
    for (const s of settings) {
      settingsMap[s.key] = s.value;
    }

    return NextResponse.json({ settings: settingsMap });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();

    // Check if testing telegram
    if (body.action === 'TEST_TELEGRAM') {
      const sent = await sendTelegramNotification(
        `🔔 <b>TEST NOTIFICATION</b>\n━━━━━━━━━━━━━━━━━━━━\n✅ Telegram Bot is connected and working perfectly with <b>${body.merchantName || 'P-TWO7 STORE'}</b>!\n⏰ ពេលវេលា: ${new Date().toLocaleString('en-GB', { timeZone: 'Asia/Phnom_Penh' })}`
      );
      if (!sent) {
        return NextResponse.json({ error: 'Failed to send Telegram message. Please check your BOT TOKEN & CHAT ID.' }, { status: 400 });
      }
      return NextResponse.json({ success: true, message: 'Telegram message sent successfully!' });
    }

    // Support bulk settings update
    if (body.settings && typeof body.settings === 'object') {
      const entries = Object.entries(body.settings);
      for (const [key, val] of entries) {
        if (key) {
          await prisma.setting.upsert({
            where: { key },
            update: { value: String(val ?? '') },
            create: { key, value: String(val ?? '') },
          });
        }
      }
      return NextResponse.json({ success: true, message: 'បានរក្សាទុកការកំណត់ទាំងអស់ជោគជ័យ!' });
    }

    // Single key update
    const { key, value } = body;
    if (!key) {
      return NextResponse.json({ error: 'Missing setting key' }, { status: 400 });
    }

    const setting = await prisma.setting.upsert({
      where: { key },
      update: { value: value || '' },
      create: { key, value: value || '' },
    });

    return NextResponse.json({ success: true, setting });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
