import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    const user = await requireAuth();

    const keys = await prisma.productKey.findMany({
      where: {
        orderItem: {
          order: { userId: user.id },
        },
      },
      include: {
        product: {
          select: { id: true, name: true, slug: true, version: true, downloadUrl: true, file: true },
        },
        orderItem: {
          include: {
            order: { select: { orderNumber: true, createdAt: true } },
          },
        },
      },
      orderBy: { soldAt: 'desc' },
    });

    return NextResponse.json({ keys });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
