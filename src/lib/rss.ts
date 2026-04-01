import Parser from 'rss-parser';

export type Article = {
  id: string;
  title: string;
  link: string;
  source: string;
  category: string;
  pubDate: string;
  imageUrl?: string;
  videoUrl?: string;
  allImages?: string[];
  excerpt?: string;
  insight?: string | null;
  content?: string;
  summary?: string;
  longform?: {
    slides: {
      text: string;
      image?: string;
      video?: string;
      caption?: string;
    }[];
  };
  blocks?: { type: 'text' | 'image' | 'video' | 'youtube', content: string }[];
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
  // GRAPHISME
  { name: "It's Nice That", url: "https://www.itsnicethat.com/articles.rss", category: "GRAPHISME" },
  { name: "Creative Review", url: "https://www.creativereview.co.uk/feed/", category: "GRAPHISME" },
  { name: "Graphéine", url: "https://www.grapheine.com/feed", category: "GRAPHISME" },

  // PUBLICITÉ
  { name: "Ads of the World", url: "https://www.adsoftheworld.com/feed", category: "PUBLICITÉ" },
  { name: "La Réclame", url: "https://lareclame.fr/feed", category: "PUBLICITÉ" },
  { name: "Muse by Clio", url: "https://musebycl.io/rss.xml", category: "PUBLICITÉ" },
  { name: "J'ai un pote dans la com", url: "https://jai-un-pote-dans-la.com/feed/", category: "PUBLICITÉ" },
  { name: "LBB Online", url: "https://www.lbbonline.com/news/feed/", category: "PUBLICITÉ" },
  { name: "Campaign Live", url: "https://www.campaignlive.co.uk/rss/news", category: "PUBLICITÉ" },
  { name: "Ad Age", url: "https://adage.com/rss-news", category: "PUBLICITÉ" },
  { name: "The Drum", url: "https://www.thedrum.com/feeds/rss/all", category: "PUBLICITÉ" },
  { name: "CB News", url: "https://www.cbnews.fr/rss", category: "PUBLICITÉ" },
  { name: "Print Mag", url: "https://www.printmag.com/feed/", category: "PUBLICITÉ" },

  // INNOVATION
  { name: "Contagious", url: "https://www.contagious.com/rss/news", category: "INNOVATION" },
  { name: "Creapills", url: "https://creapills.com/feed", category: "INNOVATION" },
  { name: "Marketing Week", url: "https://www.marketingweek.com/feed/", category: "INNOVATION" },

  // DROP
  { name: "Highsnobiety", url: "https://www.highsnobiety.com/feeds/rss", category: "DROP" },
  { name: "Hypebeast", url: "https://hypebeast.com/feed", category: "DROP" },
  { name: "Complex", url: "https://www.complex.com/feeds/rss/all", category: "DROP" },

  // TREND
  { name: "Dazed", url: "https://www.dazeddigital.com/rss", category: "TREND" },
  { name: "i-D", url: "https://i-d.vice.com/en_uk/rss", category: "TREND" },
  { name: "The Business of Fashion", url: "https://www.businessoffashion.com/site/rss", category: "TREND" },

  // SOCIAL MEDIA & DIGITAL — Flux vérifiés accessibles (sans Cloudflare)
  { name: "Sprout Social", url: "https://sproutsocial.com/insights/feed/", category: "SOCIAL MEDIA" },
  { name: "Social Media Examiner", url: "https://www.socialmediaexaminer.com/feed/", category: "SOCIAL MEDIA" },
  { name: "Later Blog", url: "https://later.com/blog/feed/", category: "SOCIAL MEDIA" },
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
    insight: "",
  };
}

async function fetchOgData(url: string): Promise<{ image: string | null; title: string | null; allImages: string[] }> {
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

    const allImagesMatch = [...html.matchAll(/<img[^>]+src=["'](https:\/\/[^"'>]+\.(?:jpg|jpeg|png|webp))["']/gi)];
    const validImages = [...new Set(allImagesMatch.map(m => m[1]))].filter(url => !url.match(/icon|logo|avatar|spinner/i)).slice(0, 10);

    return {
      image: imgMatch ? imgMatch[1] : null,
      title: title,
      allImages: validImages
    };
  } catch {
    return { image: null, title: null, allImages: [] };
  }
}

function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  // Regex covers: watch?v=, youtu.be/, shorts/, embed/, /v/, and query param &v=
  const match = url.match(/(?:v=|\/v\/|embed\/|youtu\.be\/|shorts\/)([\w-]{11})/);
  return match ? match[1] : (url.length === 11 ? url : null);
}

export async function fetchArticles(): Promise<Article[]> {
  let allArticles: Article[] = [];
  let aiArticles: Article[] = [];
  let manualHero: Article | null = null;

  // 0. CHARGEMENT DU HERO MANUEL (PRIORITÉ ABSOLUE)
  try {
    const fs = require('fs');
    const path = require('path');
    const heroPath = path.join(process.cwd(), 'public', 'editorial', 'hero.json');
    if (fs.existsSync(heroPath)) {
      const data = JSON.parse(fs.readFileSync(heroPath, 'utf8'));
      if (data.enabled) {
        const blocks = data.blocks || [];
        const firstMediaBlock = blocks.find((b: any) => b.type !== 'text') || {};
        const ytId = extractYouTubeId(firstMediaBlock.content);

        manualHero = {
          id: 'manual-hero',
          title: data.title,
          excerpt: data.excerpt,
          insight: data.excerpt,
          imageUrl: firstMediaBlock.type === 'image' ? firstMediaBlock.content : undefined,
          videoUrl: firstMediaBlock.type === 'video' ? firstMediaBlock.content : (firstMediaBlock.type === 'youtube' || ytId ? ytId : undefined),
          category: data.category,
          source: data.sourceName ? `${data.sourceName}` : 'ÉDITORIAL KÉROSÈNE',
          pubDate: data.updatedAt || new Date().toISOString(),
          link: data.sourceUrl || '#',
          blocks: blocks
        } as Article;
        console.log(`[RSS] Manual hero injected with ${blocks.length} blocks. (Media: ${manualHero.videoUrl ? 'Video' : 'Image'})`);
      }
    }
  } catch (e) {
    console.warn("[RSS] Erreur lecture Hero Manuel:", e);
  }

  // 1. TENTATIVE DE RÉCUPÉRATION DU BLOB (CONTENU IA DU JOUR)
  try {
    let data;

    if (process.env.NODE_ENV === "development") {
      const fs = require('fs');
      const path = require('path');
      const localPath = path.join(process.cwd(), 'public', 'editorial', 'daily.json');
      if (fs.existsSync(localPath)) {
        const fileContent = fs.readFileSync(localPath, 'utf8');
        data = JSON.parse(fileContent);
      }
    } else {
      // PRODUCTION: On utilise un Timestamp pour casser le cache du navigateur/Vercel
      const blobUrl = "https://2vfzwmqqws8h2xfv.public.blob.vercel-storage.com/editorial/daily.json";
      const res = await fetch(`${blobUrl}?t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        data = await res.json();
      }
    }

    if (data && data.articles) {
      const BLACKLIST = [
        "Un signal créatif fort",
        "L'analyse approfondie",
        "Analyse en cours",
        "Décryptage technique",
        "Aucune analyse disponible",
        "Attention Required"
      ];

      aiArticles = (data.articles as Article[])
        .filter((a) => {
          // Virer tout article dont l'insight contient un vieux texte générique
          if (!a.insight) return true;
          return !BLACKLIST.some(bad => a.insight!.includes(bad));
        })
        .map((a) => ({
          ...a,
          link: a.link || `/article/${a.id}`,
          source: "KÉROSÈNE ÉDITORIAL (IA)",
          pubDate: data.date || new Date().toISOString(),
          // insight = vrai texte IA seulement, sinon vide (le front affichera l'excerpt)
          insight: a.insight || "",
          excerpt: a.excerpt || "",
          imageUrl: (a.imageUrl || "").replace(/\s/g, '').trim() || "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2000&auto=format&fit=crop",
          longform: a.longform || { slides: [] }
        }));
      console.log(`[RSS] ${aiArticles.length} AI articles injected (clean mode).`);
    }
  } catch (e) {
    console.warn("[RSS] Erreur lecture Éditorial IA:", e);
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
        let allImages: string[] = [];
        if (actualLink !== '#' && actualLink.startsWith('http')) {
          const ogData = await fetchOgData(actualLink);
          if (!feedImageUrl) {
            imageUrl = ogData.image;
          }
          realTitle = ogData.title;
          allImages = ogData.allImages;
        }

        if (!imageUrl) {
          imageUrl = feedImageUrl;
        }

        // IMPORTANT: We do NOT skip articles if image is missing anymore
        // But we provide a default placeholder if really nothing is found
        if (imageUrl && !imageUrl.startsWith('http')) {
          imageUrl = null;
        }
        const finalImageUrl = imageUrl || "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1000&auto=format&fit=crop";

        let finalTitle = item.title || realTitle || "Sans Titre";
        const CLOUDFLARE_NOISE = ["Attention Required", "Access Denied", "Just a moment", "403 Forbidden", "503 Service"];
        // Skip complètement les articles bloqués par Cloudflare
        if (CLOUDFLARE_NOISE.some(s => finalTitle.includes(s))) {
          return null;
        }

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
          allImages: allImages.length > 0 ? allImages : [finalImageUrl],
          insight: editorialData.insight,
          longform: editorialData.longform || { slides: [{ text: editorialData.insight, image: finalImageUrl }] },
          excerpt: item.contentSnippet
            ? decodeHTMLEntities(item.contentSnippet.substring(0, 220))
            : (item.description ? decodeHTMLEntities(item.description.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 220)) : ""),
        } as Article;
      });

      const results = await Promise.all(itemsPromises);
      return results.filter((a): a is Article => a !== null);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Feed error";
      console.warn(`Erreur feed ${feed.url} ignorée: ${message}`);
      return [];
    }
  });

  const feedsResults = await Promise.all(feedPromises);
  allArticles = feedsResults.flat().filter((a): a is Article => a !== null);

  // Fusionner (Le Hero manuel est traité à part sur la home, mais on le veut dans le pool)
  const finalPool = manualHero ? [manualHero, ...aiArticles, ...allArticles] : [...aiArticles, ...allArticles];
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
