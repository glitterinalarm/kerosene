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
    const headlines = recentArticles.slice(0, 15).map((a: any) => `- ${a.title}: ${a.summary}`).join('\n');

    // 2. Initialiser Gemini 2.5 Flash (Modèle stable en 2026)
    const model = genAI.getGenerativeModel(
        { model: "gemini-2.5-flash" },
        { apiVersion: "v1" }
    );

    const prompt = `
      Tu es le Rédacteur en Chef de KÉROSÈNE, un webzine créatif brutaliste, radical et technique.
      Ta mission : Rédiger les 3 analyses majeures du jour basées sur cette veille :
      ${headlines}

      TON & STYLE :
      - Radical, expert, sans fioritures (Brutaliste).
      - Cite des agences réelles, des typographies, des concepts de "craft".
      - Langue : Français (France).

      FORMAT DE SORTIE (JSON STRICT) :
      {
        "articles": [
          {
            "id": "slug-unique",
            "title": "Titre Impactant (Capitales si possible)",
            "category": "BRANDING|DIGITAL|CRAFT|DESIGN",
            "excerpt": "Accroche brutale et rapide (150 char max).",
            "insight": "Analyse de fond radicale (300-500 mots). Utilise obligatoirement des balises HTML : <strong>, <p>, <br>.",
            "imageUrl": "URL d'une image haute résolution (Préfère Unsplash via source.unsplash.com/featured/?keyword ou des URLs presse REELLES et STABLES).",
            "longform": {
              "slides": [
                 { 
                   "text": "Analyse visuelle déconstruite du projet (100 mots)", 
                   "image": "URL d'une autre image liée au projet", 
                   "caption": "Crédit technique" 
                 }
              ]
            }
          }
        ]
      }
      
      IMPORTANT: N'utilise JAMAIS d'image générée par IA. Sourcing réel uniquement.
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
