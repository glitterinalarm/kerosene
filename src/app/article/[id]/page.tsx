import React from 'react';
import { getArticleById } from '@/lib/rss';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface ArticlePageProps {
  params: Promise<{ id: string }>;
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { id } = await params;
  const article = await getArticleById(id);

  if (!article) {
    notFound();
  }

  const wordCount = (article.insight || '').replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(3, Math.ceil(wordCount / 200));

  return (
    <article className="article-page">
      {/* 1. TOP NAVIGATION BAR */}
      <nav className="article-nav-top">
        <div className="article-content-wrapper">
          <Link href="/" className="back-link">
            <ArrowLeft size={16} />
            RETOUR À LA UNE
          </Link>
        </div>
      </nav>

      <div className="article-content-wrapper">
        <header className="article-header">
          <div className="article-metadata-eyebrow">
            <span className="article-badge">{article.category}</span>
            <span className="article-source-tag">{article.source}</span>
          </div>

          <h1 className="article-title-giant" dangerouslySetInnerHTML={{ __html: article.title }} />
          
          <div className="article-lead">
            <p>{article.excerpt}</p>
          </div>
        </header>
      </div>

      {/* 2. HERO IMAGE - FULL WIDTH CALIBRATED */}
      {article.imageUrl && (
        <div className="article-hero-visual">
          <img src={article.imageUrl} alt={article.title} />
        </div>
      )}

      {/* 3. MAIN CONTENT - SINGLE COLUMN FOCUS */}
      <div className="article-content-wrapper main-layout">
        <aside className="article-info-bar">
          <div className="info-item">
            <span className="info-label">DATE</span>
            <p className="info-value">
              {new Date(article.pubDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="info-item">
            <span className="info-label">CRÉDITS</span>
            <p className="info-value">{article.source}</p>
          </div>
          <div className="info-item">
            <span className="info-label">LECTURE</span>
            <p className="info-value">{readingTime} MIN</p>
          </div>
          {article.link && (
            <div className="info-item">
              <a href={article.link} target="_blank" rel="noopener noreferrer" className="article-source-link">
                SOURCE OFFICIELLE →
              </a>
            </div>
          )}
        </aside>

        <main className="article-main-body">
          <div className="article-rich-text" dangerouslySetInnerHTML={{ __html: article.insight || "" }} />
          
          {article.longform && article.longform.slides && (
            <div className="article-supplementary-gallery">
              {article.longform.slides.map((slide, i) => (
                <figure key={i} className="gallery-article-figure">
                  {slide.image && <img src={slide.image} alt={slide.caption} className="gallery-img-full" />}
                  {slide.caption && <figcaption className="gallery-caption-brutal">{slide.caption}</figcaption>}
                  {slide.text && <p className="gallery-description-text" dangerouslySetInnerHTML={{ __html: slide.text }} />}
                </figure>
              ))}
            </div>
          )}

          {/* ARTICLE FOOTER */}
          <footer className="article-footer-cta">
            <div className="article-footer-divider" />
            <div className="article-footer-actions">
              <Link href="/" className="article-footer-back">
                ← RETOUR À LA UNE
              </Link>
              {article.link && (
                <a href={article.link} target="_blank" rel="noopener noreferrer" className="article-footer-source">
                  LIRE L'ARTICLE ORIGINAL →
                </a>
              )}
            </div>
          </footer>
        </main>
      </div>
    </article>
  );
}
