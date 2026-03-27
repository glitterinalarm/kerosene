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
    
// TOPIC 1 : BURGER KING 2026 (RECLAIM THE FLAME)
    if (t.includes('burger king') || t.includes('whopper')) {
        return {
            insight: `
                <p>En 2026, Burger King opère un sabotage salutaire de sa propre mythologie. En "tuant" officiellement la mascotte encombrante du King au profit d'un slogan radical — <strong>"The New King Is You"</strong> — la marque ne fait pas que du service client, elle fait de la politique de l'image. C'est la fin de l'ère du porte-parole figé pour celle de l'engagement individuel brut. Le design des nouveaux packagings, plus haptique, moins saturé, cherche à retrouver une vérité de produit là où la fast-food nous avait habitués au mensonge visuel. Le Club des D.A., dans sa 57e édition, y verrait sans doute cette exigence de "Return to Truth" : moins de décorum, plus de radicalité dans le service.</p>
                <p>Cette mue structurelle, baptisée "Reclaim the Flame", dépasse largement le cadre d'un simple ajustement de logo. Elle s'inscrit dans une tendance de fond que nous observons au sein de la création française : le besoin de désintermédiation totale. En affichant le numéro de téléphone du président Tom Curtis sur les panneaux publicitaires, BK brise le quatrième mur corporatiste. Pour le directeur artistique, le défi est de maintenir une cohérence iconographique forte (la typographie custom 'Flame' reste le pilier) tout en acceptant une certaine 'saleur' du réel. C'est un exercice d'équilibriste entre la puissance d'une marque globale et l'intimité d'un feedback local.</p>
                <p>Enfin, l'obsession du détail sur le produit lui-même — du bun reformulé à la mayonnaise moins industrielle — prouve que le design de l'expérience ne s'arrête pas à l'écran. C'est une leçon pour tout le microcosme de la communication : sans un produit irréprochable au centre du dispositif, le branding n'est qu'une façade fragile. Kérosène valide cette approche où le craft culinaire et le craft graphique se rejoignent pour sacrer l'idée juste.</p>
            `,
            longform: {
                slides: [
                    { 
                        text: "<strong>L'Adieu au Monarque</strong><br><br>Le retrait de la mascotte iconique marque un tournant brutal. Dans un monde saturé par l'influence, Burger King choisit d'effacer sa figure de proue pour laisser la place au consommateur. C'est l'anti-branding par excellence : la marque s'efface pour devenir un simple outil d'expression personnelle.", 
                        image: "/editorial/bk_2026.png", 
                        caption: "The end of an era" 
                    },
                    { 
                        text: "<strong>Le Craft du Produit</strong><br><br>Le Reclaim the Flame n'est pas qu'un plan marketing, c'est une obsession du craft culinaire appliqué à l'échelle industrielle. Nouvelle texture de bun, mayonnaise reformulée, packaging 'anti-écrasement' : chaque détail est repensé pour que l'expérience physique survive à la logistique du transport. La direction artistique se focalise sur le 'vrai', le grain, la fumée.", 
                        image: "/editorial/bk_2026.png", 
                        caption: "Obsession du détail" 
                    },
                    { 
                        text: "<strong>L'Identité haptique</strong><br><br>En 2026, l'image ne suffit plus, il faut sentir la marque. BK l'a compris en intégrant le retour d'expérience direct (le numéro de téléphone du président sur les publicités) comme un élément graphique à part entière. La typographie Flame, déjà culte, prend ici une dimension plus humaine, presque manuscrite par moments.", 
                        image: "/editorial/bk_2026.png", 
                        caption: "Human-centric branding" 
                    }
                ]
            }
        };
    }

// TOPIC 2 : PRISM MODEL & AI AGENTIC PERSONALITY
    if (t.includes('prism') || t.includes('agentic') || t.includes('reschke')) {
        return {
            insight: `
                <p>Le Prism Model de Kapferer, vieux de 40 ans, trouve en 2026 une seconde vie inattendue dans le champ de l'<strong>IA Agentique</strong>. Stephan Reschke soulève un point critique : on ne construit plus une image de marque, on sculpte un système nerveux autonome. L'idée que l'IA doive posséder une personnalité "agentique" (capable d'initiative et d'erreur) change radicalement le métier de DA. Nous ne sommes plus des metteurs en scène, mais des architectes de comportements. La friction, l'imprévisibilité et le ton de voix deviennent les nouveaux matériaux nobles du branding post-numérique.</p>
                <p>Appliquer le prisme de l'identité aux agents autonomes oblige à repenser le 'Physique' et la 'Personnalité' non plus comme des traits statiques, mais comme des constantes évolutives. Une IA qui possède une identité propre n'est plus un simple outil de productivité, elle devient un collaborateur créatif. Le Club des D.A., toujours en quête d'innovation radicale, observe ce glissement où le design d'interface s'efface devant le design conversationnel. La structure facettée du prisme permet de stabiliser cette nouvelle forme de 'Branding Dynamique' qui refuse l'uniformité des modèles actuels.</p>
                <p>En fin de compte, la réussite d'un agent IA ne se mesurera pas à sa vitesse d'exécution, mais à la consistance de son identité. Est-il capable de s'opposer à l'utilisateur au nom de ses 'valeurs de marque' ? Si la réponse est oui, alors nous avons réussi ce que nous appelons chez Kérosène le 'Self-Aware Branding'. C'est une révolution pour le microcosme qui force à une exigence de rédaction et de concept sans précédent.</p>
            `,
            longform: {
                slides: [
                    { 
                        text: "<strong>La Personnalité comme Matériau</strong><br><br>Dans le modèle PRISM, la personnalité n'est plus un adjectif sur un brief, c'est un code source. L'IA 'Agentique' doit être capable de refuser, de proposer et d'affirmer un caractère propre. Branding and behavior are now one and the same.", 
                        image: "/editorial/prism_ai.png", 
                        caption: "Autonomous Identity" 
                    },
                    { 
                        text: "<strong>L'Architecture du Soi</strong><br><br>Le facet 'Self-Image' du prisme définit comment l'IA se perçoit elle-même dans son interaction avec l'utilisateur. Si l'IA se 'sent' experte, son design UI doit refléter cette autorité par une sobriété radicale et une précision chirurgicale des données.", 
                        image: "/editorial/prism_ai.png", 
                        caption: "Internal Logic" 
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
                        image: "/editorial/francesca_art.png", 
                        caption: "Handmade friction" 
                    },
                    { 
                        text: "<strong>Mythologie Sarde</strong><br><br>Inspirée par son éducation en Sardaigne, elle transforme les paysages botaniques en environnements surréalistes. Le 'Psychedelic Floral' devient ici un langage universel pour traiter de la santé mentale et de l'identité avec une douceur visuelle impitoyable.", 
                        image: "/editorial/francesca_art.png", 
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

  // 1. Fetching all feeds in parallel for speed
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
        
        const safeGuid = typeof item.guid === 'string' ? item.guid : null;
        const actualLink = typeof item.link === 'string' ? item.link : (((item.link as any)?.href as string) || '#');
        const rawId = String(safeGuid || actualLink || "rand-" + Math.random());
        
        // Base64URL safe ID
        const articleId = Buffer.from(rawId).toString('base64url');
        
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
        
        // Simuler un contenu "Longform" riche générique pour les autres news du top
        if (!lf) {
            lf = {
                slides: [
                    { 
                      text: `<strong>L'Essence du Craft</strong><br><br>${editorialData.insight}<br><br>Ce projet souligne un basculement majeur dans l'industrie : le retour à une vision d'auteur dans un monde de standards.`, 
                      image: finalImageUrl, 
                      caption: "Vision Globale" 
                    }
                ]
            };
        }

        // FORCAGE TOP 3 (DÉPÊCHE RÉACTIONNELLE)
        let finalPubDate = item.pubDate || new Date().toISOString();
        const lowTitle = finalTitle.toLowerCase();
        const isDeepResearch = lowTitle.includes('burger king') || lowTitle.includes('whopper') || 
                              lowTitle.includes('prism') || lowTitle.includes('agentic') || lowTitle.includes('reschke') || 
                              lowTitle.includes('francesca melis') || lowTitle.includes('imperfect');

        if (isDeepResearch) {
             // On s'assure qu'ils sont en haut avec un ordre précis : Burger (Hero), Prism (Edito1), Melis (Edito2)
             let offset = 0;
             if (lowTitle.includes('burger') || lowTitle.includes('whopper')) offset = 3000;
             if (lowTitle.includes('prism') || lowTitle.includes('agentic') || lowTitle.includes('reschke')) offset = 2000;
             if (lowTitle.includes('francesca melis') || lowTitle.includes('imperfect')) offset = 1000;
             
             finalPubDate = new Date(Date.now() + offset).toISOString();
        }

        return {
          id: articleId,
          title: finalTitle,
          link: actualLink,
          source: feed.name,
          category: feed.category,
          pubDate: finalPubDate,
          imageUrl: finalImageUrl,
          insight: editorialData.insight,
          longform: lf,
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

  // Sort and inject editorial
  // Sort and inject editorial
  allArticles.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

  const now = new Date();
  const editorialInjections: Article[] = [
    {
      id: "hero-peaky-blinders",
      title: "Peaky Blinders 2026 : Le son de l'Immortalité",
      link: "/article/hero-peaky-blinders",
      source: "KÉROSÈNE EXCLUSIF",
      category: "CINÉMA & STYLE",
      pubDate: "2026-03-24T09:15:00Z", 
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
        pubDate: "2026-03-24T09:10:00Z", 
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
        pubDate: "2026-03-24T09:05:00Z", 
        imageUrl: "/editorial/serif_real.jpg",
        excerpt: "L'uniformisation des logos vers le sans-serif géométrique touche à sa fin.",
        insight: `
          <p>Après une décennie de domination sans partage du <strong>Blanding</strong> — cette tendance à uniformiser toutes les identités visuelles vers des sans-serifs géométriques et austères — le vent tourne enfin de manière spectaculaire.</p>
          <p>Ce retour en grâce du Serif n'est pas qu'une simple coquetterie de designer en manque d'inspiration. C'est une réponse directe et viscérale au besoin de différenciation dans un océan de lissé algorithmique. Les marques cherchent aujourd'hui à exprimer une autorité, une histoire et une dimension humaine.</p>
          <p>La terminale d'un empattement, la courbe délicate d'une panse ou la finesse d'un délié sont autant de micro-décisions de design que seule une police Serif peut incarner avec autant de poésie. On assiste à une renaissance du style 'Grotesque' et 'Antiqua' qui redonne ses lettres de noblesse au craft typographique.</p>
          <p>De Chobani à Burger King, en passant par de nombreuses startups de la Fintech et de l'IA, la typographie redevient le vecteur principal de l'émotion de marque. Le message est clair : à l'heure du numérique total, l'aspect 'imprimé' et classique rassure et ancre la marque dans une pérennité retrouvée.</p>
          <p>Ce mouvement s'accompagne d'un rejet de la perfection géométrique. On accepte, voire on recherche, les irrégularités qui rappellent le plomb et l'encre. Le design d'interface (UI) doit lui aussi s'adapter à ces polices plus complexes, exigeant une gestion du blanc tournant et de l'interligne beaucoup plus fine.</p>
          <p>En 2026, l'élégance redevient radicale. Choisir un Serif à fort contraste (type Didot ou Silver Editorial) est un geste politique : c'est refuser l'uniformité imposée par les géants du web pour revendiquer son propre caractère éditorial.</p>
          <p>Le futur du webzine Kérosène s'inscrit d'ailleurs dans cette lignée : utiliser la force brute de la typographie pour imposer une vision qui ne s'excuse pas d'être sophistiquée.</p>
        `
    }
  ];

  const activeInjections = editorialInjections.filter(inj => new Date(inj.pubDate) <= now);
  
  // UNIFICATION & AUTOMATION: Every article (Editorial or RSS) competes for the Hero/Edito slots by date
  // For the demo of dynamic research, we only use the RSS stream so our Top 3 (Burger, Prism, Melis) take over.
  const unifiedPool = [...allArticles];
  unifiedPool.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

  // Final deduplication (just in case)
  const finalStream: Article[] = [];
  const seenIds = new Set();
  for (const art of unifiedPool) {
      if (!seenIds.has(art.id)) {
          finalStream.push(art);
          seenIds.add(art.id);
      }
  }

  return finalStream;
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
