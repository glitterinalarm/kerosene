import { list } from '@vercel/blob';
import fs from 'fs';
import path from 'path';
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
  { name: "BP&O", url: "https://bpando.org/feed/", category: "GRAPHISME" },
  { name: "The Brand Identity", url: "https://the-brandidentity.com/feed", category: "GRAPHISME" },
  { name: "Eye on Design", url: "https://eyeondesign.aiga.org/feed", category: "GRAPHISME" },
  { name: "Brand New", url: "https://www.underconsideration.com/brandnew/feed", category: "GRAPHISME" },

  // PUBLICITÉ
  { name: "Ads of the World", url: "https://www.adsoftheworld.com/feed", category: "PUBLICITÉ" },
  { name: "La Réclame", url: "https://lareclame.fr/feed", category: "PUBLICITÉ" },
  { name: "Muse by Clio", url: "https://musebycl.io/rss.xml", category: "PUBLICITÉ" },
  { name: "J'ai un pote dans la com", url: "https://jai-un-pote-dans-la.com/feed/", category: "PUBLICITÉ" },
  { name: "LBB Online", url: "https://www.lbbonline.com/news/feed/", category: "PUBLICITÉ" },
  { name: "Famous Campaigns", url: "https://www.famouscampaigns.com/feed/", category: "PUBLICITÉ" },
  { name: "Ad Age", url: "https://adage.com/rss-news", category: "PUBLICITÉ" },
  { name: "The Drum", url: "https://www.thedrum.com/feeds/rss/all", category: "PUBLICITÉ" },
  { name: "CB News", url: "https://www.cbnews.fr/rss.xml", category: "PUBLICITÉ" },
  { name: "Print Mag", url: "https://www.printmag.com/feed/", category: "PUBLICITÉ" },
  { name: "Dans Ta Pub", url: "https://www.danstapub.com/feed/", category: "PUBLICITÉ" },

  // INNOVATION & MOTION
  { name: "Contagious", url: "https://www.contagious.com/rss/news", category: "INNOVATION" },
  { name: "Creapills", url: "https://creapills.com/feed", category: "INNOVATION" },
  { name: "Marketing Week", url: "https://www.marketingweek.com/feed/", category: "INNOVATION" },
  { name: "Motionographer", url: "https://motionographer.com/feed/", category: "INNOVATION" },
  { name: "Dezeen", url: "https://www.dezeen.com/feed/", category: "INNOVATION" },
  { name: "Designboom", url: "https://www.designboom.com/feed/", category: "INNOVATION" },

  // DROP
  { name: "Highsnobiety", url: "https://www.highsnobiety.com/feeds/rss", category: "DROP" },
  { name: "Hypebeast", url: "https://hypebeast.com/feed", category: "DROP" },
  { name: "Complex", url: "https://www.complex.com/feeds/rss/all", category: "DROP" },

  // TREND
  { name: "Dazed", url: "https://www.dazeddigital.com/rss", category: "TREND" },
  { name: "i-D", url: "https://i-d.vice.com/en_uk/rss", category: "TREND" },
  { name: "The Business of Fashion", url: "https://www.businessoffashion.com/site/rss", category: "TREND" },
  { name: "032c", url: "https://032c.com/feed/", category: "TREND" },
  { name: "L'ADN", url: "https://www.ladn.eu/feed/", category: "TREND" },

  // SOCIAL MEDIA & DIGITAL
  { name: "We Are Social FR", url: "https://wearesocial.com/fr/feed/", category: "SOCIAL MEDIA" },
  { name: "We Are Social UK", url: "https://wearesocial.com/uk/feed/", category: "SOCIAL MEDIA" },
  { name: "We Are Social Global", url: "https://wearesocial.com/feed/", category: "SOCIAL MEDIA" },
  { name: "JUPDLC Social", url: "https://jai-un-pote-dans-la.com/tag/social-media/feed/", category: "SOCIAL MEDIA" },
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
    let data: any = null;

    // A. Tentative via Vercel Blob (PROD)
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const { blobs } = await list({ prefix: 'editorial/hero.json' });
        const heroBlob = blobs.find((b: any) => b.pathname === 'editorial/hero.json');
        if (heroBlob) {
          const response = await fetch(heroBlob.url, { cache: 'no-store' });
          data = await response.json();
          console.log(`[RSS] Hero manuel chargé depuis Blob: ${data.title}`);
        }
      } catch (blobErr) {
        console.warn("[RSS] Erreur lecture Blob, fallback FS:", blobErr);
      }
    }

    // B. Fallback via File System (Local ou Build Time)
    if (!data) {
      try {
        const heroPath = path.join(process.cwd(), 'public', 'editorial', 'hero.json');
        if (fs.existsSync(heroPath)) {
          data = JSON.parse(fs.readFileSync(heroPath, 'utf8'));
          console.log(`[RSS] Hero manuel chargé depuis FS: ${data?.title}`);
        }
      } catch (fsErr) {
        // Silencieux
      }
    }

    if (data && data.enabled) {
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
        source: data.sourceName ? `KÉROSÈNE | ${data.sourceName}` : 'ÉDITORIAL KÉROSÈNE',
        pubDate: data.updatedAt || new Date().toISOString(),
        link: data.sourceUrl || '#',
        blocks: blocks
      } as Article;
    }
  } catch (err) {
    console.error('[RSS] Erreur fatale chargement hero:', err);
  }

  // 0.bis CHARGEMENT DES ARCHIVES ÉDITORIALES (Pour la rubrique Kérosène)
  let keroArchives: Article[] = [];
  try {
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const { blobs } = await list({ prefix: 'editorial/archives/' });
      const archivePromises = blobs
        .filter(b => b.pathname.endsWith('.json'))
        .map(async (b) => {
          try {
            const res = await fetch(b.url, { cache: 'no-store' });
            const data = await res.json();
            return {
              id: b.pathname.split('/').pop()?.replace('.json', '') || 'archive',
              title: data.title,
              excerpt: data.excerpt,
              insight: data.excerpt,
              imageUrl: (data.blocks?.find((b: any) => b.type === 'image')?.content) || "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1000&auto=format&fit=crop",
              category: data.category || 'KÉROSÈNE',
              source: data.sourceName ? `KÉROSÈNE | ${data.sourceName}` : 'ÉDITORIAL KÉROSÈNE',
              pubDate: data.updatedAt || new Date().toISOString(),
              link: `/article/${b.pathname.split('/').pop()?.replace('.json', '')}`,
              blocks: data.blocks || []
            } as Article;
          } catch { return null; }
        });
      keroArchives = (await Promise.all(archivePromises)).filter((a): a is Article => a !== null);
    } else {
      // Local FS Fallback
      const archivesDir = path.join(process.cwd(), 'public', 'editorial', 'archives');
      if (fs.existsSync(archivesDir)) {
        keroArchives = fs.readdirSync(archivesDir)
          .filter(f => f.endsWith('.json'))
          .map(f => {
            try {
              const data = JSON.parse(fs.readFileSync(path.join(archivesDir, f), 'utf8'));
              return {
                id: f.replace('.json', ''),
                title: data.title,
                excerpt: data.excerpt,
                insight: data.excerpt,
                imageUrl: (data.blocks?.find((b: any) => b.type === 'image')?.content) || "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1000&auto=format&fit=crop",
                category: data.category || 'KÉROSÈNE',
                source: data.sourceName ? `KÉROSÈNE | ${data.sourceName}` : 'ÉDITORIAL KÉROSÈNE',
                pubDate: data.updatedAt || new Date().toISOString(),
                link: `/article/${f.replace('.json', '')}`,
                blocks: data.blocks || []
              } as Article;
            } catch { return null; }
          }).filter((a): a is Article => a !== null);
      }
    }
  } catch (err) {
    console.warn("[RSS] Erreur chargement archives:", err);
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
      // Temporairement réduit à 60s pour forcer la prise en compte du nouveau lien JUPDLC
      const response = await fetch(feed.url, { next: { revalidate: 60 } });
      const text = await response.text();
      const parsed = await parser.parseString(text);

      // Fetch more items (e.g., 15) to actually populate archives and ensure stability
      // Réduit à 10 pour plus de rapidité et moins de risques de timeout
      const items = parsed.items.slice(0, 10);

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

        let rawTitle = item.title || realTitle || "Sans Titre";
        let finalTitle = typeof rawTitle === 'string' ? rawTitle : (typeof rawTitle === 'object' ? JSON.stringify(rawTitle) : String(rawTitle));
        
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
      return results.flat().filter((a: any) => a !== null);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Feed error";
      console.warn(`Erreur feed ${feed.url} ignorée: ${message}`);
      return [];
    }
  });

  const feedsResults = await Promise.all(feedPromises);
  allArticles = (feedsResults.flat().filter((a) => a !== null) as Article[]);

  // Final deduplication
  const finalStream: Article[] = [];
  const seenIds = new Set();
  
  // 1. D'ABORD LE HERO MANUEL (S'IL EXISTE)
  if (manualHero) {
    finalStream.push(manualHero);
    seenIds.add(manualHero.id);
  }

  // 2. ENSUITE LE RESTE DÉDUPLIQUÉ ET TRIÉ
  const sortedRest = [...aiArticles, ...keroArchives, ...allArticles].sort((a, b) => {
    const dateA = new Date(a.pubDate).getTime();
    const dateB = new Date(b.pubDate).getTime();
    
    // Si un article a moins de 12h, il est considéré comme "Breaking" et remonte
    const isVeryFreshA = (Date.now() - dateA) < 12 * 3600 * 1000;
    const isVeryFreshB = (Date.now() - dateB) < 12 * 3600 * 1000;

    if (isVeryFreshA && !isVeryFreshB) return -1;
    if (!isVeryFreshA && isVeryFreshB) return 1;

    // Priorité ensuite au contenu IA si les dates sont proches
    const isAIA = a.source?.includes('IA') || a.source?.includes('KÉROSÈNE');
    const isBIA = b.source?.includes('IA') || b.source?.includes('KÉROSÈNE');
    if (isAIA && !isBIA) return -1;
    if (!isAIA && isBIA) return 1;

    // Sinon tri chronologique pur
    return dateB - dateA;
  });

  for (const art of sortedRest) {
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
  const current = articles.find(art => art.id === id);
  if (current) return current;

  // Si non trouvé, chercher dans les ARCHIVES
  try {
    let data: any = null;

    // A. Tentative via Vercel Blob (PROD)
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        // On cherche le fichier par son nom (l'ID dans l'URL correspond au nom du fichier sans .json)
        const { blobs } = await list({ prefix: `editorial/archives/${id}.json` });
        const archiveBlob = blobs.find((b: any) => b.pathname.includes(`${id}.json`));
        
        if (archiveBlob) {
          const res = await fetch(archiveBlob.url);
          data = await res.json();
          console.log(`[RSS] Article archivé chargé depuis Blob: ${id}`);
        }
      } catch (e) {
        console.warn("[RSS] Erreur recherche archive sur Blob:", e);
      }
    }

    // B. Fallback via FS
    if (!data) {
      try {
        const archivePath = path.join(process.cwd(), 'public', 'editorial', 'archives', `${id}.json`);
        if (fs.existsSync(archivePath)) {
          data = JSON.parse(fs.readFileSync(archivePath, 'utf8'));
          console.log(`[RSS] Article archivé chargé depuis FS: ${id}`);
        }
      } catch (fsErr) {}
    }

    if (data) {
      const blocks = data.blocks || [];
      const firstMediaBlock = blocks.find((b: any) => b.type !== 'text') || {};
      const ytId = extractYouTubeId(firstMediaBlock.content);

      return {
        id: id,
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
    }
  } catch (err) {
    console.error(`[RSS] Erreur recherche archive pour ID ${id}:`, err);
  }

  return undefined;
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
