import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import {
  COOKIE_NAME,
  TEMP_SIGNUP_COOKIE,
  verifyTempSignupToken,
  getCurrentUser,
  createToken,
  UserSession,
} from '@/lib/auth';

// GET: Return current Google temp profile or logged-in user profile
export async function GET() {
  try {
    const cookieStore = cookies();
    const tempToken = cookieStore.get(TEMP_SIGNUP_COOKIE)?.value;

    if (tempToken) {
      const tempProfile = await verifyTempSignupToken(tempToken);
      if (tempProfile) {
        return NextResponse.json({
          status: 'PENDING_SETUP',
          profile: tempProfile,
        });
      }
    }

    const currentUser = await getCurrentUser();
    if (currentUser) {
      return NextResponse.json({
        status: 'AUTHENTICATED',
        profile: {
          name: currentUser.name,
          email: currentUser.email,
          avatar: currentUser.avatar,
        },
      });
    }

    return NextResponse.json(
      { error: 'សូម Login ជាមួយ Google ម្តងទៀត' },
      { status: 401 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error' }, { status: 500 });
  }
}

// POST: Create account with password and log in
export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const tempToken = cookieStore.get(TEMP_SIGNUP_COOKIE)?.value;
    const { password } = await request.json();

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: 'ពាក្យសម្ងាត់ត្រូវមានយ៉ាងហោចណាស់ 6 តួអក្សរ' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Case 1: Brand new Google signup user (from TEMP_SIGNUP_COOKIE)
    if (tempToken) {
      const tempProfile = await verifyTempSignupToken(tempToken);
      if (!tempProfile || !tempProfile.email) {
        return NextResponse.json(
          { error: 'ពេលវេលាកំណត់បានផុតកំណត់ សូម Login ជាមួយ Google ម្តងទៀត' },
          { status: 400 }
        );
      }

      const email = tempProfile.email.toLowerCase().trim();

      // Check if user was already created
      let user = await prisma.user.findUnique({ where: { email } });

      if (user) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            password: hashedPassword,
            avatar: tempProfile.avatar || user.avatar,
          },
        });
      } else {
        user = await prisma.user.create({
          data: {
            name: tempProfile.name || 'Google User',
            email,
            password: hashedPassword,
            avatar: tempProfile.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
            role: 'CUSTOMER',
          },
        });
      }

      const sessionPayload: UserSession = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role as 'CUSTOMER' | 'ADMIN',
        avatar: user.avatar,
      };

      const token = await createToken(sessionPayload);

      const response = NextResponse.json({
        success: true,
        user: sessionPayload,
        message: 'បង្កើតគណនី និងកំណត់ពាក្យសម្ងាត់បានជោគជ័យ!',
      });

      // Set auth cookie
      response.cookies.set({
        name: COOKIE_NAME,
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      // Delete temp cookie
      response.cookies.delete(TEMP_SIGNUP_COOKIE);

      return response;
    }

    // Case 2: Already logged in user setting/updating password
    const currentUser = await getCurrentUser();
    if (currentUser) {
      await prisma.user.update({
        where: { id: currentUser.id },
        data: { password: hashedPassword },
      });

      return NextResponse.json({
        success: true,
        message: 'កំណត់ពាក្យសម្ងាត់បានជោគជ័យ!',
      });
    }

    return NextResponse.json(
      { error: 'សូម Login ជាមួយ Google ម្តងទៀត ដើម្បីកំណត់ Password' },
      { status: 401 }
    );
  } catch (error: any) {
    console.error('Setup password error:', error);
    return NextResponse.json(
      { error: error.message || 'មានបញ្ហាបច្ចេកទេស' },
      { status: 500 }
    );
  }
}
