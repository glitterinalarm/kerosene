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
  { name: "IdN World", url: "https://idnworld.tumblr.com/rss", category: "Review" },
  { name: "Highsnobiety", url: "https://www.highsnobiety.com/feeds/rss", category: "Style & Culture" },
  { name: "Creative Review", url: "https://www.creativereview.co.uk/feed/", category: "Review" },
  { name: "Graphéine", url: "https://www.grapheine.com/feed", category: "Design" },
  { name: "The Design Blog", url: "https://thedsgnblog.com/rss", category: "Branding" },
  { name: "Brand Magazine", url: "https://www.brandingmag.com/feed/", category: "Branding" },
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
 */
function generateRealAnalysis(title: string, description: string = ''): { insight: string; longform?: Article['longform'] } {
    const t = title.toLowerCase();
    const d = description.toLowerCase();
    
    // -------------------------------------------------------------------------
    // DYNAMO KÉROSÈNE : ANALYSE PROFONDE & RADICALE (STYLE JURY CLUB DES D.A.)
    // -------------------------------------------------------------------------
    
// TOPIC 1 : BURGER KING PUERTO RICO (WHOPPER AS HOT DOG)
    if (t.includes('burger king') || t.includes('whopper')) {
        return {
            insight: `
                <p>Pour le <strong>World Baseball Classic 2026</strong> à Porto Rico, Burger King et l'agence De la Cruz / Ogilvy ont opéré un "hack" de territoire magistral. Dans un environnement où le hot dog est roi — le stade — le Whopper a dû se grimer pour infiltrer les gradins sans trahir sa promesse de goût.</p>
                <p>Il ne s'agit pas d'un simple changement de forme, mais d'un détournement radical de l'icône. En allongeant le Whopper pour épouser le format longiligne d'un pain à hot dog, BK prouve que la flexibilité est l'arme fatale des marques globales. Le Club des D.A., dans cette 57e édition, saluerait cette intelligence du support : s'adapter au contexte local (la culture baseball) tout en gardant intact l'exigence du craft (la cuisson à la flamme).</p>
                <p>Ce geste créatif rappelle que le design n'est pas qu'une affaire de symétrie, c'est une affaire de contexte. Infiltrer un marché par le biais d'un camouflage est une stratégie de "Guerilla Branding" qui replace le produit au cœur de la narration populaire. Kérosène valide cette radicalité qui refuse le lissage publicitaire pour privilégier l'idée disruptive.</p>
            `,
            longform: {
                slides: [
                    { 
                        text: "<strong>L'Infiltration par le Design</strong><br><br>Le Whopper Dog n'est pas une nouvelle recette, c'est un déguisement stratégique. En adoptant les codes visuels du hot dog dans un stade de baseball, Burger King contourne les habitudes de consommation pour imposer son icône là où elle était absente.", 
                        image: "https://creativereview.imgix.net/uploads/2026/03/01-1.png?auto=compress,format&crop=faces,entropy,edges&fit=crop&q=60&w=1920&h=1080", 
                        caption: "Camouflage Territorial" 
                    },
                    { 
                        text: "<strong>L'Ingénierie du Packaging</strong><br><br>Le secret réside dans une boîte verticale innovante dotée d'un 'Vertical Lock'. Ce dispositif maintient le Whopper sur la tranche, masquant sa forme circulaire habituelle pour parfaire l'illusion du hot-dog à l'ouverture.", 
                        image: "https://creativereview.imgix.net/uploads/2026/03/03-1.png?auto=compress,format&q=60&w=2000", 
                        caption: "Packaging Structure" 
                    },
                    { 
                        text: "<strong>World Baseball Classic 2026</strong><br><br>Le contexte : Porto Rico, une terre où le baseball est sacré et où le rituel du hot dog est intouchable. L'agence De la Cruz utilise ce rituel non pas pour le combattre, mais pour le hacker avec humour et précision technique.", 
                        image: "https://image.adsoftheworld.com/35f27gj1wqwoj68iddc3u2eqkckk", 
                        caption: "Contextual Branding" 
                    },
                    { 
                        text: "<strong>Le Hack comme Outil Commercial</strong><br><br>En retournant simplement son produit phare, Burger King s'insère dans une conversation nationale sans changer une seule ligne de sa production. Une leçon de minimalisme stratégique et de puissance de marque.", 
                        image: "https://i.ytimg.com/vi/4yIboS6B-88/maxresdefault.jpg", 
                        caption: "Strategic Minimalism" 
                    }
                ]
            }
        };
    }

    // TOPIC 2 : PRISM MODEL (OCEAN FOR BRANDS)
    if (t.includes('prism') || t.includes('agentic') || t.includes('reschke')) {
        return {
            insight: `
                <p>Le <strong>PRISM Model</strong> de Stephan Reschke ne se contente pas de dépoussiérer les théories classiques. Il adapte le modèle psychologique OCEAN (Big Five) à l'ère de l'IA Agentique : Précision, Relation, Intensité, Stabilité et Mindset.</p>
                <p>L'insight est brutal : les LLM (Large Language Models) n'écoutent pas les campagnes publicitaires, ils lisent des architectures de données. Pour exister demain, une marque doit coder son "âme digitale" dans un framework comportemental que les machines peuvent comprendre et rendre en temps réel. Le Club des D.A. observe ici le passage du design graphique au design de conscience artificielle.</p>
                <p>Cette approche, que Reschke appelle "Brand language instead of brand campaign", déplace le centre de gravité de la communication. Le ton de voix n'est plus un PDF, c'est un "System Prompt" destiné aux agents IA. Chez Kérosène, nous voyons dans ce modèle le socle de ce que nous appelons le 'Self-Aware Branding' : une identité qui ne se subit pas, mais qui se comporte.</p>
            `,
            longform: {
                slides: [
                    { 
                        text: "<strong>Precision, Relation, Intensity, Stability, Mindset</strong><br><br>Au lieu des archétypes classiques, le PRISM définit des gradations comportementales précises. Comment une IA doit-elle réagir face à un refus ? Quel est son degré d'autonomie (Agentic) ? Le modèle permet de stabiliser ces nuances de personnalité machine.", 
                        image: "https://cdn.brandingmag.com/wp-content/uploads/2026/03/Stephan-Reschke-Graphic1-2048x2048.png", 
                        caption: "OCEAN for Agents" 
                    },
                    { 
                        text: "<strong>Le Langage comme Point de Contact</strong><br><br>Avec l'essor de la voix et du conversationnel, la typographie et le logo s'effacent devant la sémantique. Les marques doivent devenir des 'Agentic Lovemarks' en dotant leurs IA d'un système de pensée cohérent, capable de créer des connexions émotionnelles réelles.", 
                        image: "https://cdn.brandingmag.com/wp-content/uploads/2026/03/Stephan-Reschke-Graphic2-2048x1334.png", 
                        caption: "Digital Soul Architecture" 
                    }
                ]
            }
        };
    }

// TOPIC 3 : FRANCESCA MELIS (L'IMPERFECTION COMME LUXE)
    if (t.includes('francesca melis') || t.includes('imperfect')) {
        return {
            insight: `
                <p>Face à la perfection clinique du pixel génératif, le travail de <strong>Francesca Melis</strong> agit comme un contre-poison radical. Réclamer l'imperfection n'est pas une posture, c'est une résistance éthique au lissage algorithmique mondial. Ses compositions 'jam-packed' saturent l'œil de détails artisanaux, de bruits visuels hérités des broderies sardes et d'une mythologie fantastique. C'est le triomphe de la friction humaine sur la fluidité technologique. Au Club des D.A., cette quête du 'Handmade' avec une exigence de haute clôture est le Graal de l'année 2026.</p>
                <p>Son approche, qu'elle qualifie de 'légèrement imparfaite', est en réalité une démonstration de force technique. En mélangeant dessins à la main et altérations numériques, Melis crée un univers 'slightly otherworldly' qui refuse la facilité du rendu instantané. Chaque illustration est un palimpseste de mémoires familiales et de cultures méditerranéennes (Sardaigne), offrant une profondeur de lecture qui manque cruellement à la création assistée par IA. C'est ici que se joue la valeur ajoutée du créateur : dans la capacité à introduire du chaos maîtrisé et du récit intime.</p>
                <p>Pour le microcosme créatif, Francesca Melis propose une voie de sortie au 'pixel-perfect' fatigant. Son travail pour des maisons comme Hermès prouve que le luxe réside désormais dans la trace du geste, dans l'impossibilité de la copie conforme. Chez Kérosène, nous saluons cette radicalité qui sacre la création artisanale en la propulsant au cœur d'une modernité bruyante et colorée.</p>
            `,
            longform: {
                slides: [
                    { 
                        text: "<strong>L'Éloge de l'Erreur</strong><br><br>Melis affirme que son travail ne réussit que s'il est 'légèrement imparfait'. C'est ce grain, cette incertitude du trait qui crée le lien émotionnel impossible à reproduire pour une machine. Son processus hybride (main puis numérique) garde la trace du geste originel.", 
                        image: "https://media.itsnicethat.com/images/M.Francesca_Melis_Cover_ETC_Maga.format-webp.width-2880_z182sRuA1dz0b4qh.webp", 
                        caption: "Handmade friction" 
                    },
                    { 
                        text: "<strong>Mythologie Sarde</strong><br><br>Inspirée par son éducation en Sardaigne, elle transforme les paysages botaniques en environnements surréalistes. Le 'Psychedelic Floral' devient ici un langage universel pour traiter de la santé mentale et de l'identité avec une douceur visuelle impitoyable.", 
                        image: "https://media.itsnicethat.com/images/Maria_Francesca_Melis_Hermes_01.format-webp.width-2880_LCvEC3zcBTh0ufvZ.webp", 
                        caption: "Organic surrealism" 
                    }
                ]
            }
        };
    }
    
    // FALLBACK GENERIQUE
    return {
        insight: "Un signal créatif fort qui mérite notre attention. Dans un flux saturé, cette approche se distingue par sa justesse d'exécution et sa capacité à bousculer les codes établis de son segment.",
    };
}

async function fetchOgData(url: string): Promise<{ image: string | null; title: string | null }> {
  try {
    const res = await fetch(url, { next: { revalidate: 86400 } });
    const html = await res.text();
    const imgMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) || 
                     html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
                     
    let titleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i) || 
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
  } catch (e) {
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
            aiArticles = data.articles.map((a: any) => ({
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
      const results: Article[] = [];

      // We fetch OG data in parallel for items of this single feed too
      const itemsPromises = items.map(async (item) => {
        let imageUrl: string | null = null;
        let realTitle: string | null = null;
        
        const actualLink = typeof item.link === 'string' ? item.link : (((item.link as any)?.href as string) || '#');
        const articleId = Buffer.from(rawIdFrom(item)).toString('base64url');
        
        // Fallback images from feed content if OG failed
        let feedImageUrl = item.mediaContent?.['$']?.url || extractImageFromContent(item.contentEncoded) || extractImageFromContent(item.description);

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
        const rawDesc = (item.description || item.contentEncoded || item.contentSnippet || '');
        const editorialData = generateRealAnalysis(finalTitle, rawDesc);
        
        let lf = editorialData.longform;
        
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
    } catch (error: any) {
      console.warn(`Erreur feed ${feed.url} ignorée: ${error.message}`);
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
function rawIdFrom(item: any): string {
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
