import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  try {
    await requireAdmin();
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatar: true,
        createdAt: true,
        _count: {
          select: {
            orders: true,
            downloads: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ users });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}

export async function PUT(request: Request) {
  try {
    await requireAdmin();
    const { id, role } = await request.json();

    if (!id || !role) return NextResponse.json({ error: 'Invalid data' }, { status: 400 });

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const currentUser = await requireAdmin();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Missing User ID' }, { status: 400 });

    if (id === currentUser.id) {
      return NextResponse.json({ error: 'មិនអាចលុបគណនី Admin ផ្ទាល់ខ្លួនដែលកំពុងប្រើប្រាស់បានទេ' }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Delete user downloads
      await tx.download.deleteMany({ where: { userId: id } });

      // 2. Delete user reviews & support tickets
      await tx.review.deleteMany({ where: { userId: id } });
      await tx.supportTicket.deleteMany({ where: { userId: id } });

      // 3. Delete user orders and payments
      const userOrders = await tx.order.findMany({
        where: { userId: id },
        select: { id: true },
      });
      const orderIds = userOrders.map((o) => o.id);

      if (orderIds.length > 0) {
        await tx.payment.deleteMany({ where: { orderId: { in: orderIds } } });
        await tx.orderItem.deleteMany({ where: { orderId: { in: orderIds } } });
        await tx.order.deleteMany({ where: { userId: id } });
      }

      // 4. Delete the user
      await tx.user.delete({ where: { id } });
    });

    return NextResponse.json({ success: true, message: 'បានលុបគណនី User ជោគជ័យ' });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: error.message || 'មិនអាចលុប User បានទេ' }, { status: 500 });
  }
}
