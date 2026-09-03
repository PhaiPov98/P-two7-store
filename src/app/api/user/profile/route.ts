import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function PUT(request: Request) {
  try {
    const session = await requireAuth();
    const data = await request.json();

    const updateFields: any = {
      name: data.name,
      phone: data.phone || null,
    };

    if (data.newPassword) {
      if (data.newPassword.length < 6) {
        return NextResponse.json({ error: 'ពាក្យសម្ងាត់ត្រូវមានយ៉ាងហោចណាស់ 6 តួអក្សរ' }, { status: 400 });
      }

      const user = await prisma.user.findUnique({
        where: { id: session.id },
      });

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      if (data.currentPassword) {
        const isMatch = await bcrypt.compare(data.currentPassword, user.password);
        if (!isMatch) {
          return NextResponse.json({ error: 'ពាក្យសម្ងាត់បច្ចុប្បន្នមិនត្រឹមត្រូវទេ' }, { status: 400 });
        }
      }

      updateFields.password = await bcrypt.hash(data.newPassword, 10);
    }

    const updated = await prisma.user.update({
      where: { id: session.id },
      data: updateFields,
      select: { id: true, name: true, email: true, phone: true, role: true },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
