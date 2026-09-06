import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';

function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return '';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let unitIndex = 0;
  let size = bytes;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size < 10 && unitIndex > 0 ? size.toFixed(1) : Math.round(size)} ${units[unitIndex]}`;
}

function detectExtension(nameOrUrl: string): string {
  const clean = nameOrUrl.split('?')[0].split('#')[0];
  const extMatch = clean.match(/\.([a-zA-Z0-9]{2,5})$/);
  if (extMatch) {
    return extMatch[1].toUpperCase();
  }
  return 'ZIP';
}

function cleanTitle(rawName: string): string {
  return decodeURIComponent(rawName)
    .replace(/\.[^/.]+$/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const { url } = await request.json();

    if (!url || typeof url !== 'string' || !url.startsWith('http')) {
      return NextResponse.json({ error: 'Invalid URL provided' }, { status: 400 });
    }

    let detectedTitle = '';
    let detectedSize = '';
    let detectedType = 'ZIP';

    // 1. Check Google Drive Link
    const gdriveMatch = url.match(/(?:\/d\/|id=)([a-zA-Z0-9_-]{25,})/);
    if (gdriveMatch) {
      const fileId = gdriveMatch[1];
      
      // Try Google Drive public API / download endpoint headers
      try {
        const directDownloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`;
        const headRes = await fetch(directDownloadUrl, {
          method: 'HEAD',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          },
          redirect: 'follow',
        });

        const contentLength = headRes.headers.get('content-length');
        const contentDisposition = headRes.headers.get('content-disposition');
        const contentType = headRes.headers.get('content-type');

        if (contentLength && parseInt(contentLength, 10) > 0) {
          detectedSize = formatBytes(parseInt(contentLength, 10));
        }

        if (contentDisposition) {
          const fnMatch = contentDisposition.match(/filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/i);
          if (fnMatch && fnMatch[1]) {
            const rawFilename = fnMatch[1];
            detectedType = detectExtension(rawFilename);
            detectedTitle = cleanTitle(rawFilename);
          }
        }

        // If file is large (>100MB), Google Drive shows confirmation page; fetch page html for og:title / size
        if (!detectedTitle || !detectedSize) {
          const viewRes = await fetch(`https://drive.google.com/file/d/${fileId}/view`, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            },
          });
          if (viewRes.ok) {
            const html = await viewRes.text();
            
            // Extract title from <meta property="og:title" content="..."> or <title>
            const ogTitleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i);
            const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
            const rawTitle = ogTitleMatch?.[1] || titleMatch?.[1]?.replace(/ - Google Drive$/, '') || '';
            if (rawTitle) {
              detectedType = detectExtension(rawTitle);
              detectedTitle = cleanTitle(rawTitle);
            }

            // Extract size if present in JSON or text (e.g. "5.4 GB" or "150 MB" or "(\d+\.?\d*\s*[KMGTP]B)")
            if (!detectedSize) {
              const sizeMatch = html.match(/(\d+(?:\.\d+)?\s*(?:GB|MB|KB|Bytes))/i);
              if (sizeMatch && sizeMatch[1]) {
                detectedSize = sizeMatch[1].toUpperCase();
              }
            }
          }
        }
      } catch (gErr) {
        console.warn('Google drive inspect failed:', gErr);
      }
    }

    // 2. Generic URL probing if size or title not yet found
    if (!detectedSize || !detectedTitle) {
      try {
        const probeRes = await fetch(url, {
          method: 'HEAD',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          },
          redirect: 'follow',
        });

        const len = probeRes.headers.get('content-length');
        if (len && parseInt(len, 10) > 0 && !detectedSize) {
          detectedSize = formatBytes(parseInt(len, 10));
        }

        const disp = probeRes.headers.get('content-disposition');
        if (disp) {
          const fnMatch = disp.match(/filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/i);
          if (fnMatch && fnMatch[1]) {
            const rawFilename = fnMatch[1];
            if (!detectedType || detectedType === 'ZIP') detectedType = detectExtension(rawFilename);
            if (!detectedTitle) detectedTitle = cleanTitle(rawFilename);
          }
        }
      } catch (probeErr) {
        console.warn('Generic URL probe failed:', probeErr);
      }
    }

    // 3. Fallback extraction from URL pathname
    if (!detectedTitle) {
      try {
        const parsed = new URL(url);
        const lastPart = parsed.pathname.split('/').filter(Boolean).pop();
        if (lastPart && !lastPart.includes('view') && !lastPart.includes('file')) {
          detectedType = detectExtension(lastPart);
          detectedTitle = cleanTitle(lastPart);
        }
      } catch {}
    }

    return NextResponse.json({
      success: true,
      title: detectedTitle || '',
      fileSize: detectedSize || '',
      fileType: detectedType || 'ZIP',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Inspection failed' }, { status: 500 });
  }
}
