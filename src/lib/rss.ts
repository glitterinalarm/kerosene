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
function generateRealAnalysis(title: string): string | null {
    const t = title.toLowerCase();
    
    if (t.includes('club des d.a') || t.includes('jury')) {
        return "Une annonce qui donne le ton. Le choix des 210 jurés confirme la volonté de recentrer le débat sur l'essence même du métier : l'idée pure face à la surenchère technologique. Une institution qui refuse l'obsolescence.";
    }
    if (t.includes('firefox') || t.includes('mascotte') || t.includes('logo')) {
        return "Donner vie à l'identité de marque via une mascotte physique (Kit) est un clin d'œil malin aux codes du Web 1.0. C'est chaleureux et régressif, mais ce soupçon de nostalgie suffira-t-il à moderniser l'image d'un navigateur en perte de vitesse ?";
    }
    if (t.includes('primark') || t.includes('high fashion')) {
        return "S'approprier les codes austères du luxe pour vendre de la fast-fashion : l'ironie est totale. L'exécution photographique est magistrale, mais le cynisme de la démarche interroge sur la limite de l'exercice de style.";
    }
    if (t.includes('nike') && t.includes('libert')) {
        return "Le hack culturel par excellence. Utiliser la Statue de la Liberté pour le maillot des Bleus est un pas de côté audacieux qui brouille les frontières patriotiques avec une exécution textile impeccable. Du grand art.";
    }
    if (t.includes('nazionale') || t.includes('packaging')) {
        return "Un packaging qui sublime un rituel populaire (le baby-foot) avec une rigueur éditoriale digne des plus grandes maisons de design. Le travail typographique rouge sur noir est d'une violence visuelle absolue. On adore.";
    }
    if (t.includes('ia') || t.includes('authentique')) {
        return "La grande bataille de 2026. Alors que l'industrie s'aveugle sur le rendu génératif, l'engagement véritable repose toujours sur la friction humaine. Ce conseil stratégique tape dans le mille : l'imperfection crée le lien.";
    }
    
    return null;
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

  for (const feed of feeds) {
    try {
      const response = await fetch(feed.url, { next: { revalidate: 3600 } });
      const text = await response.text();
      const parsed = await parser.parseString(text);

      const recentItems = parsed.items.slice(0, 3); // On pompe généreusement (3) pour nourrir le "En Bref"

      for (const item of recentItems) {
        let imageUrl: string | null = null;
        let realTitle: string | null = null;
        const safeGuid = typeof item.guid === 'string' ? item.guid : null;
        const actualLink = typeof item.link === 'string' ? item.link : (((item.link as any)?.href as string) || '#');
        const rawId = String(safeGuid || actualLink || "rand-" + Math.random());
        // On crée un ID "propre" (URL-safe) pour éviter les erreurs 404 liées aux caractères spéciaux
        const articleId = Buffer.from(rawId).toString('base64url');
        
        if (actualLink !== '#' && !imageUrl) {
            const ogData = await fetchOgData(actualLink);
            imageUrl = ogData.image;
            realTitle = ogData.title;
        }

        if (!imageUrl) imageUrl = item.mediaContent?.['$']?.url || extractImageFromContent(item.contentEncoded) || extractImageFromContent(item.description);
        if (!imageUrl) continue; 
        
        let finalTitle = realTitle || item.title || "";
        
        if (feed.name === "The Design Blog") {
             const rawDesc = (item.description || item.contentEncoded || '');
             const plainText = rawDesc.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
             let cleanText = plainText.replace(/^(BRANDING\s*|DESIGN\s*|PACKAGING\s*)/i, '').trim();
             if (cleanText.startsWith('Identity')) cleanText = "Identity" + cleanText.substring(8);
             if (cleanText.length > 10) {
                  finalTitle = cleanText.substring(0, 90) + (cleanText.length > 90 ? "..." : "");
             } else {
                  finalTitle = (realTitle || item.title || "").replace(/—\s*The Design Blog/i, '').trim();
             }
        } 

        finalTitle = decodeHTMLEntities(finalTitle);
        const articleInsight = generateRealAnalysis(finalTitle);
        
        let lf = undefined;
        if (finalTitle.toLowerCase().includes('nike') && finalTitle.toLowerCase().includes('libert')) {
            lf = {
                slides: [
                    {
                        text: "L'équipementier américain redéfinit les frontières du patriotisme sartorial avec une série de tenues pour la Coupe du Monde 2026 qui relèguent le traditionnel bleu-blanc-rouge au rang de relique.<br><br>Avec cette nouvelle itération extérieure baptisée « Liberté », Nike fait le choix radical d'abandonner le blanc canonique pour embrasser une teinte vert-de-gris inédite.",
                        image: "https://www.danstapub.com/wp-content/uploads/2026/03/Nike-1.webp",
                        caption: "La silhouette globale"
                    },
                    {
                        text: "L'insight est d'une puissance narrative évidente : à l'aube d'un mondial organisé sur le sol nord-américain, la marque rend un hommage direct au cadeau diplomatique le plus célèbre de l'histoire, la Statue de la Liberté, offerte par la France aux États-Unis en 1876.",
                        image: "https://www.danstapub.com/wp-content/uploads/2026/03/Nike-2.webp",
                        caption: "Hommage à Bartholdi"
                    },
                    {
                        text: "L'exigence absolue du <em>craft</em> : pour contraster avec ce vert diaphane, le swoosh et le coq ont été frappés dans un alliage cuivré métallisé.<br><br>La technologie de tissage « cross-dive » entremêle des fils verts et blancs pour un rendu irisé. Le vêtement d'athlète se mue en de véritable artefact <em>lifestyle</em>.",
                        image: "https://www.danstapub.com/wp-content/uploads/2026/03/Nike-3.webp",
                        caption: "Tissage 'cross-dive'"
                    }
                ]
            };
        }

        allArticles.push({
          id: articleId,
          title: finalTitle,
          link: actualLink,
          source: feed.name,
          category: feed.category,
          pubDate: item.pubDate || new Date().toISOString(),
          imageUrl: imageUrl,
          insight: articleInsight,
          longform: lf,
          excerpt: item.contentSnippet ? decodeHTMLEntities(item.contentSnippet.substring(0, 180)) + "..." : "Décryptage global de la créativité et de la pensée divergente.",
        });
      }
    } catch (error: any) {
      console.warn(`Erreur feed ${feed.url} ignorée (XML/Réseau): ${error.message}`);
    }
  }

  // Tri anti-chronologique global
  allArticles.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

  // --- LOGIQUE ÉDITORIALE "KÉROSÈNE" (Hero Rotation & D.A. Injection) ---
  const now = new Date();
  const currentHour = now.getHours();
  const todayStr = now.toISOString().split('T')[0];
  
  // On ne déclenche la "News du Jour" qu'après 15h
  const isAfter15h = currentHour >= 15;

  const editorialInjections: Article[] = [
    {
      id: "hero-peaky-blinders",
      title: "Peaky Blinders 2026 : Le son de l'Immortalité",
      link: "/article/hero-peaky-blinders",
      source: "KÉROSÈNE EXCLUSIF",
      category: "CINÉMA & STYLE",
      pubDate: "2026-03-25T08:20:00Z", 
      imageUrl: "/editorial/peaky_real_v2.jpg",
      excerpt: "À l'aube du long-métrage final, décryptage d'une identité visuelle qui a redéfini le 'Period Drama' par le prisme du rock et du grain argentique.",
      insight: `
        <p>Alors que 2026 marque le retour tant attendu de Thomas Shelby sur grand écran avec <em>The Immortal Man</em>, il est crucial de s'arrêter sur ce qui fait le 'Kérosène' visuel de cette saga. Ce n'est pas simplement une reconstitution historique ; c'est un hack temporel qui a redéfini les standards de l'industrie.</p>
        <p>En plaçant du Nick Cave ou du PJ Harvey sur des ralentis de marche dans la boue de Birmingham, la série a brisé les codes du film d'époque pour devenir un artefact de pop-culture pur. Cette collision frontale entre le XIXe siècle industriel et le rock'n'roll post-moderne crée une friction qui captive l'œil et l'oreille dès les premières secondes du générique ('Red Right Hand').</p>
        <p>Pour le DA, Peaky Blinders est une leçon magistrale de <strong>Color Grading</strong>. La lutte constante entre cet orangé chaud, organique, presque volcanique des hauts-fourneaux, et le bleu métallique, froid et impitoyable de la ville industrielle, crée un contraste chromatique qui devient la signature de la marque Shelby.</p>
        <p>Le <strong>Costume Design</strong> dépasse ici la simple fonction vestimentaire pour devenir un outil de branding absolu. Le tweed, la casquette à visière et le manteau long ne sont plus des vêtements d'époque, ce sont des logos. Ils incarnent une autorité, une appartenance et une menace latente qui s'expriment à travers la texture même du tissu sous la pluie.</p>
        <p>La mise en scène fait également la part belle au clair-obscur. Inspirée par la peinture flamande et le cinéma noir classique, l'image utilise la fumée et le grain argentique pour magnifier la noirceur. Chaque plan est composé comme une toile où l'ombre est aussi importante que la lumière pour suggérer la tension psychologique des personnages.</p>
        <p>Enfin, le passage du petit au grand écran en 2026 pose la question de l'échelle. Comment maintenir cette intimité brute tout en embrassant le gigantisme cinématographique ? La réponse semble résider dans la radicalité de l'exécution : ne rien changer au craft, mais le pousser dans ses derniers retranchements de précision.</p>
        <p>Thomas Shelby n'est plus un homme, c'est une icône graphique indémodable du 21ème siècle. Un mythe qui survit grâce à une exigence de direction artistique qui refuse tout compromis avec la modernité technologique facile.</p>
      `,
      longform: {
          slides: [
              { 
                text: "<strong>The sound of violence</strong><br><br>L'anachronisme musical comme moteur de modernité : Pourquoi le rock'n'roll est-il le seul langage capable d'exprimer la violence des années 20 et désormais des années 40 ?<br><br>En 2026, la bande-son de <em>The Immortal Man</em> pousse la radicalité encore plus loin. La collision entre le Birmingham industriel et des nappes de synthétiseurs froids ou le punk viscéral de IDLES crée une dissonance cognitive qui empêche le spectateur de s'installer dans un confort historique passif. C'est un assaut sensoriel permanent qui souligne l'instabilité mentale de Tommy Shelby face au chaos mondial.", 
                image: "/editorial/peaky_real_v2.jpg", 
                caption: "The sound of violence" 
              },
              { 
                text: "<strong>Costume as Brand</strong><br><br>Le costume comme logo : Le tweed, la casquette et le manteau long ne sont plus des vêtements d'époque — ce sont des artefacts de branding absolu.<br><br>Au-delà de la précision historique, la silhouette des Peaky Blinders a quitté les écrans pour devenir une icône globale. En 1940, cette armure sartoriale change de ton : les tissus sont plus lourds, les coupes plus militaires. Le tweed n'est plus seulement une texture, c'est une déclaration d'indépendance. Porter la casquette à visière en 2026, c'est invoquer un code d'honneur et une violence contenue qui parle directement à notre époque en quête de repères graphiques forts.", 
                image: "/editorial/peaky_2_v2.jpg", 
                caption: "Costume as Brand" 
              },
              { 
                text: "<strong>1940 Birmingham</strong><br><br>Face à l'immortalité : Thomas Shelby revient dans Birmingham en 1940, une ville en flammes où l'acier et le sang se mélangent dans une esthétique sans précédent.<br><br>Le passage au format film permet d'explorer l'échelle monumentale des usines et des bombardements. La direction artistique traite le Birmingham de la guerre comme un enfer dantesque, mais d'une beauté plastique absolue. La fumée des incendies se mélange à celle des hauts-fourneaux pour créer ce grain argentique 'Kérosène' : une image volcanique, sale, mais d'une élégance souveraine qui refuse tout lissage numérique.", 
                image: "/editorial/peaky_4_v2.jpg", 
                caption: "1940 Birmingham" 
              }
          ]
      }
    },
    {
        id: "edito-nss-magazine",
        title: "The NSS Effect : La rue comme nouveau musée de la Mode",
        link: "/article/edito-nss-magazine",
        source: "Synthèse : nss magazine x Kérosène",
        category: "STREET CULTURE",
        pubDate: "2026-03-25T08:15:00Z", 
        imageUrl: "/editorial/nss_real.jpg",
        excerpt: "Comment les magazines comme nss ont transformé la sape de quartier en de véritables pièces d'archives culturelles.",
        insight: `
          <p>Le phénomène nss magazine n'est pas qu'une question de mode, c'est une question de <strong>contexte</strong>. En traitant le maillot de foot ou le survêtement de banlieue avec la même rigueur éditoriale qu'une pièce de haute couture, ils ont créé un nouveau segment de luxe : le luxe de l'appartenance géographique.</p>
          <p>En 2026, la frontière entre le défilé et le playground a totalement disparu. Ce 'NSS Effect' force les DA à repenser l'authenticité : on ne vend plus un produit, on vend un fragment de reality brute. L'imagerie est ici fondamentale : le fish-eye, le flash direct et le grain vidéo rappellent les archives des années 90.</p>
          <p>La culture du 'Blokecore' — porter des maillots de football vintage dans un contexte urbain branché — est l'exemple type de cette réappropriation. nss a su transformer un objet populaire et parfois méprisé en un artefact de désir hautement sophistiqué, jouant sur la nostalgie et l'identité locale.</p>
          <p>Ce basculement éditorial a des conséquences directes sur le graphisme. On voit réapparaître une typographie brutale, des mises en page asymétriques héritées du fanzine et une gestion des couleurs sans concession, évoquant les collages punk et la culture skate originelle.</p>
          <p>Le luxe ne se définit plus par la rareté du matériau, mais par la force du récit qu'il véhicule. En documentant les 'subcultures' avec une précision de sociologue, nss installe la rue comme le seul laboratoire de tendances valable pour les marques globales qui cherchent un second souffle.</p>
          <p>La ville devient un musée à ciel ouvert. Les Gucci, Prada et autres mastodontes ne s'y trompent pas en collaborant systématiquement avec ces nouveaux prescripteurs qui détiennent le code de la « coolitude » absolue, un code qui ne s'achète pas mais qui se vit sur le bitume.</p>
          <p>Enfin, cette tendance confirme que le futur du design est sans doute dans le rétro-hack : piller le passé pour créer un futur hybride, où l'élégance du style italien rencontre la rugosité de la culture streetwear mondiale.</p>
        `
    },
    {
        id: "edito-serif-blanding",
        title: "Le retour du Serif signe-t-il la fin de l'ère du Blanding ?",
        link: "/article/edito-serif-blanding",
        source: "Synthèse : Creative Review",
        category: "TYPOGRAPHIE",
        pubDate: "2026-03-25T08:00:00Z", 
        imageUrl: "/editorial/serif_real.jpg",
        excerpt: "L'uniformisation des logos vers le sans-serif géométrique touche à sa fin.",
        insight: `
          <p>Après une décennie de domination sans partage du <strong>Blanding</strong> — cette tendance à uniformiser toutes les identités visuelles vers des sans-serifs géométriques et austères (type Helvetica ou Gotham) — le vent tourne enfin de manière spectaculaire.</p>
          <p>Ce retour en grâce du Serif n'est pas qu'une simple coquetterie de designer en manque d'inspiration. C'est une réponse directe et viscérale au besoin de différenciation dans un océan de lissé algorithmique. Les marques cherchent aujourd'hui à exprimer une autorité, une histoire et une dimension humaine.</p>
          <p>La terminale d'un empattement, la courbe délicate d'une panse ou la finesse d'un délié sont autant de micro-décisions de design que seule une police Serif peut incarner avec autant de poésie. On assiste à une renaissance du style 'Grotesque' et 'Antiqua' qui redonne ses lettres de noblesse au craft typographique.</p>
          <p>De Chobani à Burger King, en passant par de nombreuses startups de la Fintech et de l'IA, la typographie redevient le vecteur principal de l'émotion de marque. Le message est clair : à l'heure du numérique total, l'aspect 'imprimé' et classique rassure et ancre la marque dans une pérennité retrouvée.</p>
          <p>Ce mouvement s'accompagne d'un rejet de la perfection géométrique. On accepte, voire on recherche, les irrégularités qui rappellent le plomb et l'encre. Le design d'interface (UI) doit lui aussi s'adapter à ces polices plus complexes, exigeant une gestion du blanc tournant et de l'interligne beaucoup plus fine.</p>
          <p>En 2026, l'élégance redevient radicale. Choisir un Serif à fort contraste (type Didot ou Silver Editorial) est un geste politique : c'est refuser l'uniformité imposée par les géants du web pour revendiquer son propre caractère éditorial.</p>
          <p>Le futur du webzine Kérosène s'inscrit d'ailleurs dans cette lignée : utiliser la force brute de la typographie pour imposer une vision qui ne s'excuse pas d'être sophistiquée.</p>
        `
    }
  ];

  const top4: Article[] = [];
  const rest: Article[] = [];
  const usedSources = new Set<string>();

  // Filtrer les injections par rapport à l'heure (Update à 15h)
  const activeInjections = editorialInjections.filter(inj => {
      const injDate = new Date(inj.pubDate);
      return injDate <= now;
  });

  // On injecte les éditos actifs EN PRIORITÉ
  activeInjections.forEach(inj => {
      top4.push(inj);
      usedSources.add(inj.source);
  });

  // Tri des éditos pour s'assurer que le Hero (Airbnb) est bien le premier
  top4.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

  // On complète avec les articles RSS
  for (const art of allArticles) {
      if (top4.length < 4 && !usedSources.has(art.source)) {
          top4.push(art);
          usedSources.add(art.source);
      } else {
          rest.push(art);
      }
  }

  return [...top4, ...rest];
}

/**
 * Récupère un article spécifique par son ID.
 */
export async function getArticleById(id: string): Promise<Article | undefined> {
    const articles = await fetchArticles();
    return articles.find(art => art.id === id);
}

/**
 * Extrait les dates uniques (YYYY-MM-DD) des articles pour la navigation.
 */
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
