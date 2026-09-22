import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createToken, COOKIE_NAME } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get('requestId');

    if (!requestId) {
      return NextResponse.json({ error: 'Missing requestId' }, { status: 400 });
    }

    const authReq = await prisma.adminAuthRequest.findUnique({
      where: { id: requestId },
    });

    if (!authReq) {
      return NextResponse.json({ status: 'NOT_FOUND' }, { status: 404 });
    }

    if (new Date() > authReq.expiresAt && authReq.status === 'PENDING') {
      await prisma.adminAuthRequest.update({
        where: { id: authReq.id },
        data: { status: 'EXPIRED' },
      });
      return NextResponse.json({
        status: 'EXPIRED',
        error: 'សំណើបានផុតកំណត់ ៣ នាទី។ សូមព្យាយាមម្តងទៀត។',
      });
    }

    if (authReq.status === 'REJECTED') {
      return NextResponse.json({
        status: 'REJECTED',
        error: 'សំណើចូលគណនីត្រូវបានបដិសេធពី Telegram!',
      });
    }

    if (authReq.status === 'APPROVED') {
      const user = await prisma.user.findUnique({
        where: { email: authReq.email },
      });

      if (!user || user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'គណនីមិនមានសិទ្ធិ' }, { status: 403 });
      }

      const sessionPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role as 'ADMIN',
        avatar: user.avatar,
      };

      const token = await createToken(sessionPayload);

      const response = NextResponse.json({
        status: 'APPROVED',
        user: sessionPayload,
        message: 'ចូលគណនី Admin ជោគជ័យ!',
      });

      response.cookies.set({
        name: COOKIE_NAME,
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return response;
    }

    return NextResponse.json({ status: 'PENDING' });
  } catch (error) {
    console.error('Check admin login status error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
