import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getCurrentUser } from '@/lib/auth';
import AdminLoginForm from './AdminLoginForm';

export const dynamic = 'force-dynamic';

const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'bozz2026';

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: { key?: string };
}) {
  // 1. If already logged in as ADMIN, go straight to /admin
  const user = await getCurrentUser();
  if (user && user.role === 'ADMIN') {
    redirect('/admin');
  }

  // 2. Secret Key Verification
  const cookieStore = cookies();
  const secretCookie = cookieStore.get('bozz_admin_access')?.value;
  const keyParam = searchParams?.key;

  const hasSecretAccess = keyParam === ADMIN_SECRET_KEY || secretCookie === ADMIN_SECRET_KEY;

  // 3. If no valid secret key or cookie, CLOAK with 404 Not Found!
  // To any hacker or visitor just typing /admin-login, this page literally returns 404!
  if (!hasSecretAccess) {
    notFound();
  }

  return <AdminLoginForm />;
}
