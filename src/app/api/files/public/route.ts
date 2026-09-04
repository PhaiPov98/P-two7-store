import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const files = await prisma.file.findMany({
      where: { isActive: true },
      include: {
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Strip private file paths for security
    const safeFiles = files.map((f) => ({
      id: f.id,
      title: f.title,
      slug: f.slug,
      description: f.description,
      version: f.version,
      fileSize: f.fileSize,
      fileType: f.fileType,
      downloadCount: f.downloadCount,
      isFree: f.isFree,
      price: f.price ? Number(f.price) : 0,
      changelog: f.changelog,
      categoryId: f.categoryId,
      category: f.category,
      createdAt: f.createdAt,
    }));

    return NextResponse.json(
      { files: safeFiles },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        },
      }
    );
  } catch (error) {
    console.error('Failed to fetch public files:', error);
    return NextResponse.json({ error: 'Failed to fetch files' }, { status: 500 });
  }
}
