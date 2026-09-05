import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get('orderNumber');

    if (!orderNumber) {
      return NextResponse.json({ paid: false, error: 'Missing orderNumber' }, { status: 400 });
    }

    // Strictly check THIS specific order only
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: true,
      },
    });

    if (!order || order.paymentStatus !== 'PAID') {
      return NextResponse.json({ paid: false });
    }

    // Order is PAID! Retrieve allocated keys
    const orderItemIds = order.items.map((i) => i.id);
    const keyAllocations = await prisma.productKey.findMany({
      where: { orderItemId: { in: orderItemIds } },
      include: { product: true },
    });

    const allocatedKeys = keyAllocations.map((k) => ({
      productName: k.product.name,
      key: k.key,
    }));

    // Retrieve attached file downloads
    const productIds = order.items.map((i) => i.productId).filter(Boolean) as string[];
    const productsWithDownloads = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { file: true },
    });

    const downloads: Array<{
      productId: string;
      productName: string;
      fileName: string;
      fileType: string;
      fileSize: string;
      downloadUrl: string;
      version?: string;
    }> = [];

    for (const prod of productsWithDownloads) {
      if (prod.file) {
        downloads.push({
          productId: prod.id,
          productName: prod.name,
          fileName: prod.file.title,
          fileType: prod.file.fileType || 'EXE',
          fileSize: prod.file.fileSize || 'Direct',
          downloadUrl: `/api/download/${prod.file.id}`,
          version: prod.file.version || prod.version || '1.0',
        });
      } else if (prod.downloadUrl) {
        downloads.push({
          productId: prod.id,
          productName: prod.name,
          fileName: prod.name,
          fileType: prod.platform || 'EXE',
          fileSize: 'Cloud',
          downloadUrl: prod.downloadUrl,
          version: prod.version || '1.0',
        });
      }
    }

    return NextResponse.json({
      paid: true,
      orderNumber: order.orderNumber,
      total: order.total,
      allocatedKeys,
      downloads,
    });
  } catch (error: any) {
    return NextResponse.json({ paid: false, error: error?.message }, { status: 500 });
  }
}
