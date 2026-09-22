import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendTelegramNotification } from '@/lib/telegram';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const action = searchParams.get('action'); // approve or reject

  if (!token) {
    return new NextResponse(renderHtml('កំហុស', 'មិនមាន Token ត្រឹមត្រូវឡើយ', false), {
      status: 400,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  const authReq = await prisma.adminAuthRequest.findUnique({
    where: { token },
  });

  if (!authReq) {
    return new NextResponse(renderHtml('មិនត្រឹមត្រូវ', 'សំណើផ្ទៀងផ្ទាត់នេះមិនមាននៅក្នុងប្រព័ន្ធឡើយ', false), {
      status: 404,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  if (new Date() > authReq.expiresAt) {
    return new NextResponse(renderHtml('ផុតកំណត់', 'សំណើផ្ទៀងផ្ទាត់នេះបានផុតកំណត់សុពលភាពហើយ (លើសពី ៣ នាទី)', false), {
      status: 410,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  if (authReq.status !== 'PENDING') {
    return new NextResponse(
      renderHtml(
        authReq.status === 'APPROVED' ? 'បាន Approve រួចហើយ' : 'បានបដិសេធរួចហើយ',
        `សំណើនេះត្រូវបាន ${authReq.status === 'APPROVED' ? 'Approve' : 'Reject'} រួចរាល់ពីមុនមក។`,
        authReq.status === 'APPROVED'
      ),
      {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      }
    );
  }

  if (action === 'approve') {
    await prisma.adminAuthRequest.update({
      where: { id: authReq.id },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
      },
    });

    sendTelegramNotification(`✅ <b>ADMIN LOGIN APPROVED</b>\nAdmin <code>${authReq.email}</code> ត្រូវបានអនុញ្ញាតឱ្យចូលផ្ទាំង Admin ជោគជ័យ។`).catch(() => {});

    return new NextResponse(
      renderHtml(
        'បានយល់ព្រម (APPROVED)',
        'ការ Login ចូលផ្ទាំង Admin ត្រូវបានអនុញ្ញាតដោយជោគជ័យ! ផ្ទាំង Website របស់អ្នកនឹងបើកដំណើរការ Login ដោយស្វ័យប្រវត្តិ។ លោកអ្នកអាចបិទទំព័រនេះបាន។',
        true
      ),
      {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      }
    );
  } else {
    await prisma.adminAuthRequest.update({
      where: { id: authReq.id },
      data: {
        status: 'REJECTED',
      },
    });

    sendTelegramNotification(`⛔ <b>ADMIN LOGIN REJECTED</b>\nការប៉ុនប៉ងចូល Admin សម្រាប់ <code>${authReq.email}</code> ត្រូវបានបដិសេធចោល!`).catch(() => {});

    return new NextResponse(
      renderHtml(
        'បានបដិសេធ (REJECTED)',
        'សំណើចូលគណនី Admin ត្រូវបានបដិសេធ និងទប់ស្កាត់ជាស្ថាពរ!',
        false
      ),
      {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      }
    );
  }
}

function renderHtml(title: string, message: string, isSuccess: boolean) {
  const accentColor = isSuccess ? '#10B981' : '#EF4444';
  const icon = isSuccess ? '✅' : '⛔';

  return `<!DOCTYPE html>
<html lang="km">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - P-Two7 Security</title>
  <style>
    body {
      margin: 0;
      padding: 20px;
      font-family: system-ui, -apple-system, sans-serif;
      background: #090D18;
      color: #F8FAFC;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 90vh;
    }
    .card {
      max-width: 420px;
      width: 100%;
      background: rgba(15, 23, 42, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 24px;
      padding: 32px 24px;
      text-align: center;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(16px);
    }
    .icon {
      font-size: 54px;
      margin-bottom: 16px;
    }
    h1 {
      font-size: 20px;
      font-weight: 900;
      color: ${accentColor};
      margin: 0 0 12px 0;
    }
    p {
      font-size: 14px;
      line-height: 1.6;
      color: #94A3B8;
      margin: 0 0 24px 0;
    }
    .footer {
      font-size: 11px;
      color: #64748B;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding-top: 16px;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${icon}</div>
    <h1>${title}</h1>
    <p>${message}</p>
    <div class="footer">
      P-Two7 Store • Security 2FA Verification System
    </div>
  </div>
</body>
</html>`;
}
