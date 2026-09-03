import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  try {
    await requireAdmin();
    const orders = await prisma.order.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        items: {
          include: {
            key: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ orders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}

export async function PUT(request: Request) {
  try {
    await requireAdmin();
    const { id, orderStatus, paymentStatus } = await request.json();

    if (!id) return NextResponse.json({ error: 'Missing Order ID' }, { status: 400 });

    const order = await prisma.order.update({
      where: { id },
      data: {
        orderStatus: orderStatus || undefined,
        paymentStatus: paymentStatus || undefined,
      },
    });

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
