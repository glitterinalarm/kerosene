import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { put } from '@vercel/blob';
import { fetchArticles } from '@/lib/rss';

// Utilisation de la version stable v1 (plus compatible en 2026)
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
    console.log('--- KEROSENE ENGINE: STARTING DAILY EDITORIAL ---');

    // 1. Récupérer les sources d'inspiration
    const recentArticles = await fetchArticles();
    const headlinesContext = recentArticles.slice(0, 15).map((a: any) => ({
      title: a.title,
      summary: a.excerpt || a.insight || "News créative",
      url: a.link
    }));

    // 2. Initialiser Gemini avec Recherche Google (Grounding)
    const model = genAI.getGenerativeModel(
      { 
        model: "gemini-1.5-flash",
        // @ts-ignore
        tools: [{ googleSearchRetrieval: {} }] 
      },
      { apiVersion: "v1beta" }
    );

    const visualLibrary = {
      branding: "photo-1558655146-d09347e92766", // Brutalist Graphic
      tech: "photo-1550684848-fac1c5b4e853",      // Abstract Dark Tech
      digital: "photo-1518770660439-4636190af475", // Circuit/Dark
      craft: "photo-1561070791-2526d30994b5",    // Minimal typography
      architecture: "photo-1485628390555-1e7fa503f9fe", // Concrete/Brutalist
      editorial: "photo-1557683316-973673baf926"  // Dark Gradient/Texture
    };

    const prompt = `
      Tu es le Rédacteur en Chef de KÉROSÈNE, média expert en craft et design radical.
      
      ÉCHÉANCIER DE PRODUCTION :
      1. ANALYSE : Examine la veille du jour : ${JSON.stringify(headlinesContext)}
      2. SÉLECTION : Choisis 3 sujets à fort impact visuel (Marques, Edition, Activation, Digital).
      3. SOURCING RÉEL (CRITIQUE) :
         - Pour chaque sujet, utilise l'outil Recherche Google pour trouver l'iconographie RÉELLE.
         - Cherche les photos de campagne, les visuels de presse ou les réalisations concrètes (ex: pour "Spillll", cherche les visuels du magazine).
         - Revenir avec des URLs d'images stables et qualitatives.
      
      RÈGLE D'OR ICONOGRAPHIE :
      - Si tu trouves une image RÉELLE du sujet -> UTILISE-LA.
      - Si le sujet est abstrait ou si la recherche échoue -> UTILISE un ID de notre BIBLIOTHÈQUE KÉROSÈNE (Unsplash) : 
        IDs: ${JSON.stringify(visualLibrary)}
        Format: https://images.unsplash.com/[ID]?auto=format&fit=crop&q=80&w=1600

      FORMAT DE SORTIE (JSON STRICT) :
      {
        "articles": [
          {
            "id": "slug-unique",
            "title": "TITRE IMPACTANT EN CAPITALES",
            "category": "BRANDING|DIGITAL|CRAFT|DESIGN",
            "excerpt": "Accroche brute (150 char max).",
            "insight": "Analyse de fond radicale (300-500 mots). HTML: <strong>, <p>, <br>.",
            "imageUrl": "L'URL LA PLUS RÉELLE ET QUALITATIVE (TROUVÉE SUR GOOGLE OU BIBLIOTHÈQUE)",
            "longform": {
              "slides": [
                 { 
                   "text": "Analyse visuelle déconstruite (100 mots)", 
                   "image": "URL image réelle du projet", 
                   "caption": "Crédit technique" 
                 }
              ]
            }
          }
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Nettoyage JSON
    const cleanedJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const editorialData = JSON.parse(cleanedJson);

    // 3. Sauvegarder dans Vercel Blob
    const { url } = await put('editorial/daily.json', JSON.stringify({
      date: new Date().toISOString(),
      ...editorialData
    }), {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true
    });

    console.log('--- KEROSENE ENGINE: SUCCESS ---');

    return NextResponse.json({ 
      success: true, 
      message: 'Kérosène Editorial Updated (Gemini 2.5 Flash)',
      blobUrl: url,
      articles: editorialData.articles.map((a: any) => a.title)
    });

  } catch (error: any) {
    console.error('Kerosene Engine Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
