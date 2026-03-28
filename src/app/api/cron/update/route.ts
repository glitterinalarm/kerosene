import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { put } from '@vercel/blob';
import { fetchArticles } from '@/lib/rss';

// IMPORTANT: Set GEMINI_API_KEY in Vercel Env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function GET(request: Request) {
  // Optionnel: Vérification d'un token secret pour sécuriser la route
  const { searchParams } = new URL(request.url);
  const authHeader = request.headers.get('authorization');
  
  if (process.env.CRON_SECRET && 
      authHeader !== `Bearer ${process.env.CRON_SECRET}` && 
      searchParams.get('key') !== process.env.CRON_SECRET) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    console.log('--- STARTING KEROSENE CRON UPDATE ---');

    // 1. Récupérer les dernières news (pour inspiration)
    const recentArticles = await fetchArticles();
    const headlines = recentArticles.slice(0, 15).map((a: any) => `- ${a.title}: ${a.summary}`).join('\n');

    // 2. Demander à Gemini de rédiger les 3 articles de fond (Editorial)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Tu es le Rédacteur en Chef de KÉROSÈNE, un webzine créatif brutaliste, radical et technique.
      Ta mission est de rédiger les 3 analyses majeures du jour basées sur les actualités suivantes :
      ${headlines}

      INSTRUCTIONS STRICTES :
      - Ton : Expert, critique, passionné, référencé (cite le Club des D.A, les agences réelles, les tendances typographiques).
      - Style : Brutaliste, sans fioritures, phrases courtes et percutantes.
      - Politique Visuelle : AUCUNE IMAGE GÉNÉRÉE PAR IA. Suggère UNIQUEMENT des visuels presse réels (ex: Campagnes OOH, Packshots, Stills de films).
      - Langue : Français (France).
      - Sortie attendue : Un objet JSON STRICT avec cette structure :
      {
        "articles": [
          {
            "id": "slug-unique",
            "title": "Titre percutant",
            "category": "BRANDING|DIGITAL|CRAFT|DESIGN",
            "summary": "Résumé de l'analyse (300 caractères max)",
            "content": "Analyse de fond détaillée (3 minutes de lecture réelle). Utilise des balises <strong> et <br> pour structurer.",
            "imageUrl": "URL d'un visuel presse réel si tu le connais, sinon laisse vide.",
            "caption": "Légende technique du visuel",
            "slides": [
               { "image": "URL image 1", "text": "Analyse slide 1", "caption": "Légende 1" },
               { "image": "URL image 2", "text": "Analyse slide 2", "caption": "Légende 2" }
            ]
          }
        ]
      }
      
      Génère exactement 3 articles de fond. Sois précis sur les faits (agences impliquées, typographies utilisées).
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Nettoyer le JSON si Gemini ajoute des backticks ```json
    const cleanedJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const editorialData = JSON.parse(cleanedJson);

    // 3. Sauvegarder dans Vercel Blob (Écrase le précédent)
    const { url } = await put('editorial/daily.json', JSON.stringify({
      date: new Date().toISOString(),
      ...editorialData
    }), {
      access: 'public',
      addRandomSuffix: false // Pour avoir une URL fixe ou prévisible
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Kérosène Editorial Updated',
      blobUrl: url,
      articlesCount: editorialData.articles.length
    });

  } catch (error: any) {
    console.error('Cron Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
