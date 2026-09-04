import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(request: NextRequest) {
  try {
    const isFreeParam = request.nextUrl.searchParams.get('isFree');
    const whereClause: any = { isActive: true };
    if (isFreeParam === 'true') {
      whereClause.isFree = true;
    }

    const files = await prisma.file.findMany({
      where: whereClause,
      include: {
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Strip private file paths for security and format data safely
    const safeFiles = files.map((f) => ({
      id: f.id,
      title: f.title || '',
      slug: f.slug || '',
      description: f.description || '',
      version: f.version || '1.0',
      fileSize: f.fileSize || '10 MB',
      fileType: f.fileType || 'ZIP',
      downloadCount: f.downloadCount || 0,
      isFree: Boolean(f.isFree),
      price: f.price ? Number(f.price) : 0,
      changelog: f.changelog || '',
      categoryId: f.categoryId || '',
      category: f.category
        ? {
            id: f.category.id,
            nameKm: f.category.nameKm,
            nameEn: f.category.nameEn,
            slug: f.category.slug,
          }
        : null,
      createdAt: f.createdAt ? f.createdAt.toISOString() : new Date().toISOString(),
    }));

    return NextResponse.json(
      { files: safeFiles },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0',
          'CDN-Cache-Control': 'no-store',
          'Vercel-CDN-Cache-Control': 'no-store',
        },
      }
    );
  } catch (error) {
    console.error('Failed to fetch public files:', error);
    return NextResponse.json({ error: 'Failed to fetch files' }, { status: 500 });
  }
}
