import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

const DEFAULT_BANNERS = [
  {
    title: 'Windows 11 & Office 365',
    image: '/hero-slide-1.jpg',
    link: '/products',
    order: 1,
    isActive: true,
  },
  {
    title: 'Adobe Creative Suite',
    image: '/hero-slide-2.jpg',
    link: '/products',
    order: 2,
    isActive: true,
  },
  {
    title: 'Cybersecurity & Tools',
    image: '/hero-slide-3.jpg',
    link: '/products',
    order: 3,
    isActive: true,
  },
];

export async function GET() {
  try {
    await requireAdmin();

    let banners = await prisma.banner.findMany({
      orderBy: { order: 'asc' },
    });

    if (banners.length === 0) {
      for (const b of DEFAULT_BANNERS) {
        await prisma.banner.create({ data: b });
      }
      banners = await prisma.banner.findMany({
        orderBy: { order: 'asc' },
      });
    }

    return NextResponse.json({ banners });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const data = await request.json();

    if (!data.title || !data.image) {
      return NextResponse.json({ error: 'សូមបំពេញចំណងជើង និងរូបភាព Banner' }, { status: 400 });
    }

    const banner = await prisma.banner.create({
      data: {
        title: data.title,
        image: data.image,
        link: data.link || '/products',
        order: parseInt(data.order || '0'),
        isActive: Boolean(data.isActive ?? true),
      },
    });

    return NextResponse.json({ success: true, banner });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await requireAdmin();
    const data = await request.json();
    const { id, ...updateData } = data;

    if (!id) return NextResponse.json({ error: 'Missing Banner ID' }, { status: 400 });

    const banner = await prisma.banner.update({
      where: { id },
      data: {
        title: updateData.title,
        image: updateData.image,
        link: updateData.link,
        order: parseInt(updateData.order || '0'),
        isActive: Boolean(updateData.isActive),
      },
    });

    return NextResponse.json({ success: true, banner });
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

    await prisma.banner.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'បានលុប Banner ជោគជ័យ' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
