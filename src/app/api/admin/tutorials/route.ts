import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireAdmin();
    const tutorials = await prisma.tutorial.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ tutorials });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const { title, slug, category, readTime, icon, description, steps, isActive } = body;

    if (!title || !slug || !category || !steps) {
      return NextResponse.json(
        { error: 'សូមបំពេញព័ត៌មានចាំបាច់អោយបានគ្រប់គ្រាន់' },
        { status: 400 }
      );
    }

    const stepsString = typeof steps === 'string' ? steps : JSON.stringify(steps);

    const tutorial = await prisma.tutorial.create({
      data: {
        title,
        slug,
        category,
        readTime: readTime || '3 នាទីអាន',
        icon: icon || 'BookOpen',
        description,
        steps: stepsString,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    return NextResponse.json({ success: true, tutorial });
  } catch (error: any) {
    console.error('Error creating tutorial:', error);
    return NextResponse.json({ error: error.message || 'បរាជ័យក្នុងការបង្កើតមេរៀន' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const { id, title, slug, category, readTime, icon, description, steps, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing tutorial ID' }, { status: 400 });
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (slug !== undefined) updateData.slug = slug;
    if (category !== undefined) updateData.category = category;
    if (readTime !== undefined) updateData.readTime = readTime;
    if (icon !== undefined) updateData.icon = icon;
    if (description !== undefined) updateData.description = description;
    if (steps !== undefined) {
      updateData.steps = typeof steps === 'string' ? steps : JSON.stringify(steps);
    }
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    const tutorial = await prisma.tutorial.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, tutorial });
  } catch (error: any) {
    console.error('Error updating tutorial:', error);
    return NextResponse.json({ error: error.message || 'បរាជ័យក្នុងការកែប្រែមេរៀន' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing tutorial ID' }, { status: 400 });
    }

    await prisma.tutorial.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting tutorial:', error);
    return NextResponse.json({ error: error.message || 'បរាជ័យក្នុងការលុបមេរៀន' }, { status: 500 });
  }
}
