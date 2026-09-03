import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ error: 'សូមបញ្ចូលកូដ Coupon' }, { status: 400 });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase().trim() },
    });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json({ error: 'កូដ Coupon មិនត្រឹមត្រូវ ឬត្រូវបានបិទ' }, { status: 404 });
    }

    if (coupon.expiryDate && new Date() > coupon.expiryDate) {
      return NextResponse.json({ error: 'កូដ Coupon បានផុតកំណត់ហើយ' }, { status: 400 });
    }

    return NextResponse.json({
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minSpend: coupon.minSpend,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'កំហុសបច្ចេកទេស' }, { status: 500 });
  }
}
