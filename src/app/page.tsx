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

  const mainArticle = articles[0]; // The top story
  const restArticles = articles.slice(1);

  const themes = [
    "GRAPHISME",
    "PUBLICITÉ",
    "ACTIVATION DIGITALE",
    "DROP",
    "TREND"
  ];

  const groupedArticles = themes.map(theme => {
    return {
      name: theme,
      articles: restArticles.filter(a => {
        const cat = a.category?.toUpperCase() || "";
        const t = theme.toUpperCase();
        if (cat.includes(t) || t.includes(cat)) return true;
        
        // MAPPING DE RÉSILLIENCE
        if (t === "PUBLICITÉ" && (cat.includes("AD") || cat.includes("PUB"))) return true;
        if (t === "ACTIVATION DIGITALE" && (cat.includes("DIGITAL") || cat.includes("EXPERIENCE") || cat.includes("WEB"))) return true;
        if (t === "GRAPHISME" && (cat.includes("DESIGN") || cat.includes("BRANDING") || cat.includes("LOGO"))) return true;
        if (t === "DROP" && (cat.includes("STREET") || cat.includes("FASHION") || cat.includes("SNEAKER"))) return true;
        
        return false;
      }).slice(0, 6)
    };
  });

  return (
    <>
      {mainArticle && (
        <a href={`/article/${mainArticle.id}`} className="bento-hero-link">
          <section className="bento-hero container">
            <div className="bento-visuals">
               <span className="bento-visual-label">À LA UNE</span>
               <img src={mainArticle.imageUrl} alt={mainArticle.title} />
            </div>
            
            <div className="bento-text-block">
               <div className="bento-title-layer">
                  <h2 className="bento-title" dangerouslySetInnerHTML={{ __html: mainArticle.title }}></h2>
               </div>
               <div className="bento-insight-layer">
                  <div className="bento-insight-text">
                    {mainArticle.insight 
                      ? <div dangerouslySetInnerHTML={{ __html: mainArticle.insight }}></div>
                      : <p>{mainArticle.excerpt}</p>
                    }
                  </div>
                  <div className="bento-cta">LIRE L'ANALYSE —</div>
               </div>
            </div>
          </section>
        </a>
      )}

      <section className="themes-section container">
        {groupedArticles.map((group, idx) => (
          <div key={idx} className="theme-block">
            <div className="theme-header">
              <div className="theme-title-wrapper">
                <div className="theme-live-dot"></div>
                <h2 className="theme-title">{group.name}</h2>
              </div>
            </div>
            
            <div className="theme-grid">
              {group.articles.length > 0 ? (
                group.articles.map((art) => {
                  return (
                    <div className="theme-card" key={art.id}>
                      <div className="theme-card-image">
                         <img src={art.imageUrl} alt={art.title} />
                      </div>
                      <div className="theme-card-info">
                        <span className="theme-card-category">{art.category}</span>
                        <h3 className="theme-card-title" dangerouslySetInnerHTML={{ __html: art.title }}></h3>
                        <div className="theme-card-insight" dangerouslySetInnerHTML={{ 
                           __html: art.insight || art.excerpt || "" 
                        }}></div>
                        
                        <a href={art.link} target="_blank" rel="noopener noreferrer" className="theme-card-source">
                          ➔ LIRE LA SOURCE : {art.source}
                        </a>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ opacity: 0.3, padding: '2rem 0', gridColumn: 'span 3' }}>
                  Analyse en cours pour cette thématique...
                </div>
              )}
            </div>
          </div>
        ))}
      </section>
      
      {/* MANIFESTO FOOTER */}
      <section className="manifesto container">
          <h2>Seule compte l&apos;exigence du craft et la radicalité de l&apos;idée.</h2>
      </section>
    </>
  );
}
