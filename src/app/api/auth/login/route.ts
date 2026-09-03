import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { createToken, COOKIE_NAME } from '@/lib/auth';
import { checkLoginRateLimit, recordFailedLoginAttempt, clearLoginAttempts } from '@/lib/rateLimit';
import { sendAdminLoginAlert, sendBruteForceAlert } from '@/lib/telegram';

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'សូមបំពេញ Email និង ពាក្យសម្ងាត់' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const rateLimitKey = `${ip}_${cleanEmail}`;

    // 1. Check Rate Limit
    const rateCheck = checkLoginRateLimit(rateLimitKey);
    if (rateCheck.isBlocked) {
      return NextResponse.json(
        {
          error: `គណនី ឬ IP របស់អ្នកត្រូវបានចាក់សោបណ្តោះអាសន្ន ដោយសារព្យាយាម Login ខុសច្រើនដង។ សូមសាកល្បងម្តងទៀតក្រោយ ${rateCheck.retryAfterMinutes || 15} នាទី`,
        },
        { status: 429 }
      );
    }

    // 2. Query user
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      const failInfo = recordFailedLoginAttempt(rateLimitKey);
      if (failInfo.isNowLocked) {
        sendBruteForceAlert({
          email: cleanEmail,
          ip,
          userAgent,
          attempts: 5,
        }).catch((err) => console.error('Telegram brute force alert error:', err));
      }

      return NextResponse.json(
        {
          error: failInfo.isNowLocked
            ? 'អ្នកបានវាយខុសលើសពី ៥ ដង! ប្រព័ន្ធបានចាក់សោរយៈពេល ១៥ នាទី ដើម្បីការពារសុវត្ថិភាព។'
            : `Email ឬ ពាក្យសម្ងាត់មិនត្រឹមត្រូវទេ (សល់ ${failInfo.remainingAttempts} ដង)`,
        },
        { status: 401 }
      );
    }

    // 3. Verify Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const failInfo = recordFailedLoginAttempt(rateLimitKey);
      if (failInfo.isNowLocked) {
        sendBruteForceAlert({
          email: cleanEmail,
          ip,
          userAgent,
          attempts: 5,
        }).catch((err) => console.error('Telegram brute force alert error:', err));
      }

      return NextResponse.json(
        {
          error: failInfo.isNowLocked
            ? 'អ្នកបានវាយខុសលើសពី ៥ ដង! ប្រព័ន្ធបានចាក់សោរយៈពេល ១៥ នាទី ដើម្បីការពារសុវត្ថិភាព។'
            : `Email ឬ ពាក្យសម្ងាត់មិនត្រឹមត្រូវទេ (សល់ ${failInfo.remainingAttempts} ដង)`,
        },
        { status: 401 }
      );
    }

    // 4. Login successful -> Clear failed attempts
    clearLoginAttempts(rateLimitKey);

    const sessionPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as 'CUSTOMER' | 'ADMIN',
      avatar: user.avatar,
    };

    const token = await createToken(sessionPayload);

    // 5. Send Telegram Security Alert if ADMIN logs in
    if (user.role === 'ADMIN') {
      sendAdminLoginAlert({
        email: user.email,
        name: user.name,
        ip,
        userAgent,
      }).catch((err) => console.error('Telegram alert async error:', err));
    }

    const response = NextResponse.json({
      success: true,
      user: sessionPayload,
      message: 'ចូលគណនីជោគជ័យ!',
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
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'មានបញ្ហាបច្ចេកទេស សូមព្យាយាមម្តងទៀត' },
      { status: 500 }
    );
  }
}
