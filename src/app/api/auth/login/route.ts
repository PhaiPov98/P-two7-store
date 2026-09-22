import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { createToken, COOKIE_NAME } from '@/lib/auth';
import { checkLoginRateLimit, recordFailedLoginAttempt, clearLoginAttempts } from '@/lib/rateLimit';
import { sendAdminLoginAlert, sendBruteForceAlert, sendFailedAdminLoginAlert, sendAdminApprovalRequest } from '@/lib/telegram';
import crypto from 'crypto';

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

      // If someone targeted admin email -> alert immediately even once!
      if (cleanEmail === 'bob800195@gmail.com' || cleanEmail.includes('admin')) {
        sendFailedAdminLoginAlert({
          email: cleanEmail,
          ip,
          userAgent,
          attemptNumber: 5 - failInfo.remainingAttempts,
        }).catch((err) => console.error('Telegram failed admin login alert error:', err));
      }

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

      // If ADMIN account has WRONG password -> alert Telegram immediately on the 1st attempt!
      if (user.role === 'ADMIN' || cleanEmail === 'bob800195@gmail.com') {
        sendFailedAdminLoginAlert({
          email: user.email,
          ip,
          userAgent,
          attemptNumber: 5 - failInfo.remainingAttempts,
        }).catch((err) => console.error('Telegram failed admin login alert error:', err));
      }

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

    // 5. If User is ADMIN -> Require Telegram Approval First!
    if (user.role === 'ADMIN') {
      const approvalToken = crypto.randomBytes(24).toString('hex');
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
      const expiresAt = new Date(Date.now() + 3 * 60 * 1000); // 3 minutes

      const authReq = await prisma.adminAuthRequest.create({
        data: {
          token: approvalToken,
          otpCode,
          email: user.email,
          ip,
          userAgent,
          status: 'PENDING',
          expiresAt,
        },
      });

      // Send 2FA Approval Request with inline action links to Telegram
      sendAdminApprovalRequest({
        email: user.email,
        name: user.name,
        ip,
        userAgent,
        otpCode,
        token: approvalToken,
      }).catch((err) => console.error('Telegram approval request error:', err));

      return NextResponse.json({
        success: true,
        requires2FA: true,
        requestId: authReq.id,
        email: user.email,
        message: 'សូមពិនិត្យមើល Telegram Bot ដើម្បីចុច Approve ឬយកលេខកូដសម្ងាត់ OTP ៦ ខ្ទង់',
      });
    }

    // 6. Normal Customer Login
    const sessionPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as 'CUSTOMER',
      avatar: user.avatar,
    };

    const token = await createToken(sessionPayload);

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
