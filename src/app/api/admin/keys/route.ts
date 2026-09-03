import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const whereClause: any = {};
    if (productId && productId !== 'ALL') {
      whereClause.productId = productId;
    }
    if (status && status !== 'ALL') {
      whereClause.status = status;
    }
    if (search) {
      whereClause.key = {
        contains: search,
      };
    }

    const keys = await prisma.productKey.findMany({
      where: whereClause,
      include: {
        product: { select: { id: true, name: true, slug: true } },
        orderItem: {
          include: {
            order: { select: { orderNumber: true, customerName: true, customerEmail: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const products = await prisma.product.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ keys, products });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const data = await request.json();

    const { productId, rawKeys, singleKey } = data;

    if (!productId) {
      return NextResponse.json({ error: 'សូមជ្រើសរើសផលិតផល' }, { status: 400 });
    }

    // Bulk Import Logic
    if (rawKeys) {
      const keyLines = rawKeys
        .split('\n')
        .map((k: string) => k.trim())
        .filter((k: string) => k.length > 0);

      if (keyLines.length === 0) {
        return NextResponse.json({ error: 'គ្មាន Key ត្រឹមត្រូវដើម្បីបញ្ចូលទេ' }, { status: 400 });
      }

      const created = await prisma.$transaction(
        keyLines.map((k: string) =>
          prisma.productKey.create({
            data: {
              key: k,
              status: 'AVAILABLE',
              productId,
            },
          })
        )
      );

      // Update product stock count
      await prisma.product.update({
        where: { id: productId },
        data: { stockCount: { increment: keyLines.length } },
      });

      return NextResponse.json({
        success: true,
        count: created.length,
        message: `បានបញ្ចូល Product Keys ចំនួន ${created.length} ដោយជោគជ័យ!`,
      });
    }

    // Single Key
    if (singleKey) {
      const createdKey = await prisma.productKey.create({
        data: {
          key: singleKey.trim(),
          status: 'AVAILABLE',
          productId,
        },
      });

      await prisma.product.update({
        where: { id: productId },
        data: { stockCount: { increment: 1 } },
      });

      return NextResponse.json({
        success: true,
        key: createdKey,
        message: 'បានបន្ថែម Product Key ជោគជ័យ!',
      });
    }

    return NextResponse.json({ error: 'ទិន្នន័យមិនត្រឹមត្រូវ' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Missing key ID' }, { status: 400 });

    const key = await prisma.productKey.findUnique({ where: { id } });
    if (!key) return NextResponse.json({ error: 'រកមិនឃើញ Key' }, { status: 404 });

    if (key.status === 'SOLD') {
      return NextResponse.json(
        { error: 'មិនអាចលុប Key ដែលបានលក់រួចទៅអតិថិជនបានទេ' },
        { status: 400 }
      );
    }

    await prisma.productKey.delete({ where: { id } });

    // Decrement stock
    await prisma.product.update({
      where: { id: key.productId },
      data: { stockCount: { decrement: 1 } },
    });

    return NextResponse.json({ success: true, message: 'បានលុប Product Key ជោគជ័យ' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
