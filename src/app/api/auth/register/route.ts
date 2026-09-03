import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { createToken, COOKIE_NAME } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { name, email, password, phone } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'សូមបំពេញព័ត៌មានដែលត្រូវការទាំងអស់' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'ពាក្យសម្ងាត់ត្រូវមានយ៉ាងហោចណាស់ 6 តួអក្សរ' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email នេះត្រូវបានចុះឈ្មោះរួចហើយ' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        phone: phone || null,
        role: 'CUSTOMER',
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
      },
    });

    const sessionPayload = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role as 'CUSTOMER' | 'ADMIN',
      avatar: newUser.avatar,
    };

    const token = await createToken(sessionPayload);

    const response = NextResponse.json({
      success: true,
      user: sessionPayload,
      message: 'បង្កើតគណនីជោគជ័យ!',
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
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'មានបញ្ហាបច្ចេកទេស សូមព្យាយាមម្តងទៀត' },
      { status: 500 }
    );
  }
}
