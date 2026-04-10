import React from 'react';
import { fetchArticles } from '@/lib/rss';
import Link from 'next/link';
import SwipeCarousel from '@/components/SwipeCarousel';
import { THEMES_CONFIG } from '@/lib/config';

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

  const mainArticle = articles[0]; // The top story (potentially the manual hero)
  const restArticles = articles.slice(1);

  const groupedArticles = THEMES_CONFIG.map(themeObj => {
    return {
      ...themeObj,
      articles: articles.filter(a => {
        if (themeObj.name === "KÉROSÈNE") {
          const isEdito = a.source?.includes('KÉROSÈNE') || a.source?.includes('IA') || a.id === 'manual-hero';
          if (!isEdito) return false;
          return a.id !== mainArticle.id;
        }

        if (a.id === mainArticle.id) return false;

        const cat = a.category?.toUpperCase() || '';
        
        // Exact match via categories config
        if (themeObj.categories.some(rc => cat.includes(rc.toUpperCase()) || rc.toUpperCase().includes(cat))) return true;
        
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
                {mainArticle.longform && mainArticle.longform.slides.length > 1 ? (
                  <SwipeCarousel>
                    {mainArticle.longform.slides.map((slide, i) => (
                      <div key={i} className="carousel-slide hero-slide">
                         {slide.video ? (
                            slide.video.includes('youtube.com') || slide.video.includes('youtu.be') || /^[a-zA-Z0-9_-]{11}$/.test(slide.video) ? (
                              <iframe 
                                 width="100%" height="100%" 
                                 src={`https://www.youtube.com/embed/${slide.video.includes('v=') ? slide.video.split('v=')[1].split('&')[0] : slide.video}?autoplay=1&mute=1&loop=1&playlist=${slide.video.includes('v=') ? slide.video.split('v=')[1].split('&')[0] : slide.video}`} 
                                 frameBorder="0" allowFullScreen
                              ></iframe>
                            ) : (
                              <video autoPlay muted loop className="hero-full-video"><source src={slide.video} type="video/mp4" /></video>
                            )
                         ) : (
                            <img src={slide.image || mainArticle.imageUrl} alt={mainArticle.title} />
                         )}
                      </div>
                    ))}
                  </SwipeCarousel>
                ) : (
                  mainArticle.videoUrl ? (
                    (() => {
                        const ytId = mainArticle.videoUrl.match(/(?:v=|\/v\/|embed\/|youtu\.be\/|shorts\/)([\w-]{11})/) 
                                     ? mainArticle.videoUrl.match(/(?:v=|\/v\/|embed\/|youtu\.be\/|shorts\/)([\w-]{11})/)![1] 
                                     : (mainArticle.videoUrl.length === 11 ? mainArticle.videoUrl : null);
                        
                        if (ytId) {
                          return (
                            <iframe 
                               width="100%" height="100%" 
                               src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&loop=1&playlist=${ytId}&controls=0&modestbranding=1`} 
                               frameBorder="0" allow="autoplay; encrypted-media" allowFullScreen
                               className="hero-iframe"
                            ></iframe>
                          );
                        }
                        return <video autoPlay muted loop className="hero-full-video"><source src={mainArticle.videoUrl} type="video/mp4" /></video>;
                    })()
                  ) : (
                    <img src={mainArticle.imageUrl} alt={mainArticle.title} />
                  )
                )}
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

      {/* FIL D'ACTUALITÉ (Carousel des dernières news) */}
      <section className="fil-section container">
        <h2 className="section-title">FIL D&apos;ACTUALITÉ</h2>
        <div className="fil-carousel-wrapper">
          <SwipeCarousel>
            {restArticles.slice(0, 12).map((art, i) => (
              <div key={art.id || i} className="carousel-slide fil-slide">
                <a href={art.link} target="_blank" rel="noopener noreferrer" className="fil-card">
                  <div className="fil-image-wrapper">
                    <img src={art.imageUrl} alt={art.title} />
                  </div>
                  <div className="fil-card-content">
                    <span className="fil-category">{art.category}</span>
                    <h4 dangerouslySetInnerHTML={{ __html: art.title }}></h4>
                    <span className="fil-source">{art.source}</span>
                  </div>
                </a>
              </div>
            ))}
          </SwipeCarousel>
        </div>
      </section>

      <section className="themes-section container">
        {groupedArticles.map((group, idx) => (
          <div key={idx} className="theme-block">
            <Link href={`/rubrique/${group.slug}`} className="theme-header-link">
              <div className="theme-header">
                <div className="theme-rubrique-tag">RUBRIQUE</div>
                
                <div className="theme-title-container">
                  <h2 className="theme-title-big">{group.name}</h2>
                  <div className="theme-rollover-layer">
                    {group.subTags.map((tag: string, i: number) => (
                      <span key={i} className="theme-subtag">{tag}</span>
                    ))}
                  </div>
                </div>

                {group.desc && <p className="theme-desc">{group.desc}</p>}
              </div>
            </Link>
            
            <div className="theme-grid">
              {group.articles.length > 0 ? (
                group.articles.map((art) => (
                  <a href={art.link} target="_blank" rel="noopener noreferrer" className="theme-card hover-reveal" key={art.id}>
                    <div className="theme-card-image">
                       <img src={art.imageUrl} alt={art.title} />
                       <div className="theme-card-hover-layer">
                          <div className="theme-card-hover-content" dangerouslySetInnerHTML={{ 
                             __html: art.insight || art.excerpt || "" 
                          }}></div>
                       </div>
                    </div>
                    <div className="theme-card-info">
                      <span className="theme-card-category">{art.category}</span>
                      <h3 className="theme-card-title" dangerouslySetInnerHTML={{ __html: art.title }}></h3>
                    </div>
                  </a>
                ))
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
