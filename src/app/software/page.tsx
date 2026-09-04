import React, { Suspense } from 'react';
import { Metadata } from 'next';
import prisma from '@/lib/prisma';
import FreeSoftwareClient from '@/components/software/FreeSoftwareClient';

export const metadata: Metadata = {
  title: 'ទាញយកកម្មវិធី & ឯកសារ Free 100% — P-Two7 Digital Store',
  description: 'មជ្ឈមណ្ឌលទាញយក Windows ISOs, Office Installers, Presets និង Software Tools ដោយឥតគិតថ្លៃ 100% Clean & Safe។',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function FreeSoftwarePage() {
  let files: any[] = [];
  let tutorials: any[] = [];

  try {
    const [dbFiles, dbTutorials] = await Promise.all([
      prisma.file.findMany({
        where: { isActive: true, isFree: true },
        include: { category: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.tutorial.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    files = dbFiles.map((f) => ({
      id: f.id,
      title: f.title,
      slug: f.slug,
      description: f.description,
      version: f.version,
      fileSize: f.fileSize,
      fileType: f.fileType,
      downloadCount: f.downloadCount,
      isFree: f.isFree,
      price: f.price,
      changelog: f.changelog,
      categoryId: f.categoryId,
      category: f.category,
      createdAt: f.createdAt.toISOString(),
    }));

    tutorials = dbTutorials.map((t) => ({
      id: t.id,
      title: t.title,
      slug: t.slug,
      description: t.description,
      category: t.category,
      steps: t.steps,
      videoUrl: t.videoUrl,
      createdAt: t.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error('Failed to load free software page data:', error);
  }

  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center text-slate-400">កំពុងផ្ទុក...</div>}>
      <FreeSoftwareClient initialFiles={files} initialTutorials={tutorials} />
    </Suspense>
  );
}
