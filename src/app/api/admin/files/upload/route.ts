import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { requireAdmin } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'សូមជ្រើសរើសឯកសារដើម្បី Upload' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const originalName = file.name;
    const ext = path.extname(originalName).toLowerCase().replace('.', '') || 'bin';
    
    // Format file size
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    const formattedSize = file.size > 1024 * 1024 * 1024
      ? `${(file.size / (1024 * 1024 * 1024)).toFixed(2)} GB`
      : `${sizeInMB} MB`;

    // Safe sanitized filename
    const safeBaseName = path.basename(originalName, path.extname(originalName))
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');
    const filename = `${Date.now()}-${safeBaseName}.${ext}`;

    const storageDir = path.join(process.cwd(), 'storage', 'files');
    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true });
    }

    const targetPath = path.join(storageDir, filename);
    fs.writeFileSync(targetPath, buffer);

    return NextResponse.json({
      success: true,
      filename,
      originalName,
      fileType: ext.toUpperCase(),
      fileSize: formattedSize,
      message: 'បាន Upload ឯកសារដោយជោគជ័យ!',
    });
  } catch (error: any) {
    console.error('File upload error:', error);
    return NextResponse.json({ error: error.message || 'មានបញ្ហាក្នុងការ Upload ឯកសារ' }, { status: 500 });
  }
}
