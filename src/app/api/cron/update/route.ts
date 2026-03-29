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
    // On passe un peu plus de contexte pour que Gemini choisisse bien
    const headlinesContext = recentArticles.slice(0, 15).map((a: Article) => ({
      title: a.title,
      source: a.source,
      link: a.link,
      summary: a.excerpt || "",
      imageUrl: a.imageUrl
    }));

    // ACTIVATION DU GROUNDING (GOOGLE SEARCH) - MODÈLE PRO RECOMMANDÉ POUR LE GROUNDING
    const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-pro-latest",
        // @ts-expect-error - googleSearch is a valid tool in latest SDK but might not be in the current type definitions
        tools: [{ googleSearch: {} }] 
    });

    const prompt = `
      Tu es le Rédacteur en Chef de KÉROSÈNE, une revue digitale de design radical et de publicité d'avant-garde.
      
      ANALYSE CES SOURCES : ${JSON.stringify(headlinesContext)}.
      
      TA MISSION :
      1. Choisis les 3 sujets les plus forts stratégiquement ou visuellement pour l'édition du jour.
      2. POUR CHAQUE SUJET CHOISI :
         - Effectue une recherche web approfondie (Grounding) pour trouver :
           a) Des détails exclusifs non présents dans le résumé (contingences techniques, agences impliquées, vision créative).
           b) DES URLS D'IMAGES RÉELLES : Cherche des liens directs vers les assets de campagne, photos de presse, ou images haute définition sur les sites officiels/sources de confiance (Creativereview, It's Nice That, LBB, etc.).
         - Rédige un "Insight" radical dans un style "Club des D.A." (exigeant, technique, sans langue de bois).
         - Crée un article "longform" structuré en 4 slides minimum. Chaque slide doit avoir un texte court et percutant, et une URL d'IMAGE SOURCE vérifiée via ta recherche.
      
      RÈGLE D'OR : Remplace les images génériques par des URLS directes trouvées lors de ta recherche web. Ne pas utiliser d'autres fallbacks si tu trouves de l'authentique.
      
      FORMAT JSON STRICT :
      {
        "articles": [
          {
            "id": "slug-unique",
            "title": "Titre Impactant",
            "excerpt": "Résumé incisif",
            "category": "BRANDING|ADVERTISING|DESIGN|CULTURE",
            "insight": "Contenu HTML formaté (p, strong) de l'analyse radicale",
            "imageUrl": "URL_IMAGE_AUTHENTIQUE_SOURCEE",
            "longform": {
              "slides": [
                { "text": "Texte slide 1", "image": "URL_SLIDE_1", "caption": "Légende technique" }
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
