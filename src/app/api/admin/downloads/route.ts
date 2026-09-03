import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  try {
    await requireAdmin();
    const downloads = await prisma.download.findMany({
      include: {
        user: { select: { name: true, email: true } },
        file: { select: { title: true, version: true, fileType: true, fileSize: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return NextResponse.json({ downloads });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}
