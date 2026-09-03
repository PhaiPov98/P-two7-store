import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createResetPasswordToken } from '@/lib/auth';
import { sendPasswordResetAlert } from '@/lib/telegram';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    if (!email) {
      return NextResponse.json(
        { error: 'សូមបញ្ចូល Email របស់អ្នក' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'រកមិនឃើញគណនីដែលមាន Email នេះទេ' },
        { status: 404 }
      );
    }

    // Generate secure 30-minute token
    const token = await createResetPasswordToken(user.email);
    const resetUrl = `${appUrl}/reset-password?token=${encodeURIComponent(token)}`;

    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || 'Unknown';

    // 1. Send Actual Email with Verify Button to User's Inbox
    sendPasswordResetEmail({
      to: user.email,
      name: user.name,
      resetUrl,
    }).catch((err) => console.error('Email send error:', err));

    // 2. Send Telegram alert to Admin Bot
    sendPasswordResetAlert({
      email: user.email,
      name: user.name,
      resetUrl,
      ip,
      userAgent,
    }).catch((err) => console.error('Telegram reset alert error:', err));

    return NextResponse.json({
      success: true,
      message: `សារផ្ទៀងផ្ទាត់ត្រូវបានផ្ញើទៅកាន់ Email ${user.email} រួចរាល់ហើយ!`,
      resetUrl,
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'មានបញ្ហាបច្ចេកទេស សូមព្យាយាមម្តងទៀត' },
      { status: 500 }
    );
  }
}
