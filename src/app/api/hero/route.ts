import { NextResponse } from 'next/server';
import { put, list, del } from '@vercel/blob';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 60);
}

export async function GET() {
  try {
    // Chercher le fichier hero.json dans le blob storage
    const { blobs } = await list({ prefix: 'editorial/hero.json' });
    const heroBlob = blobs.find(b => b.pathname === 'editorial/hero.json');

    if (!heroBlob) {
      return NextResponse.json({ enabled: false, blocks: [] });
    }

    const response = await fetch(heroBlob.url);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API Hero GET] Error:', error);
    return NextResponse.json({ error: 'Failed to read hero data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newData = await request.json();
    newData.updatedAt = new Date().toISOString();

    // 1. Récupérer l'actuel pour archivage
    const { blobs } = await list({ prefix: 'editorial/hero.json' });
    const existingBlob = blobs.find(b => b.pathname === 'editorial/hero.json');

    if (existingBlob) {
      try {
        const response = await fetch(existingBlob.url);
        const existing = await response.json();

        // 2. Archiver si titre différent et activé
        if (existing?.title && existing.title !== newData.title && existing.enabled) {
          const datePrefix = (existing.updatedAt || new Date().toISOString()).split('T')[0];
          const slug = slugify(existing.title);
          const archivePath = `editorial/archives/${datePrefix}-${slug}.json`;
          
          await put(archivePath, JSON.stringify(existing, null, 2), {
            access: 'public',
            addRandomSuffix: false
          });
          console.log(`[Admin] Article archivé sur Blob: ${archivePath}`);
        }
      } catch (e) {
        console.warn('[Admin] Erreur archivage Blob:', e);
      }
    }

    // 3. Sauvegarder le nouveau Hero
    const { url } = await put('editorial/hero.json', JSON.stringify(newData, null, 2), {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true
    });

    return NextResponse.json({ success: true, data: newData, url });
  } catch (error) {
    console.error('[API Hero POST] Error:', error);
    return NextResponse.json({ error: 'Failed to save hero data' }, { status: 500 });
  }
}
