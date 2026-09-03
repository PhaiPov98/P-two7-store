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

export async function DELETE(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Missing Order ID' }, { status: 400 });

    await prisma.$transaction(async (tx) => {
      // 1. Delete payments related to this order
      await tx.payment.deleteMany({ where: { orderId: id } });

      // 2. Unlink any product keys assigned to this order's items
      const items = await tx.orderItem.findMany({
        where: { orderId: id },
        select: { id: true },
      });
      const itemIds = items.map((i) => i.id);

      if (itemIds.length > 0) {
        await tx.productKey.updateMany({
          where: { orderItemId: { in: itemIds } },
          data: { orderItemId: null, status: 'AVAILABLE', soldAt: null },
        });
      }

      // 3. Delete order items
      await tx.orderItem.deleteMany({ where: { orderId: id } });

      // 4. Delete the order
      await tx.order.delete({ where: { id } });
    });

    return NextResponse.json({ success: true, message: 'បានលុបការបញ្ជាទិញជោគជ័យ' });
  } catch (error: any) {
    console.error('Error deleting order:', error);
    return NextResponse.json({ error: error.message || 'មិនអាចលុបការបញ្ជាទិញបានទេ' }, { status: 500 });
  }
}

