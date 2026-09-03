import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  try {
    await requireAdmin();
    const coupons = await prisma.coupon.findMany({
      orderBy: { code: 'asc' },
    });
    return NextResponse.json({ coupons });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const data = await request.json();

    const coupon = await prisma.coupon.create({
      data: {
        code: data.code.toUpperCase().trim(),
        discountType: data.discountType || 'PERCENT',
        discountValue: parseFloat(data.discountValue),
        minSpend: data.minSpend ? parseFloat(data.minSpend) : null,
        maxDiscount: data.maxDiscount ? parseFloat(data.maxDiscount) : null,
        isActive: Boolean(data.isActive ?? true),
      },
    });

    return NextResponse.json({ success: true, coupon });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    await prisma.coupon.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'បានលុប Coupon ជោគជ័យ' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
