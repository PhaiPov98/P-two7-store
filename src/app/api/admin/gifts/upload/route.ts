import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'សូមជ្រើសរើស File ដើម្បី Upload' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const originalName = file.name;
    const ext = path.extname(originalName).toLowerCase().replace('.', '') || 'bin';

    // Format file size
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    const formattedSize =
      file.size > 1024 * 1024 * 1024
        ? `${(file.size / (1024 * 1024 * 1024)).toFixed(2)} GB`
        : `${sizeInMB} MB`;

    // Safe sanitized filename
    const safeBaseName = path
      .basename(originalName, path.extname(originalName))
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');
    const filename = `${Date.now()}-${safeBaseName}.${ext}`;

    const storageDir = path.join(process.cwd(), 'storage', 'files');
    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true });
    }

    const targetPath = path.join(storageDir, filename);
    fs.writeFileSync(targetPath, buffer);

    // Find default category or first available category
    let category = await prisma.category.findFirst();
    if (!category) {
      category = await prisma.category.create({
        data: {
          nameKm: 'General Gifts',
          nameEn: 'General Gifts',
          slug: 'general-gifts',
        },
      });
    }

    // Create File record in DB so it can be downloaded via `/api/download/[id]`
    const fileRecord = await prisma.file.create({
      data: {
        title: originalName,
        slug: `gift-${Date.now()}-${safeBaseName}`.slice(0, 50),
        description: 'ឯកសារកាដូពិសេសពី Admin',
        version: '1.0',
        fileType: ext.toUpperCase(),
        fileSize: formattedSize,
        filePath: filename,
        isFree: true,
        categoryId: category.id,
      },
    });

    return NextResponse.json({
      success: true,
      fileId: fileRecord.id,
      downloadUrl: `/api/download/${fileRecord.id}`,
      filename,
      originalName,
      fileSize: formattedSize,
      title: originalName,
    });
  } catch (error: any) {
    console.error('Gift file upload error:', error);
    return NextResponse.json(
      { error: error.message || 'មានបញ្ហាក្នុងការ Upload ឯកសារកាដូ' },
      { status: 500 }
    );
  }
}
