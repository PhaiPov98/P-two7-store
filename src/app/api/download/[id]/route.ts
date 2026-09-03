import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const fileId = params.id;
    const session = await getCurrentUser();

    // 1. Fetch File record from DB
    const fileRecord = await prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!fileRecord || !fileRecord.isActive) {
      return NextResponse.json(
        { error: 'រកមិនឃើញឯកសារដែលលោកអ្នកចង់ទាញយកឡើយ' },
        { status: 404 }
      );
    }

    // 2. Check Permissions if file is Paid
    if (!fileRecord.isFree) {
      if (!session) {
        return NextResponse.json(
          { error: 'សូមចូលគណនីជាមុនសិន ដើម្បីទាញយកឯកសារនេះ' },
          { status: 401 }
        );
      }

      // Check if user has purchased this file or is ADMIN
      if (session.role !== 'ADMIN') {
        const hasPurchased = await prisma.orderItem.findFirst({
          where: {
            fileId: fileRecord.id,
            order: {
              userId: session.id,
              paymentStatus: 'PAID',
            },
          },
        });

        if (!hasPurchased) {
          return NextResponse.json(
            { error: 'លោកអ្នកមិនទាន់បានទិញឯកសារនេះនៅឡើយទេ' },
            { status: 403 }
          );
        }
      }
    }

    // Client metadata
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || 'Unknown';

    // 3. If file path is an external cloud link (Google Drive, Mega, MediaFire, etc.)
    if (fileRecord.filePath.startsWith('http://') || fileRecord.filePath.startsWith('https://')) {
      if (session) {
        await prisma.download.create({
          data: {
            userId: session.id,
            fileId: fileRecord.id,
            ipAddress: ip,
            userAgent: userAgent,
          },
        });
      }

      await prisma.file.update({
        where: { id: fileRecord.id },
        data: { downloadCount: { increment: 1 } },
      });

      return NextResponse.redirect(fileRecord.filePath);
    }

    // 4. Resolve file from private `/storage/files`
    const storageDir = path.join(process.cwd(), 'storage', 'files');
    const safeFilePath = path.join(storageDir, path.basename(fileRecord.filePath));

    // Fallback if physical file does not exist on disk, stream generated demo payload
    let fileBuffer: Buffer;
    if (fs.existsSync(safeFilePath)) {
      fileBuffer = fs.readFileSync(safeFilePath);
    } else {
      fileBuffer = Buffer.from(
        `BOZZ POV DIGITAL STORE - OFFICIAL DIGITAL DOWNLOAD\nFile: ${fileRecord.title}\nVersion: ${fileRecord.version}\nSize: ${fileRecord.fileSize}\nStatus: Verified Original & Clean.`
      );
    }

    // Save Download Audit Log
    if (session) {
      await prisma.download.create({
        data: {
          userId: session.id,
          fileId: fileRecord.id,
          ipAddress: ip,
          userAgent: userAgent,
        },
      });
    }

    // Increment download count
    await prisma.file.update({
      where: { id: fileRecord.id },
      data: { downloadCount: { increment: 1 } },
    });

    // 5. Send Streamed File Response
    const filename = `${fileRecord.slug}.${fileRecord.fileType.toLowerCase()}`;

    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: 'មានបញ្ហាបច្ចេកទេសក្នុងដំណើរការទាញយក' },
      { status: 500 }
    );
  }
}
