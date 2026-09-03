import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  try {
    await requireAdmin();
    const files = await prisma.file.findMany({
      include: {
        category: true,
        _count: {
          select: { downloads: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ files });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const data = await request.json();

    let baseSlug = (data.slug || data.title || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (!baseSlug) {
      baseSlug = `file-${Date.now().toString(36)}`;
    }

    let slug = baseSlug;
    let count = 1;
    while (await prisma.file.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${count}`;
      count++;
    }

    const file = await prisma.file.create({
      data: {
        title: data.title,
        slug,
        description: data.description || '',
        version: data.version || '1.0',
        fileType: data.fileType || 'ZIP',
        fileSize: data.fileSize || '10 MB',
        filePath: data.filePath || `${slug}.${data.fileType?.toLowerCase() || 'zip'}`,
        isFree: Boolean(data.isFree ?? true),
        price: data.isFree ? 0 : parseFloat(data.price || '0'),
        changelog: data.changelog || '',
        requirements: data.requirements || '',
        categoryId: data.categoryId,
        isActive: Boolean(data.isActive ?? true),
      },
    });

    return NextResponse.json({ success: true, file });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await requireAdmin();
    const data = await request.json();
    const { id, ...updateData } = data;

    if (!id) return NextResponse.json({ error: 'Missing file ID' }, { status: 400 });

    let updatedSlug = updateData.slug ? updateData.slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') : undefined;
    if (updatedSlug) {
      let slugCandidate = updatedSlug;
      let count = 1;
      while (true) {
        const existing = await prisma.file.findFirst({
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

    const file = await prisma.file.update({
      where: { id },
      data: {
        title: updateData.title,
        ...(updatedSlug ? { slug: updatedSlug } : {}),
        description: updateData.description,
        version: updateData.version,
        fileType: updateData.fileType,
        fileSize: updateData.fileSize,
        filePath: updateData.filePath,
        isFree: Boolean(updateData.isFree),
        price: updateData.isFree ? 0 : parseFloat(updateData.price || '0'),
        changelog: updateData.changelog,
        requirements: updateData.requirements,
        categoryId: updateData.categoryId,
        isActive: Boolean(updateData.isActive),
      },
    });

    return NextResponse.json({ success: true, file });
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
      // 1. Delete associated downloads
      await tx.download.deleteMany({ where: { fileId: id } });

      // 2. Unlink OrderItems pointing to this file
      await tx.orderItem.updateMany({
        where: { fileId: id },
        data: { fileId: null },
      });

      // 3. Delete the file
      await tx.file.delete({ where: { id } });
    });

    return NextResponse.json({ success: true, message: 'បានលុបឯកសារជោគជ័យ' });
  } catch (error: any) {
    console.error('Error deleting file:', error);
    return NextResponse.json({ error: error.message || 'មិនអាចលុបឯកសារបានទេ' }, { status: 500 });
  }
}
