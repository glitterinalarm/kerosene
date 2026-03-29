import React from 'react';
import { fetchArticles } from '@/lib/rss';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface HomeProps {
  searchParams: Promise<{ date?: string }>;
}

function getArticleHref(id: string, link: string, isHeadline: boolean = false): string {
  if (!isHeadline && link.startsWith('http')) {
    return link;
  }
  return `/article/${encodeURIComponent(id)}`;
}

export default async function Home({ searchParams }: HomeProps) {
  const { date } = await searchParams;
  let articles = await fetchArticles();

  // Filtrage temporel
  if (date) {
    articles = articles.filter(art => {
      const artDate = art.pubDate ? new Date(art.pubDate).toISOString().split('T')[0] : '';
      return artDate === date;
    });
  }

  if (!articles || articles.length === 0) {
    return (
      <div className="container" style={{ padding: '8vw', textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <h2 className="title-bold" style={{ fontSize: '4vw', marginBottom: '2rem' }}>ARCHIVES VIDES</h2>
        <p style={{ opacity: 0.6, maxWidth: '600px', margin: '0 auto' }}>Désolé, l&apos;algorithme n&apos;a pas retenu de signal créatif majeur pour cette date spécifique. Le flux reprendra son cours normal dès demain.</p>
        <Link href="/" className="edito-label" style={{ display: 'inline-block', marginTop: '3rem', position: 'static' }}>Retour à la Une</Link>
      </div>
    );
  }

  // La hiérarchie visuelle (Entonnoir de lecture)
  const mainArticle = articles[0];            // 100% Largeur (Hero)
  const brefArticles = articles.slice(1);     // Le reste : Le fil dense et asymétrique (Redirection directe)

  return (
    <>
      {/* 1. HERO BENTO BOX (CLICKABLE) */}
      <Link href={getArticleHref(mainArticle.id, mainArticle.link, true)} className="bento-hero-link">
        <section className="bento-hero container">
          <div className="bento-visuals">
             <span className="bento-visual-label">{mainArticle.category}</span>
             {mainArticle.longform && mainArticle.longform.slides.length > 0 ? (
                 mainArticle.longform.slides.map((slide, i) => (
                     slide.image && <img key={i} src={slide.image} alt={`Slide ${i}`} />
                 ))
             ) : (
                 <img src={mainArticle.imageUrl} alt={mainArticle.title} />
             )}
          </div>
          
          <div className="bento-text-block">
             <div className="bento-title-layer">
                <h2 className="bento-title" dangerouslySetInnerHTML={{ __html: mainArticle.title }}></h2>
             </div>
             <div className="bento-insight-layer">
                <div className="bento-insight-text">
                  {mainArticle.insight 
                    ? mainArticle.insight.replace(/<[^>]*>?/gm, '').substring(0, 320) + "..."
                    : (mainArticle.excerpt || "").substring(0, 320) + "..."
                  }
                </div>
                <div className="bento-cta">LIRE LA SUITE —</div>
             </div>
          </div>
        </section>
      </Link>

      {/* 2. LE FIL : Bento dense asymétrique */}
      {brefArticles.length > 0 && (
        <section className="fil-section container">
          <h2 className="section-title">Le Fil Créatif.</h2>
          <div className="fil-grid">
            {brefArticles.map((art, i) => {
                const isWide = i % 5 === 0;
                const href = getArticleHref(art.id, art.link, false);
                const isExternal = href.startsWith('http');
                
                return (
                <Link 
                  href={href} 
                  className={`fil-card ${isWide ? 'fil-card-wide' : ''}`} 
                  key={art.id}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noopener noreferrer" : undefined}
                >
                  {art.imageUrl && (
                      <div className="fil-image-wrapper">
                          <img src={art.imageUrl} alt={art.title} />
                      </div>
                  )}
                  <div>
                      <span className="fil-category">{art.category}</span>
                      <h4 dangerouslySetInnerHTML={{ __html: art.title }}></h4>
                      <span className="fil-source">{art.source}</span>
                  </div>
                </Link>
                );
            })}
          </div>
        </section>
      )}
      
      {/* MANIFESTO FOOTER */}
      <section className="manifesto container">
          <h2>Seule compte l&apos;exigence du craft et la radicalité de l&apos;idée.</h2>
      </section>
    </>
  );
}
