import { NextResponse } from 'next/server';
import { COOKIE_NAME } from '@/lib/auth';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'បានចាកចេញជោគជ័យ' });
  response.cookies.set({
    name: COOKIE_NAME,
    value: '',
    path: '/',
    expires: new Date(0),
  });
  return response;
}
