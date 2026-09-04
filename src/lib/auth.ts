import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import prisma from './prisma';

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'bozz-pov-super-secure-secret-key-2026-khmer-digital-store'
);

const COOKIE_NAME = 'bozz_auth_token';
const TEMP_SIGNUP_COOKIE = 'bozz_temp_google_signup';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: 'CUSTOMER' | 'ADMIN';
  avatar?: string | null;
}

export interface TempGoogleProfile {
  email: string;
  name: string;
  avatar?: string | null;
}

export async function createTempSignupToken(payload: TempGoogleProfile): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(SECRET_KEY);
}

export async function verifyTempSignupToken(token: string): Promise<TempGoogleProfile | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as unknown as TempGoogleProfile;
  } catch (error) {
    return null;
  }
}

export async function createResetPasswordToken(email: string): Promise<string> {
  return await new SignJWT({ email, type: 'password_reset' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30m')
    .sign(SECRET_KEY);
}

export async function verifyResetPasswordToken(token: string): Promise<{ email: string } | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    if (payload.type !== 'password_reset' || !payload.email) return null;
    return { email: payload.email as string };
  } catch (error) {
    return null;
  }
}

export async function createToken(payload: UserSession): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET_KEY);
}

export async function verifyToken(token: string): Promise<UserSession | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as unknown as UserSession;
  } catch (error) {
    return null;
  }
}

export async function getCurrentUser(): Promise<UserSession | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const session = await verifyToken(token);
    if (!session || !session.id) return null;

    return session;
  } catch (error) {
    return null;
  }
}

export async function requireAuth(): Promise<UserSession> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('UNAUTHORIZED');
  }
  return user;
}

export async function requireAdmin(): Promise<UserSession> {
  const user = await requireAuth();
  if (user.role !== 'ADMIN') {
    throw new Error('FORBIDDEN_ADMIN_ONLY');
  }
  return user;
}

export { COOKIE_NAME, TEMP_SIGNUP_COOKIE };
