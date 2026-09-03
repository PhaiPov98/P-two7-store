import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const revalidate = 0;

export async function GET() {
  try {
    const banners = await prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ banners });
  } catch (error) {
    return NextResponse.json({ banners: [] }, { status: 500 });
  }
}
