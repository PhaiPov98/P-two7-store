import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const revalidate = 0;

const DEFAULT_TICKER = 'ទិញ Product Key និងទាញយក Software & Tools បានភ្លាមៗ និងងាយស្រួល។ ធានាគុណភាពស្របច្បាប់ 100% ដំណើរការទូទាត់រហ័សតាម Bakong KHQR និងប្រព័ន្ធផ្ញើជូន Product Key ស្វ័យប្រវត្តភ្លាមៗ 24/7។';

export async function GET() {
  try {
    const settings = await prisma.setting.findMany();
    const settingsMap: Record<string, string> = {};
    for (const s of settings) {
      settingsMap[s.key] = s.value;
    }

    if (!settingsMap['hero_ticker_text']) {
      settingsMap['hero_ticker_text'] = DEFAULT_TICKER;
    }

    return NextResponse.json({ settings: settingsMap });
  } catch (error) {
    return NextResponse.json({
      settings: { hero_ticker_text: DEFAULT_TICKER },
    });
  }
}
