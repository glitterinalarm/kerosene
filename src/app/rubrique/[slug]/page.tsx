import React from 'react';
import { fetchArticles } from '@/lib/rss';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { list } from '@vercel/blob';
import fs from 'fs';
import path from 'path';
import { THEMES_CONFIG } from '@/lib/config';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function matchesRubrique(category: string, categoriesConfig: string[]): boolean {
  const cat = category?.toUpperCase() || '';
  return categoriesConfig.some(rc => {
    const rcUpper = rc.toUpperCase();
    if (cat === rcUpper) return true;
    // Évite que "SOCIAL MEDIA" match "IA" par erreur
    const regex = new RegExp(`\\b${rcUpper.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    return regex.test(cat);
  });
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

function getHref(art: any): string {
  if (art.id === 'manual-hero' || art.blocks) return `/article/${art.id}`;
  if (art.link && art.link.startsWith('http')) return art.link;
  return `/article/${encodeURIComponent(art.id)}`;
}

function isInternal(art: any): boolean {
  return art.id === 'manual-hero' || !!art.blocks || (art.link === '#') || art.source === 'ÉDITORIAL KÉROSÈNE';
}

export default async function RubriquePage({ params }: PageProps) {
  const { slug } = await params;
  const rubrique = THEMES_CONFIG.find(t => t.slug === slug);

  if (!rubrique) {
    return (
      <div className="container" style={{ padding: '8vw', textAlign: 'center', minHeight: '60vh' }}>
        <h1 style={{ fontSize: '3vw', marginBottom: '2rem' }}>RUBRIQUE INTROUVABLE</h1>
        <Link href="/" style={{ opacity: 0.6 }}>← Retour à la Une</Link>
      </div>
    );
  }

  let articles = await fetchArticles();

  // Pour la rubrique KÉROSÈNE : articles manuels + archives
  let keroArchives: any[] = [];
  if (slug === 'kerosene') {
    // A. Tentative via Vercel Blob (PROD)
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const { blobs } = await list({ prefix: 'editorial/archives/' });
        
        const archivePromises = blobs
          .filter((b: any) => b.pathname.endsWith('.json'))
          .map(async (b: any) => {
            try {
              const res = await fetch(b.url);
              const data = await res.json();
              return { ...data, id: b.pathname.split('/').pop().replace('.json', ''), _isArchive: true };
            } catch { return null; }
          });
        
        keroArchives = (await Promise.all(archivePromises))
          .filter(Boolean)
          .sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
      } catch (e) {
        console.warn("[Rubrique] Erreur lecture archives Blob:", e);
      }
    }

    // B. Fallback via FS (Si pas de Blob ou vide)
    if (keroArchives.length === 0) {
      try {
        const archivesDir = path.join(process.cwd(), 'public', 'editorial', 'archives');
        if (fs.existsSync(archivesDir)) {
          const files = fs.readdirSync(archivesDir).filter(f => f.endsWith('.json'));
          keroArchives = files
            .map(f => {
              try {
                const data = JSON.parse(fs.readFileSync(path.join(archivesDir, f), 'utf8'));
                return { ...data, id: f.replace('.json', ''), _isArchive: true };
              } catch { return null; }
            })
            .filter(Boolean)
            .sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
        }
      } catch {}
    }
  }

  // Filtrage des articles RSS
  const filtered = articles.filter(a => {
    if (slug === 'kerosene') return a.source === 'ÉDITORIAL KÉROSÈNE';
    return matchesRubrique(a.category || '', rubrique.categories);
  });

  const allArticles = slug === 'kerosene'
    ? [...filtered, ...keroArchives]
    : filtered;

  return (
    <div className="rubrique-page">
      <header className="rubrique-header container theme-header-link">
        <div className="rubrique-tag">RUBRIQUE</div>
        
        <div className="theme-title-container">
          <h1 className="rubrique-title theme-title-big">{rubrique.name}</h1>
          <div className="theme-rollover-layer" style={{ transform: 'translateY(-50%)' }}>
            {rubrique.subTags.map((tag, i) => (
              <span key={i} className="theme-subtag">{tag}</span>
            ))}
          </div>
        </div>
      </header>

      <nav className="rubrique-nav container">
        <Link href="/" className="rubrique-back">
          <ArrowLeft size={14} /> RETOUR À LA UNE
        </Link>
      </nav>

      <section className="rubrique-grid container">
        {allArticles.length === 0 ? (
          <div className="rubrique-empty">
            <p>Aucun article pour cette rubrique pour l&apos;instant.</p>
            <p style={{ opacity: 0.4, fontSize: '0.8rem', marginTop: '1rem' }}>Les articles apparaîtront ici dès qu&apos;ils seront publiés.</p>
          </div>
        ) : (
          allArticles.map((art, i) => {
            const href = getHref(art);
            const internal = isInternal(art);
            return (
              <a
                key={art.id || i}
                href={href}
                target={internal ? '_self' : '_blank'}
                rel={internal ? undefined : 'noopener noreferrer'}
                className="rubrique-card"
              >
                <div className="rubrique-card-image">
                  {art.imageUrl
                    ? <img src={art.imageUrl} alt={art.title} />
                    : <div className="rubrique-card-no-img">{rubrique.name[0]}</div>
                  }
                  <span className="rubrique-card-source">{art.source}</span>
                </div>
                <div className="rubrique-card-body">
                  <span className="rubrique-card-cat">{art.category}</span>
                  <h2 className="rubrique-card-title" dangerouslySetInnerHTML={{ __html: art.title }} />
                  {art.excerpt && (
                    <p className="rubrique-card-excerpt">{art.excerpt}</p>
                  )}
                  <span className="rubrique-card-date">
                    {art.pubDate ? new Date(art.pubDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                  </span>
                </div>
              </a>
            );
          })
        )}
      </section>

      {/* Footer nav rubriques */}
      <section className="rubrique-footer-nav container">
        <p className="rubrique-footer-label">EXPLORER LES AUTRES RUBRIQUES</p>
        <div className="rubrique-footer-links">
          {THEMES_CONFIG
            .filter(r => r.slug !== slug)
            .map((r) => (
              <Link key={r.slug} href={`/rubrique/${r.slug}`} className="rubrique-footer-link">
                {r.name}
              </Link>
            ))}
        </div>
      </section>
    </div>
  );
}
