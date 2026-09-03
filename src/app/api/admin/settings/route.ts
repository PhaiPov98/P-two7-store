import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

const DEFAULT_TICKER = 'ទិញ Product Key និងទាញយក Software & Tools បានភ្លាមៗ និងងាយស្រួល។ ធានាគុណភាពស្របច្បាប់ 100% ដំណើរការទូទាត់រហ័សតាម Bakong KHQR និងប្រព័ន្ធផ្ញើជូន Product Key ស្វ័យប្រវត្តភ្លាមៗ 24/7។';

export async function GET() {
  try {
    await requireAdmin();

    const settings = await prisma.setting.findMany();
    const settingsMap: Record<string, string> = {};
    for (const s of settings) {
      settingsMap[s.key] = s.value;
    }

    if (!settingsMap['hero_ticker_text']) {
      settingsMap['hero_ticker_text'] = DEFAULT_TICKER;
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
