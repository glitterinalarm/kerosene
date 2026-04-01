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

      {/* 2. HERO IMAGE OR VIDEO - FULL WIDTH CALIBRATED */}
      <div className="article-hero-visual">
        {article.videoUrl ? (
          article.videoUrl.includes('youtube.com') || article.videoUrl.includes('youtu.be') || /^[a-zA-Z0-9_-]{11}$/.test(article.videoUrl) ? (
            <iframe 
              width="100%" 
              height="100%" 
              src={`https://www.youtube.com/embed/${article.videoUrl.includes('v=') ? article.videoUrl.split('v=')[1].split('&')[0] : article.videoUrl}`} 
              title="YouTube video player" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              allowFullScreen
            ></iframe>
          ) : (
            <video 
              width="100%" 
              height="100%" 
              controls 
              autoPlay 
              muted 
              loop 
              style={{ objectFit: 'cover' }}
            >
              <source src={article.videoUrl} type="video/mp4" />
              Votre navigateur ne supporte pas la lecture de vidéos.
            </video>
          )
        ) : article.imageUrl && (
          <img src={article.imageUrl} alt={article.title} />
        )}
      </div>

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
          {article.link && article.link !== '#' && (
            <div className="info-item">
              <a href={article.link} target="_blank" rel="noopener noreferrer" className="article-source-link">
                {article.source && article.source !== 'ÉDITORIAL KÉROSÈNE' ? article.source : 'SOURCE OFFICIELLE'} →
              </a>
            </div>
          )}
        </aside>

        <main className="article-main-body">
          {article.blocks && article.blocks.length > 0 ? (
            <div className="article-blocks-container">
               {article.blocks.map((block, idx) => {
                 if (block.type === 'text') {
                   return <div key={idx} className="article-rich-text" dangerouslySetInnerHTML={{ __html: block.content }} />;
                 }
                 if (block.type === 'image' && block.content) {
                   return (
                     <figure key={idx} className="block-figure full-bleed">
                        <img src={block.content} alt="" className="block-img" />
                     </figure>
                   );
                 }
                 if ((block.type === 'youtube' || block.type === 'video') && block.content) {
                    const ytId = block.content.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/) 
                                 ? block.content.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/)![1] 
                                 : (block.content.length === 11 ? block.content : null);

                    return (
                      <div key={idx} className="block-video-wrapper full-bleed">
                         {ytId ? (
                           <iframe 
                              src={`https://www.youtube.com/embed/${ytId}?controls=1&modestbranding=1`} 
                              frameBorder="0" allowFullScreen
                           ></iframe>
                         ) : (
                           <video controls autoPlay muted loop><source src={block.content} type="video/mp4" /></video>
                         )}
                      </div>
                    );
                 }
                 return null;
               })}
            </div>
          ) : (
            <>
              <div className="article-rich-text" dangerouslySetInnerHTML={{ __html: article.insight || "" }} />
              
              {article.longform && article.longform.slides && (
                <div className="article-supplementary-gallery">
                  {article.longform.slides.map((slide, i) => (
                    <figure key={i} className="gallery-article-figure">
                      {slide.video ? (
                         slide.video.includes('youtube.com') || slide.video.includes('youtu.be') || /^[a-zA-Z0-9_-]{11}$/.test(slide.video) ? (
                            <div className="gallery-video-wrapper">
                               <iframe 
                                  width="100%" 
                                  height="100%" 
                                  src={`https://www.youtube.com/embed/${slide.video.includes('v=') ? slide.video.split('v=')[1].split('&')[0] : slide.video}`} 
                                  frameBorder="0" 
                                  allowFullScreen
                               ></iframe>
                            </div>
                         ) : (
                            <video controls className="gallery-img-full"><source src={slide.video} type="video/mp4" /></video>
                         )
                      ) : slide.image && <img src={slide.image} alt={slide.caption} className="gallery-img-full" />}
                      {slide.caption && <figcaption className="gallery-caption-brutal">{slide.caption}</figcaption>}
                      {slide.text && <p className="gallery-description-text" dangerouslySetInnerHTML={{ __html: slide.text }} />}
                    </figure>
                  ))}
                </div>
              )}
            </>
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
