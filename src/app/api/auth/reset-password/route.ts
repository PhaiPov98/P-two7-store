import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { verifyResetPasswordToken } from '@/lib/auth';
import { sendAdminSecurityChangeAlert } from '@/lib/telegram';

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Link កំណត់ពាក្យសម្ងាត់មិនត្រឹមត្រូវ ឬផុតកំណត់' },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: 'ពាក្យសម្ងាត់ត្រូវមានយ៉ាងហោចណាស់ 6 តួអក្សរ' },
        { status: 400 }
      );
    }

    const payload = await verifyResetPasswordToken(token);
    if (!payload || !payload.email) {
      return NextResponse.json(
        { error: 'Link នេះមិនត្រឹមត្រូវ ឬបានផុតកំណត់រយៈពេល ៣០ នាទីហើយ' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'រកមិនឃើញគណនីនេះទេ' },
        { status: 404 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    if (user.role === 'ADMIN') {
      const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
      const userAgent = request.headers.get('user-agent') || 'Unknown';
      sendAdminSecurityChangeAlert({
        email: user.email,
        name: user.name,
        changedPassword: true,
        changedEmail: false,
        ip,
        userAgent,
      }).catch((err) => console.error('Telegram alert async error:', err));
    }

    return NextResponse.json({
      success: true,
      message: 'ពាក្យសម្ងាត់ត្រូវបានផ្លាស់ប្តូរដោយជោគជ័យ! សូមចូលគណនីសារជាថ្មី។',
    });
  } catch (error: any) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'មានបញ្ហាបច្ចេកទេស សូមព្យាយាមម្តងទៀត' },
      { status: 500 }
    );
  }
}
