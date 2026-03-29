// VERSION 1.2.0 - GROUNDED EDITORIAL ENGINE
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { put } from '@vercel/blob';
import { fetchArticles, type Article } from '@/lib/rss';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const authHeader = request.headers.get('authorization');
  
  if (process.env.CRON_SECRET && 
      authHeader !== `Bearer ${process.env.CRON_SECRET}` && 
      searchParams.get('key') !== process.env.CRON_SECRET) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const recentArticles = await fetchArticles();
    // On passe plus de contexte pour que Gemini puisse ventiler par thématique
    const headlinesContext = recentArticles.slice(0, 60).map((a: Article) => ({
      title: a.title,
      source: a.source,
      category: a.category,
      link: a.link,
      summary: a.excerpt || "",
      imageUrl: a.imageUrl
    }));

    // ACTIVATION DU GROUNDING (GOOGLE SEARCH)
    const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        // @ts-expect-error - googleSearch is a valid tool
        tools: [{ googleSearch: {} }] 
    });

    const prompt = `
      Tu es le Rédacteur en Chef de KÉROSÈNE, une revue digitale de design radical et d'avant-culture.
      
      ANALYSE CES SOURCES : ${JSON.stringify(headlinesContext)}.
      
      TA MISSION :
      Sélectionne les 3 sorties/sujets les PLUS MARQUANTS du jour pour CHACUNE des 6 thématiques suivantes :
      1. GRAPHISME (Branding, Typographie, Motion, Print)
      2. PUBLICITÉ (Campagnes majeures, Films, Prints, Innovation média)
      3. ACTIVATION DIGITALE (Expériences web, AR/VR, Installation interactive, Web3)
      4. DROP (Street culture, Sneakers, Collabs, Fashion drops)
      5. TREND (Phénomènes de société, Esthétiques émergentes, Signaux faibles)
      6. MUSIQUE (Sorties d'albums, Clips marquants, Direction artistique musicale)

      CONTRAINTES :
      - EXACTEMENT 3 SUJETS par thématique (soit 18 articles au total).
      - Style "Club des D.A." (exigeant, technique, sans langue de bois).
      - Effectue une recherche web (Grounding) pour CHAQUE sujet afin de trouver des détails techniques exclusifs et SURTOUT des URLS d'IMAGES RÉELLES (assets de campagne, photos de presse).
      - Crée un article pour chaque sujet avec un "insight" radical et une structure "longform" (4 slides).
      
      RÈGLE D'OR : Remplace toute image générique par une URL directe provenant de ta recherche web.
      
      FORMAT JSON STRICT (un seul tableau "articles" contenant les 18 objets) :
      {
        "articles": [
          {
            "id": "slug-unique",
            "title": "Titre Impactant",
            "excerpt": "Résumé incisif",
            "category": "GRAPHISME|PUBLICITÉ|ACTIVATION DIGITALE|DROP|TREND|MUSIQUE",
            "insight": "Contenu HTML formaté (p, strong) de l'analyse radicale",
            "imageUrl": "URL_IMAGE_AUTHENTIQUE",
            "longform": {
              "slides": [
                { "text": "Analyse technique slide 1", "image": "URL_SLIDE_1", "caption": "Légende technique" }
              ]
            }
          }
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleanedJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const editorialData = JSON.parse(cleanedJson);

    const { url } = await put('editorial/daily.json', JSON.stringify({
      date: new Date().toISOString(),
      ...editorialData,
      grounded: true
    }), { access: 'public', addRandomSuffix: false, allowOverwrite: true });

    return NextResponse.json({ 
        success: true, 
        message: 'Kérosène Grounded & Updated', 
        articles: editorialData.articles.length,
        blobUrl: url 
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[CRON ERROR]", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
