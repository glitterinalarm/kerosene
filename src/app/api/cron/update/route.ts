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

    // 1. Récupérer les sources d'inspiration (avec leurs images réelles)
    const recentArticles = await fetchArticles();
    const headlinesContext = recentArticles.slice(0, 12).map((a: any) => ({
      title: a.title,
      source: a.source,
      imageUrl: a.imageUrl,
      excerpt: a.excerpt || ""
    }));

    // 2. Initialiser Gemini 2.5 Flash
    const model = genAI.getGenerativeModel(
        { model: "gemini-2.5-flash" },
        { apiVersion: "v1" }
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
      Tu es le Rédacteur en Chef de KÉROSÈNE, un média créatif radical et technique.
      Ta mission : Sélectionner les 3 news les plus fortes et en faire des analyses de fond.
      
      VOICI LA VEILLE DU JOUR (SOURCES RÉELLES + IMAGES) :
      ${JSON.stringify(headlinesContext, null, 2)}

      TON & STYLE :
      - Expert, disruptif, brutaliste.
      - Parle de typographie, de layout, d'audace créative.
      - Langue : Français (France).

      RÈGLE D'OR ICONOGRAPHIE (QUALITÉ SUPÉRIEURE) :
      - Pour chaque article, TU DOIS utiliser une URL d'image haute performance.
      - PRIORITÉ 1: L'URL 'imageUrl' de la news source (si elle semble valide).
      - PRIORITÉ 2: Si l'image source est absente ou suspecte (Creative Review), utilise un ID de notre BIBLIOTHÈQUE KÉROSÈNE ci-dessous :
        Format: https://images.unsplash.com/ [ID] ?auto=format&fit=crop&q=80&w=1600
        IDS DISPONIBLES : ${JSON.stringify(visualLibrary)}
      
      CHOISIS l'ID le plus cohérent avec le sujet (ex: 'architecture' pour un projet spatial, 'branding' pour un logo).

      FORMAT DE SORTIE (JSON STRICT) :
      {
        "articles": [
          {
            "id": "slug-unique",
            "title": "TITRE IMPACTANT EN CAPITALES",
            "category": "BRANDING|DIGITAL|CRAFT|DESIGN",
            "excerpt": "Accroche radicale (150 char max).",
            "insight": "Analyse de fond (300-500 mots). HTML autorisé: <strong>, <p>, <br>.",
            "imageUrl": "L'URL LA PLUS QUALITATIVE (Source ou Bibliothèque)",
            "longform": {
              "slides": [
                 { 
                   "text": "Analyse visuelle déconstruite (100 mots)", 
                   "image": "L'URL DE L'IMAGE (ou une autre de la bibliothèque)", 
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
