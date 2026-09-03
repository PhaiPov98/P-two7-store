import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const searchParams = request.nextUrl.searchParams;
  const redirect = searchParams.get('redirect') || '/account';

  if (!clientId) {
    const loginUrl = new URL('/login', appUrl);
    loginUrl.searchParams.set('error', 'google_not_configured');
    return NextResponse.redirect(loginUrl);
  }

  const redirectUri = `${appUrl}/api/auth/callback/google`;
  const state = JSON.stringify({ redirect });

  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  googleAuthUrl.searchParams.set('client_id', clientId);
  googleAuthUrl.searchParams.set('redirect_uri', redirectUri);
  googleAuthUrl.searchParams.set('response_type', 'code');
  googleAuthUrl.searchParams.set('scope', 'openid email profile');
  googleAuthUrl.searchParams.set('access_type', 'offline');
  googleAuthUrl.searchParams.set('prompt', 'select_account');
  googleAuthUrl.searchParams.set('state', state);

  return NextResponse.redirect(googleAuthUrl.toString());
}
