import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const revalidate = 0;

// GET all gifts (for Admin) & users list for gifting
export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let gifts: any[] = [];
    let users: any[] = [];
    let availableKeys: any[] = [];
    let availableFiles: any[] = [];
    let availableCoupons: any[] = [];

    try {
      users = await prisma.user.findMany({
        select: { id: true, name: true, email: true, role: true, avatar: true },
        orderBy: { createdAt: 'desc' },
      });
    } catch (e) {
      console.error('Error fetching users:', e);
    }

    try {
      gifts = await (prisma as any).gift.findMany({
        include: {
          user: {
            select: { id: true, name: true, email: true, phone: true, avatar: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (e) {
      console.error('Error fetching gifts:', e);
    }

    try {
      availableKeys = await prisma.productKey.findMany({
        where: { status: 'AVAILABLE' },
        include: { product: { select: { name: true } } },
        take: 30,
      });
    } catch (e) {
      console.error('Error fetching keys:', e);
    }

    try {
      availableFiles = await prisma.file.findMany({
        where: { isActive: true },
        select: { id: true, title: true, version: true, fileSize: true, filePath: true },
        take: 30,
        orderBy: { createdAt: 'desc' },
      });
    } catch (e) {
      console.error('Error fetching files:', e);
    }

    try {
      availableCoupons = await prisma.coupon.findMany({
        where: { isActive: true },
        select: { id: true, code: true, discountType: true, discountValue: true },
        take: 30,
        orderBy: { code: 'asc' },
      });
    } catch (e) {
      console.error('Error fetching coupons:', e);
    }

    return NextResponse.json({ gifts, users, availableKeys, availableFiles, availableCoupons });
  } catch (error) {
    console.error('Failed to fetch gifts endpoint:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST: Admin creates a gift for a user (Supports userId OR email)
export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { userId, email, title, description, giftType, content, expiresAt } = body;

    if ((!userId && !email) || !title) {
      return NextResponse.json(
        { error: 'សូមជ្រើសរើស ឬបញ្ចូលអ៊ីមែលអតិថិជន និងចំណងជើងកាដូ' },
        { status: 400 }
      );
    }

    // Resolve target user by userId or email
    let targetUser: any = null;
    if (userId) {
      targetUser = await prisma.user.findUnique({ where: { id: userId } });
    } else if (email) {
      targetUser = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    }

    if (!targetUser) {
      return NextResponse.json(
        { error: 'រកមិនឃើញគណនីអតិថិជននេះក្នុងប្រព័ន្ធទេ (សូមពិនិត្យអ៊ីមែលម្តងទៀត)' },
        { status: 404 }
      );
    }

    // Safely parse expiration date
    let parsedExpiresAt: Date | null = null;
    if (expiresAt) {
      const parsed = new Date(expiresAt);
      if (!isNaN(parsed.getTime())) {
        parsedExpiresAt = parsed;
      }
    }

    const gift = await (prisma as any).gift.create({
      data: {
        userId: targetUser.id,
        title: title.trim(),
        description: description ? description.trim() : null,
        giftType: giftType || 'KEY',
        content: content ? content.trim() : null,
        expiresAt: parsedExpiresAt,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({ success: true, gift });
  } catch (error: any) {
    console.error('Failed to send gift:', error);
    return NextResponse.json(
      { error: error?.message || 'មានបញ្ហាក្នុងការបង្កើតកាដូ' },
      { status: 500 }
    );
  }
}

// DELETE: Admin removes a gift
export async function DELETE(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing gift ID' }, { status: 400 });
    }

    await (prisma as any).gift.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to delete gift' },
      { status: 500 }
    );
  }
}
