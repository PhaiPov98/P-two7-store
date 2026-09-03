import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createToken, createTempSignupToken, COOKIE_NAME, TEMP_SIGNUP_COOKIE, UserSession } from '@/lib/auth';
import { sendAdminLoginAlert } from '@/lib/telegram';

export async function GET(request: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const searchParams = request.nextUrl.searchParams;

  const code = searchParams.get('code');
  const errorParam = searchParams.get('error');
  const stateParam = searchParams.get('state');

  let redirectPath = '/account';
  if (stateParam) {
    try {
      const parsed = JSON.parse(stateParam);
      if (parsed.redirect && typeof parsed.redirect === 'string') {
        redirectPath = parsed.redirect;
      }
    } catch {
      // ignore
    }
  }

  if (errorParam || !code) {
    const loginUrl = new URL('/login', appUrl);
    loginUrl.searchParams.set('error', 'google_auth_failed');
    return NextResponse.redirect(loginUrl);
  }

  if (!clientId || !clientSecret) {
    const loginUrl = new URL('/login', appUrl);
    loginUrl.searchParams.set('error', 'google_not_configured');
    return NextResponse.redirect(loginUrl);
  }

  try {
    const redirectUri = `${appUrl}/api/auth/callback/google`;

    // 1. Exchange authorization code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      console.error('Google token exchange error:', await tokenRes.text());
      const loginUrl = new URL('/login', appUrl);
      loginUrl.searchParams.set('error', 'google_token_error');
      return NextResponse.redirect(loginUrl);
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // 2. Fetch User Profile from Google
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userRes.ok) {
      console.error('Google userinfo fetch error:', await userRes.text());
      const loginUrl = new URL('/login', appUrl);
      loginUrl.searchParams.set('error', 'google_userinfo_error');
      return NextResponse.redirect(loginUrl);
    }

    const googleUser = await userRes.json();
    const email = googleUser.email?.toLowerCase().trim();
    const name = googleUser.name || email?.split('@')[0] || 'Google User';
    const avatar = googleUser.picture || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`;

    if (!email) {
      const loginUrl = new URL('/login', appUrl);
      loginUrl.searchParams.set('error', 'google_no_email');
      return NextResponse.redirect(loginUrl);
    }

    // 3. Find User in SQLite Database
    let user = await prisma.user.findUnique({
      where: { email },
    });

    // 4. If User does NOT exist -> Require setting password FIRST!
    if (!user) {
      const tempToken = await createTempSignupToken({
        email,
        name,
        avatar,
      });

      const setupPasswordUrl = new URL('/auth/setup-password', appUrl);
      setupPasswordUrl.searchParams.set('redirect', redirectPath);

      const response = NextResponse.redirect(setupPasswordUrl);
      response.cookies.set({
        name: TEMP_SIGNUP_COOKIE,
        value: tempToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 15, // 15 minutes
      });

      return response;
    }

    // 5. Existing User -> Update avatar if not set
    if (!user.avatar && avatar) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { avatar },
      });
    }

    // 6. Create Session Payload & JWT Token for Existing User
    const sessionPayload: UserSession = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as 'CUSTOMER' | 'ADMIN',
      avatar: user.avatar,
    };

    const token = await createToken(sessionPayload);

    // 7. Telegram alert if Admin logs in
    if (user.role === 'ADMIN') {
      const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
      const userAgent = request.headers.get('user-agent') || 'Unknown';
      sendAdminLoginAlert({
        email: user.email,
        name: user.name,
        ip,
        userAgent,
      }).catch((err) => console.error('Telegram alert async error:', err));
    }

    // 8. Redirect existing user to destination
    const targetPath = user.role === 'ADMIN' && redirectPath === '/account' ? '/admin' : redirectPath;
    const finalRedirectUrl = new URL(targetPath, appUrl);

    const response = NextResponse.redirect(finalRedirectUrl);

    // Set secure authentication cookie
    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // Clear temp signup cookie if exists
    response.cookies.delete(TEMP_SIGNUP_COOKIE);

    return response;
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    const loginUrl = new URL('/login', appUrl);
    loginUrl.searchParams.set('error', 'google_server_error');
    return NextResponse.redirect(loginUrl);
  }
}
