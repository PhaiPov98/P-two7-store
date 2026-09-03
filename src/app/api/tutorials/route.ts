import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const where: any = { isActive: true };

    if (category && category !== 'all') {
      where.category = { contains: category };
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
        { category: { contains: q } },
      ];
    }

    const tutorials = await prisma.tutorial.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ tutorials });
  } catch (error) {
    console.error('Error fetching tutorials:', error);
    return NextResponse.json(
      { error: 'បរាជ័យក្នុងការទាញយកមេរៀន (Failed to fetch tutorials)' },
      { status: 500 }
    );
  }
}
