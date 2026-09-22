import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const COOKIE_NAME = 'bozz_auth_token';
const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'bozz-pov-super-secure-secret-key-2026-khmer-digital-store'
);
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'bozz2026';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;

  let session: any = null;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, SECRET_KEY);
      session = payload;
    } catch (e) {
      session = null;
    }
  }

  // 1. High-Security Cloaking for /admin-login
  if (pathname === '/admin-login') {
    // If already logged in as ADMIN, go straight to dashboard
    if (session && session.role === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }

    const keyParam = request.nextUrl.searchParams.get('key');
    const secretCookie = request.cookies.get('bozz_admin_access')?.value;
    const hasSecretAccess = keyParam === ADMIN_SECRET_KEY || secretCookie === ADMIN_SECRET_KEY;

    // If anyone visits /admin-login WITHOUT secret key -> Return 404 Cloaking!
    if (!hasSecretAccess) {
      const url = request.nextUrl.clone();
      url.pathname = '/404';
      return NextResponse.rewrite(url);
    }

    // If secret key is provided in query, remember access in cookie for 1 hour
    const response = NextResponse.next();
    if (keyParam === ADMIN_SECRET_KEY) {
      response.cookies.set('bozz_admin_access', ADMIN_SECRET_KEY, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60, // 1 hour
      });
    }
    return response;
  }

  // 2. High-Security Cloaking for /admin routes
  if (pathname.startsWith('/admin')) {
    // If not authenticated as ADMIN, DO NOT redirect to login!
    // Cloak completely behind 404 so attackers believe /admin does not exist.
    if (!session || session.role !== 'ADMIN') {
      const url = request.nextUrl.clone();
      url.pathname = '/404';
      return NextResponse.rewrite(url);
    }
  }

  // 3. Guard /account routes (redirect unauthorized visitors to /login)
  if (pathname.startsWith('/account')) {
    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/admin-login', '/account/:path*'],
};
