import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true, files: true },
        },
      },
      orderBy: { nameKm: 'asc' },
    });
    return NextResponse.json({ categories });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const data = await request.json();
    const nameKm = data.nameKm?.trim() || '';
    const nameEn = data.nameEn?.trim() || nameKm;
    
    let slug = data.slug?.trim();
    if (!slug) {
      if (data.nameEn?.trim()) {
        slug = data.nameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      }
      if (!slug) {
        slug = `cat-${Date.now().toString(36)}`;
      }
    }

    const category = await prisma.category.create({
      data: {
        nameKm,
        nameEn,
        slug,
        description: data.description || '',
        icon: data.icon || 'Folder',
      },
    });

    return NextResponse.json({ success: true, category });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await requireAdmin();
    const data = await request.json();
    const { id, nameKm, nameEn, slug, description, icon } = data;

    if (!id) {
      return NextResponse.json({ error: 'Missing Category ID' }, { status: 400 });
    }

    const finalNameKm = nameKm?.trim() || '';
    const finalNameEn = nameEn?.trim() || finalNameKm;

    let updatedSlug = slug?.trim();
    if (!updatedSlug) {
      if (nameEn?.trim()) {
        updatedSlug = nameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      }
      if (!updatedSlug) {
        updatedSlug = `cat-${Date.now().toString(36)}`;
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        nameKm: finalNameKm,
        nameEn: finalNameEn,
        slug: updatedSlug,
        description: description || '',
        icon: icon || 'Folder',
      },
    });

    return NextResponse.json({ success: true, category });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing Category ID' }, { status: 400 });
    }

    // Safely clean up associated products, keys, reviews and files within a transaction
    await prisma.$transaction(async (tx) => {
      // 1. Find all products in this category
      const products = await tx.product.findMany({
        where: { categoryId: id },
        select: { id: true },
      });
      const productIds = products.map((p) => p.id);

      if (productIds.length > 0) {
        // Delete related reviews and keys
        await tx.review.deleteMany({ where: { productId: { in: productIds } } });
        await tx.productKey.deleteMany({ where: { productId: { in: productIds } } });
        await tx.product.deleteMany({ where: { id: { in: productIds } } });
      }

      // 2. Find all files in this category
      const files = await tx.file.findMany({
        where: { categoryId: id },
        select: { id: true },
      });
      const fileIds = files.map((f) => f.id);

      if (fileIds.length > 0) {
        await tx.download.deleteMany({ where: { fileId: { in: fileIds } } });
        await tx.file.deleteMany({ where: { id: { in: fileIds } } });
      }

      // 3. Delete the category itself
      await tx.category.delete({ where: { id } });
    });

    return NextResponse.json({ success: true, message: 'បានលុប Category ជោគជ័យ' });
  } catch (error: any) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: error.message || 'មិនអាចលុបបានទេ' }, { status: 500 });
  }
}
