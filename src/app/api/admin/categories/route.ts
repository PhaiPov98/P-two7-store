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

    // Check if category has products
    const productCount = await prisma.product.count({ where: { categoryId: id } });
    if (productCount > 0) {
      return NextResponse.json(
        { error: `មិនអាចលុបបានទេ ពីព្រោះមាន ${productCount} ផលិតផលកំពុងប្រើប្រាស់ Category នេះ` },
        { status: 400 }
      );
    }

    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'បានលុប Category ជោគជ័យ' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
