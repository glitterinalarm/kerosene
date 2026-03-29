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

    const prompt = `
      Tu es le Rédacteur en Chef de KÉROSÈNE, un média créatif radical et technique.
      Ta mission : Sélectionner les 3 news les plus fortes et en faire des analyses de fond.
      
      VOICI LA VEILLE DU JOUR (SOURCES RÉELLES + IMAGES) :
      ${JSON.stringify(headlinesContext, null, 2)}

      TON & STYLE :
      - Expert, disruptif, brutaliste.
      - Parle de typographie, de layout, d'audace créative.
      - Langue : Français (France).

      RÈGLE D'OR POUR L'ICONOGRAPHIE (CRITIQUE) :
      - Pour chaque article que tu rédiges, TU DOIS REPRENDRE l'URL 'imageUrl' indiquée dans la news source ci-dessus. 
      - N'invente JAMAIS d'image. Si l'URL de la source est absente, utilise une image thématique Unsplash : https://images.unsplash.com/photo-[ID]?auto=format&fit=crop&q=80&w=1200 (Choisis un ID cohérent avec le design/architecture).

      FORMAT DE SORTIE (JSON STRICT) :
      {
        "articles": [
          {
            "id": "slug-unique",
            "title": "TITRE IMPACTANT EN CAPITALES",
            "category": "BRANDING|DIGITAL|CRAFT|DESIGN",
            "excerpt": "Accroche radicale (150 char max).",
            "insight": "Analyse de fond (300-500 mots). HTML autorisé: <strong>, <p>, <br>.",
            "imageUrl": "L'URL DE L'IMAGE SOURCE QUE JE T'AI DONNÉE PLUS HAUT",
            "longform": {
              "slides": [
                 { 
                   "text": "Analyse visuelle déconstruite (100 mots)", 
                   "image": "L'URL DE L'IMAGE SOURCE (identique ou une autre de la liste si cohérente)", 
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
