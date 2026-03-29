import Parser from 'rss-parser';

export type Article = {
  id: string;
  title: string;
  link: string;
  source: string;
  category: string;
  pubDate: string;
  imageUrl?: string;
  excerpt?: string;
  insight?: string | null;
  content?: string;
  summary?: string;
  longform?: {
    slides: {
      text: string;
      image?: string;
      caption?: string;
    }[];
  };
};

// Parser RSS configuré
const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'mediaContent'],
      ['content:encoded', 'contentEncoded'],
      ['description', 'description'],
    ]
  }
});

const feeds = [
  { name: "It's Nice That", url: "https://www.itsnicethat.com/articles.rss", category: "Graphic Design" },
  { name: "Ads of the World", url: "https://www.adsoftheworld.com/feed", category: "Advertising" },
  { name: "The Drum", url: "https://www.thedrum.com/news/feed", category: "Advertising" },
  { name: "Highsnobiety", url: "https://www.highsnobiety.com/feeds/rss", category: "Style & Culture" },
  { name: "Creative Review", url: "https://www.creativereview.co.uk/feed/", category: "Review" },
  { name: "Graphéine", url: "https://www.grapheine.com/feed", category: "Design" },
  { name: "The Design Blog", url: "https://thedsgnblog.com/rss", category: "Branding" },
  { name: "Brand Magazine", url: "https://www.brandingmag.com/feed/", category: "Branding" },
  { name: "AdAge", url: "https://adage.com/rss.xml", category: "Advertising" },
];

function decodeHTMLEntities(text: string): string {
  if (!text) return text;
  return text
    .replace(/&#039;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#\d+;/g, "") 
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8211;/g, "-")
    .replace(/&#8212;/g, "-")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"');
}

function extractImageFromContent(content: string = ''): string | null {
  const match = content.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match ? match[1] : null;
}

/**
 * MOTEUR D'ANALYSE (VF Club DA)
 * Note: La majorité de l'analyse est désormais gérée par le Cron Job via Gemini Grounding.
 */
function generateRealAnalysis(_title: string): { insight: string; longform?: Article['longform'] } {
    return {
        insight: `
            <p>Un signal créatif fort qui mérite notre attention. Dans un flux saturé, cette approche se distingue par sa justesse d'exécution et sa capacité à bousculer les codes établis de son segment.</p>
            <p>L'analyse approfondie de ce cas est disponible dans l'édition quotidienne de KÉROSÈNE, où nos modèles de grounding identifient les assets réels et les enjeux stratégiques.</p>
        `,
    };
}

async function fetchOgData(url: string): Promise<{ image: string | null; title: string | null }> {
  try {
    const res = await fetch(url, { next: { revalidate: 86400 } });
    const html = await res.text();
    const imgMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) || 
                     html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
                     
    const titleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i) || 
                     html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i) ||
                     html.match(/<title>(.*?)<\/title>/i);
                     
    let title = titleMatch ? titleMatch[1] : null;
    if (title) {
        title = title.replace(/&#8211;/g, '-').replace(/&#8217;/g, "'").replace(/&amp;/g, '&');
        title = title.split(' | ')[0].split(' - ')[0].trim();
    }

    return { 
        image: imgMatch ? imgMatch[1] : null,
        title: title
    };
  } catch {
    return { image: null, title: null };
  }
}

export async function fetchArticles(): Promise<Article[]> {
  let allArticles: Article[] = [];
  let aiArticles: Article[] = [];

  // 1. TENTATIVE DE RÉCUPÉRATION DU BLOB (CONTENU IA DU JOUR)
  try {
    // On utilise un Timestamp pour casser le cache du navigateur/Vercel
    const blobUrl = "https://2vfzwmqqws8h2xfv.public.blob.vercel-storage.com/editorial/daily.json";
    const res = await fetch(`${blobUrl}?t=${Date.now()}`, { cache: 'no-store' });
    
    if (res.ok) {
        const data = await res.json();
        if (data && data.articles) {
            aiArticles = (data.articles as Article[]).map((a) => ({
                ...a,
                link: `/article/${a.id}`,
                source: "KÉROSÈNE ÉDITORIAL (IA)",
                pubDate: data.date || new Date().toISOString(),
                // FALLBACKS RÉSILIENTS
                insight: a.insight || a.content || a.summary || "Analyse en cours...",
                excerpt: a.excerpt || a.summary || "Décryptage technique.",
                imageUrl: (a.imageUrl || "").replace(/\s/g, '').trim() || "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2000&auto=format&fit=crop",
                longform: a.longform || (a.content ? { slides: [{ text: a.content, image: a.imageUrl }] } : { slides: [] })
            }));
            console.log(`[RSS] ${aiArticles.length} AI articles injected from Blob (Resilient Mode).`);
        }
    }
  } catch (e) {
    console.warn("[RSS] Erreur lecture Blob:", e);
  }

  // 2. Fetching all feeds in parallel for speed
  const feedPromises = feeds.map(async (feed) => {
    try {
      // Revalidation set to 1 hour (3600s)
      const response = await fetch(feed.url, { next: { revalidate: 3600 } });
      const text = await response.text();
      const parsed = await parser.parseString(text);

      // Fetch more items (e.g., 15) to actually populate archives and ensure stability
      const items = parsed.items.slice(0, 15);
      
      // We fetch OG data in parallel for items of this single feed too
      const itemsPromises = items.map(async (item) => {
        let imageUrl: string | null = null;
        let realTitle: string | null = null;
        
        const actualLink = typeof item.link === 'string' ? item.link : (((item.link as unknown as { href?: string })?.href as string) || '#');
        const articleId = Buffer.from(rawIdFrom(item)).toString('base64url');
        
        // Fallback images from feed content if OG failed
        const feedImageUrl = item.mediaContent?.['$']?.url || extractImageFromContent(item.contentEncoded) || extractImageFromContent(item.description);

        // If we have no image from feed, AND we have a link, try to fetch OG data
        if (!feedImageUrl && actualLink !== '#' && actualLink.startsWith('http')) {
            const ogData = await fetchOgData(actualLink);
            imageUrl = ogData.image;
            realTitle = ogData.title;
        } else {
            imageUrl = feedImageUrl;
        }

        // IMPORTANT: We do NOT skip articles if image is missing anymore
        // But we provide a default placeholder if really nothing is found
        const finalImageUrl = imageUrl || "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1000&auto=format&fit=crop";

        let finalTitle = realTitle || item.title || "Sans Titre";
        
        if (feed.name === "The Design Blog") {
             const rawDesc = (item.description || item.contentEncoded || '');
             const plainText = rawDesc.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
             let cleanText = plainText.replace(/^(BRANDING\s*|DESIGN\s*|PACKAGING\s*)/i, '').trim();
             if (cleanText.startsWith('Identity')) cleanText = "Identity" + cleanText.substring(8);
             if (cleanText.length > 10) {
                  finalTitle = cleanText.substring(0, 90) + (cleanText.length > 90 ? "..." : "");
             }
        } 

        finalTitle = decodeHTMLEntities(finalTitle);
        const editorialData = generateRealAnalysis(finalTitle);
        
        return {
          id: articleId,
          title: finalTitle,
          link: actualLink,
          source: feed.name,
          category: feed.category,
          pubDate: item.pubDate || new Date().toISOString(),
          imageUrl: finalImageUrl,
          insight: editorialData.insight,
          longform: editorialData.longform || { slides: [{ text: editorialData.insight, image: finalImageUrl }] },
          excerpt: item.contentSnippet ? decodeHTMLEntities(item.contentSnippet.substring(0, 180)) + "..." : "Décryptage global de la créativité.",
        } as Article;
      });

      return await Promise.all(itemsPromises);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Feed error";
      console.warn(`Erreur feed ${feed.url} ignorée: ${message}`);
      return [];
    }
  });

  const feedsResults = await Promise.all(feedPromises);
  allArticles = feedsResults.flat();

  // Fusionner avec les articles IA (Prioritaires au sommet via la date ou source)
  const finalPool = [...aiArticles, ...allArticles];
  finalPool.sort((a, b) => {
    // PRIORITÉ ABSOLUE AU CONTENU IA (SOURCE: IA)
    const isAIA = a.source?.includes('IA');
    const isBIA = b.source?.includes('IA');
    
    if (isAIA && !isBIA) return -1;
    if (!isAIA && isBIA) return 1;
    
    // Sinon tri chronologique normal
    return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
  });

  // Final deduplication
  const finalStream: Article[] = [];
  const seenIds = new Set();
  for (const art of finalPool) {
      if (!seenIds.has(art.id)) {
          finalStream.push(art);
          seenIds.add(art.id);
      }
  }

  return finalStream;
}

// Fonction utilitaire pour le GUID/Link
function rawIdFrom(item: { guid?: string; link?: string }): string {
    const raw = item.guid || item.link || "rand-" + Math.random();
    return typeof raw === 'string' ? raw : JSON.stringify(raw);
}

export async function getArticleById(id: string): Promise<Article | undefined> {
    const articles = await fetchArticles();
    return articles.find(art => art.id === id);
}

export async function getAvailableDates(): Promise<string[]> {
  const articles = await fetchArticles();
  const dates = new Set<string>();
  
  articles.forEach(art => {
    if (art.pubDate) {
      const d = new Date(art.pubDate);
      if (!isNaN(d.getTime())) {
        dates.add(d.toISOString().split('T')[0]);
      }
    }
  });

  return Array.from(dates).sort((a, b) => b.localeCompare(a));
}
