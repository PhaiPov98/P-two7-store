import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createToken, COOKIE_NAME } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { requestId, otpCode } = await request.json();

    if (!requestId || !otpCode) {
      return NextResponse.json(
        { error: 'សូមបំពេញលេខកូដសម្ងាត់ OTP' },
        { status: 400 }
      );
    }

    const authReq = await prisma.adminAuthRequest.findUnique({
      where: { id: requestId },
    });

    if (!authReq) {
      return NextResponse.json(
        { error: 'សំណើមិនត្រឹមត្រូវ' },
        { status: 404 }
      );
    }

    if (new Date() > authReq.expiresAt) {
      return NextResponse.json(
        { error: 'លេខកូដ OTP នេះបានផុតកំណត់ ៣ នាទីហើយ' },
        { status: 410 }
      );
    }

    if (authReq.status === 'REJECTED') {
      return NextResponse.json(
        { error: 'សំណើនេះត្រូវបានបដិសេធរួចហើយ' },
        { status: 403 }
      );
    }

    if (authReq.otpCode.trim() !== String(otpCode).trim()) {
      return NextResponse.json(
        { error: 'លេខកូដ OTP មិនត្រឹមត្រូវទេ សូមពិនិត្យមើលក្នុង Telegram ម្តងទៀត' },
        { status: 400 }
      );
    }

    // Mark as approved
    await prisma.adminAuthRequest.update({
      where: { id: authReq.id },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
      },
    });

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
      success: true,
      user: sessionPayload,
      message: 'ផ្ទៀងផ្ទាត់ជោគជ័យ!',
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
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
