import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { requireAdmin, createToken, COOKIE_NAME } from '@/lib/auth';
import { sendAdminSecurityChangeAlert } from '@/lib/telegram';

export async function GET() {
  try {
    const adminSession = await requireAdmin();
    const user = await prisma.user.findUnique({
      where: { id: adminSession.id },
      select: { id: true, name: true, email: true, phone: true, role: true, avatar: true, createdAt: true },
    });

    return NextResponse.json({ user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const adminSession = await requireAdmin();
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    const { name, email, phone, currentPassword, newPassword } = await request.json();

    const user = await prisma.user.findUnique({
      where: { id: adminSession.id },
    });

    if (!user) {
      return NextResponse.json({ error: 'រកមិនឃើញគណនី' }, { status: 404 });
    }

    const updateData: any = {};
    let emailChanged = false;
    let passwordChanged = false;

    if (name) updateData.name = name.trim();
    if (phone !== undefined) updateData.phone = phone.trim();

    if (email && email.toLowerCase().trim() !== user.email) {
      const existing = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
      });
      if (existing) {
        return NextResponse.json({ error: 'Email នេះត្រូវបានប្រើប្រាស់រួចហើយ' }, { status: 400 });
      }
      updateData.email = email.toLowerCase().trim();
      emailChanged = true;
    }

    // If changing password
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'សូមបញ្ចូលពាក្យសម្ងាត់ចាស់ (Current Password)' }, { status: 400 });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return NextResponse.json({ error: 'ពាក្យសម្ងាត់ចាស់មិនត្រឹមត្រូវទេ' }, { status: 400 });
      }

      if (newPassword.length < 6) {
        return NextResponse.json({ error: 'ពាក្យសម្ងាត់ថ្មីត្រូវមានយ៉ាងតិច ៦ តួអក្សរ' }, { status: 400 });
      }

      updateData.password = await bcrypt.hash(newPassword, 10);
      passwordChanged = true;
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: { id: true, name: true, email: true, phone: true, role: true, avatar: true },
    });

    // Send Telegram Security Alert
    sendAdminSecurityChangeAlert({
      email: updatedUser.email,
      name: updatedUser.name,
      changedPassword: passwordChanged,
      changedEmail: emailChanged,
      ip,
      userAgent,
    }).catch((err) => console.error('Telegram profile alert error:', err));

    // Update Session Token
    const token = await createToken({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role as 'ADMIN',
      avatar: updatedUser.avatar,
    });

    const res = NextResponse.json({
      success: true,
      user: updatedUser,
      message: 'បានកែប្រែព័ត៌មានសុវត្ថិភាពដោយជោគជ័យ!',
    });

    res.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'មានបញ្ហាបច្ចេកទេស' }, { status: 500 });
  }
}
