import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const COOKIE_NAME = 'bozz_auth_token';
const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'bozz-pov-super-secure-secret-key-2026-khmer-digital-store'
);

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

  // 1. If visiting /admin-login while already logged in as ADMIN
  if (pathname === '/admin-login') {
    if (session && session.role === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.next();
  }

  // 2. Guard /admin routes (redirect unauthorized visitors to /admin-login)
  if (pathname.startsWith('/admin')) {
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/admin-login', request.url));
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
