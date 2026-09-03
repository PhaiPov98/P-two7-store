import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, contact, message, subject } = body;

    if (!message || (!email && !contact && !name)) {
      return NextResponse.json(
        { error: 'សូមបំពេញព័ត៌មាន និងខ្លឹមសារសារឱ្យបានត្រឹមត្រូវ' },
        { status: 400 }
      );
    }

    // Try to get authenticated user if logged in
    const user = await getCurrentUser();

    const contactInfo = contact || email || (user ? user.email : 'Unspecified');
    const senderName = name || (user ? user.name : 'អតិថិជនទូទៅ');
    const ticketSubject = subject || 'សាកសួរព័ត៌មានទូទៅ';

    const ticket = await prisma.supportTicket.create({
      data: {
        userId: user ? user.id : null,
        name: senderName,
        contact: contactInfo,
        subject: ticketSubject,
        message: message.trim(),
        status: 'OPEN',
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'សាររបស់អ្នកត្រូវបានបញ្ជូន និងកត់ត្រាទុកក្នុងប្រព័ន្ធដោយជោគជ័យ!',
        ticketId: ticket.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error submitting support ticket:', error);
    return NextResponse.json(
      { error: 'មានបញ្ហាបច្ចេកទេសក្នុងការផ្ញើសារ សូមព្យាយាមម្តងទៀត' },
      { status: 500 }
    );
  }
}
