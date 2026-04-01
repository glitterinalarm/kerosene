import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const HERO_PATH = path.join(process.cwd(), 'public', 'editorial', 'hero.json');
const ARCHIVES_DIR = path.join(process.cwd(), 'public', 'editorial', 'archives');

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
    const fileContent = fs.readFileSync(HERO_PATH, 'utf8');
    const data = JSON.parse(fileContent);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read hero data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newData = await request.json();
    newData.updatedAt = new Date().toISOString();

    // Archiver l'article actuel avant d'écraser
    if (fs.existsSync(HERO_PATH)) {
      try {
        const existing = JSON.parse(fs.readFileSync(HERO_PATH, 'utf8'));
        // N'archiver que si l'article a un titre et des données différentes du nouveau
        if (existing?.title && existing.title !== newData.title && existing.enabled) {
          if (!fs.existsSync(ARCHIVES_DIR)) {
            fs.mkdirSync(ARCHIVES_DIR, { recursive: true });
          }
          const datePrefix = (existing.updatedAt || new Date().toISOString()).split('T')[0];
          const slug = slugify(existing.title);
          const archivePath = path.join(ARCHIVES_DIR, `${datePrefix}-${slug}.json`);
          fs.writeFileSync(archivePath, JSON.stringify(existing, null, 2));
          console.log(`[Admin] Article archivé: ${datePrefix}-${slug}.json`);
        }
      } catch (e) {
        console.warn('[Admin] Erreur archivage:', e);
      }
    }

    fs.writeFileSync(HERO_PATH, JSON.stringify(newData, null, 2));
    return NextResponse.json({ success: true, data: newData });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save hero data' }, { status: 500 });
  }
}
