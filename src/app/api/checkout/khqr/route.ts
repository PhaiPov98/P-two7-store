import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateBakongKHQR } from '@/lib/khqr';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, currency = 'USD', billNumber } = body;

    if (amount === undefined || amount === null || typeof amount !== 'number' || amount < 0) {
      return NextResponse.json({ error: 'ចំនួនទឹកប្រាក់មិនត្រឹមត្រូវ (Invalid amount)' }, { status: 400 });
    }

    // Load custom Bakong settings from DB if configured
    let bakongAccountId = process.env.BAKONG_ACCOUNT_ID || 'abaakhppxxx@abaa';
    let merchantName = process.env.BAKONG_MERCHANT_NAME || 'POV PHAI';
    let merchantCity = process.env.BAKONG_MERCHANT_CITY || 'Phnom Penh';
    let bankName = 'ABA Bank';
    let accountNumber = '007 576 225';
    let accountName = 'POV PHAI';
    let abaPayLink = 'https://pay.ababank.com/oRF8/5ipp0sa2';

    try {
      const dbSettings = await prisma.setting.findMany({
        where: {
          key: {
            in: [
              'bakong_account_id',
              'bakong_merchant_name',
              'bakong_merchant_city',
              'payment_bank_name',
              'payment_account_number',
              'payment_account_name',
              'aba_pay_link',
            ],
          },
        },
      });

      for (const s of dbSettings) {
        if (s.key === 'bakong_account_id' && s.value) bakongAccountId = s.value;
        if (s.key === 'bakong_merchant_name' && s.value) merchantName = s.value;
        if (s.key === 'bakong_merchant_city' && s.value) merchantCity = s.value;
        if (s.key === 'payment_bank_name' && s.value) bankName = s.value;
        if (s.key === 'payment_account_number' && s.value) accountNumber = s.value;
        if (s.key === 'payment_account_name' && s.value) accountName = s.value;
        if (s.key === 'aba_pay_link' && s.value) abaPayLink = s.value;
      }
    } catch (e) {
      console.warn('Could not read DB settings for KHQR, using defaults/env');
    }

    const khqrResult = await generateBakongKHQR({
      bakongAccountId,
      merchantName,
      merchantCity,
      amount,
      currency,
      billNumber,
      expirationMinutes: 15,
    });

    return NextResponse.json({
      success: true,
      ...khqrResult,
      bankName,
      accountNumber,
      accountName,
      abaPayLink,
    });
  } catch (error: any) {
    console.error('KHQR generation error:', error);
    return NextResponse.json(
      { error: error.message || 'មិនអាចបង្កើត Bakong KHQR បានទេ' },
      { status: 500 }
    );
  }
}
