import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET: Fetch all gifts sent to the logged in user
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find all gifts matching user id OR user email
    const gifts = await (prisma as any).gift.findMany({
      where: {
        OR: [
          { userId: user.id },
          { user: { email: user.email.trim().toLowerCase() } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(
      { gifts: gifts || [] },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('Failed to fetch user gifts:', error);
    return NextResponse.json({ error: 'Server error', gifts: [] }, { status: 500 });
  }
}

// POST: Mark a gift as claimed (User clicks to open / receive gift)
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { giftId } = await req.json();
    if (!giftId) {
      return NextResponse.json({ error: 'Missing giftId' }, { status: 400 });
    }

    const gift = await (prisma as any).gift.updateMany({
      where: {
        id: giftId,
        OR: [
          { userId: user.id },
          { user: { email: user.email.trim().toLowerCase() } },
        ],
      },
      data: { isClaimed: true, claimedAt: new Date() },
    });

    return NextResponse.json({ success: true, gift });
  } catch (error) {
    console.error('Failed to claim gift:', error);
    return NextResponse.json({ error: 'Failed to claim gift' }, { status: 500 });
  }
}
