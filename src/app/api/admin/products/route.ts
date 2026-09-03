import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  try {
    await requireAdmin();
    const products = await prisma.product.findMany({
      include: {
        category: true,
        file: true,
        _count: {
          select: {
            keys: { where: { status: 'AVAILABLE' } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ products });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const data = await request.json();

    let baseSlug = (data.slug || data.name || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (!baseSlug) {
      baseSlug = `prod-${Date.now().toString(36)}`;
    }

    let slug = baseSlug;
    let count = 1;
    while (await prisma.product.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${count}`;
      count++;
    }

    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug,
        description: data.description || '',
        shortDesc: data.shortDesc || '',
        price: parseFloat(data.price),
        comparePrice: data.comparePrice ? parseFloat(data.comparePrice) : null,
        discountPercent: data.discountPercent ? parseInt(data.discountPercent) : null,
        images: data.images || 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&auto=format&fit=crop&q=80',
        categoryId: data.categoryId,
        version: data.version || null,
        platform: data.platform || 'Windows',
        systemRequirements: data.systemRequirements || '',
        features: data.features || '',
        downloadUrl: data.downloadUrl || null,
        fileId: data.fileId || null,
        isFeatured: Boolean(data.isFeatured),
        isBestSeller: Boolean(data.isBestSeller),
        isActive: Boolean(data.isActive ?? true),
      },
      include: {
        file: true,
        category: true,
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await requireAdmin();
    const data = await request.json();
    const { id, ...updateData } = data;

    if (!id) return NextResponse.json({ error: 'Missing product ID' }, { status: 400 });

    let updatedSlug = updateData.slug ? updateData.slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') : undefined;
    if (updatedSlug) {
      let slugCandidate = updatedSlug;
      let count = 1;
      while (true) {
        const existing = await prisma.product.findFirst({
          where: { slug: slugCandidate, NOT: { id } },
        });
        if (!existing) {
          updatedSlug = slugCandidate;
          break;
        }
        slugCandidate = `${updatedSlug}-${count}`;
        count++;
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: updateData.name,
        ...(updatedSlug ? { slug: updatedSlug } : {}),
        description: updateData.description,
        shortDesc: updateData.shortDesc,
        price: parseFloat(updateData.price),
        comparePrice: updateData.comparePrice ? parseFloat(updateData.comparePrice) : null,
        discountPercent: updateData.discountPercent ? parseInt(updateData.discountPercent) : null,
        images: updateData.images,
        categoryId: updateData.categoryId,
        version: updateData.version,
        platform: updateData.platform,
        systemRequirements: updateData.systemRequirements,
        features: updateData.features,
        downloadUrl: updateData.downloadUrl !== undefined ? updateData.downloadUrl : undefined,
        fileId: updateData.fileId !== undefined ? (updateData.fileId || null) : undefined,
        isFeatured: Boolean(updateData.isFeatured),
        isBestSeller: Boolean(updateData.isBestSeller),
        isActive: Boolean(updateData.isActive),
      },
      include: {
        file: true,
        category: true,
      },
    });

    return NextResponse.json({ success: true, product });
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

    await prisma.$transaction(async (tx) => {
      // 1. Delete associated reviews
      await tx.review.deleteMany({ where: { productId: id } });

      // 2. Unlink OrderItems pointing to this product
      await tx.orderItem.updateMany({
        where: { productId: id },
        data: { productId: null },
      });

      // 3. Delete ProductKeys (keys might have orderItemId set, so clear or delete)
      await tx.productKey.deleteMany({ where: { productId: id } });

      // 4. Delete the product itself
      await tx.product.delete({ where: { id } });
    });

    return NextResponse.json({ success: true, message: 'បានលុបផលិតផលជោគជ័យ' });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: error.message || 'មិនអាចលុបផលិតផលបានទេ' }, { status: 500 });
  }
}
