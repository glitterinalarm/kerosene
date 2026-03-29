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
    const rawArticles = recentArticles.filter(a => !a.source?.includes('IA') && a.link);
    // Augmentation du pool pour permettre une sélection plus variée par thématique (100 articles)
    const headlinesContext = rawArticles.slice(0, 100).map((a: Article) => ({
      title: a.title,
      source: a.source,
      category: a.category,
      link: a.link,
      summary: a.excerpt || "",
      imageUrl: a.imageUrl
    }));

    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash"
    });

    const prompt = `
      Tu es le Rédacteur en Chef de KÉROSÈNE, une revue digitale de design radical et d'avant-culture.
      
      ANALYSE CES SOURCES (dont de nombreux flux X/Twitter et Instagram) : ${JSON.stringify(headlinesContext)}.
      
      TA MISSION :
      1. SÉLECTIONNE L'ARTICLE "HERO" (À LA UNE) : Choisis le sujet le plus riche et impactant du jour, toutes catégories confondues.
      2. POUR CET ARTICLE HERO : Rédige un contenu "longform" (insight) ultra-bien construit, journalistique, qui a du fond, des arguments, un développement, et une ouverture sur le sujet (pas juste une brève). C'est ta pièce maîtresse.
      3. ENSUITE, sélectionne 4 sujets/sorties les PLUS MARQUANTS du jour pour CHACUNE des 5 thématiques suivantes :
         - GRAPHISME
         - PUBLICITÉ
         - ACTIVATION DIGITALE
         - DROP
         - TREND

      CONTRAINTES :
      - Style "Club des D.A." (exigeant, technique, sans langue de bois, analyse journalistique pointue pour le HERO).
      - Le HERO doit avoir la catégorie "HERO".

      RÈGLE D'OR POUR LES ASSETS : Tu n'as pas accès à internet. Tu DOIS obligatoirement réutiliser la propriété "imageUrl" exacte ET la propriété "link" exacte qui sont fournies pour chaque article dans la variable SOURCES JSON. Ne les invente surtout pas (pas de liens relatifs).
      
      FORMAT JSON STRICT (un seul tableau "articles" contenant le HERO suivi des autres, soit 21 objets max) :
      {
        "articles": [
          {
            "id": "slug-unique",
            "title": "Titre Impactant",
            "link": "URL_COMPLETE_COPIEE_DE_LA_SOURCE",
            "excerpt": "Résumé incisif",
            "category": "HERO|GRAPHISME|PUBLICITÉ|ACTIVATION DIGITALE|DROP|TREND",
            "insight": "Contenu HTML formaté (p, strong) très détaillé pour le HERO, plus concis pour les autres.",
            "imageUrl": "URL_IMAGE_AUTHENTIQUE",
            "longform": {
              "slides": [
                { "text": "Analyse technique slide 1", "image": "URL_SLIDE_1", "caption": "Légende" }
              ]
            }
          }
        ]
      }
    `;

    let result;
    try {
        result = await model.generateContent(prompt);
    } catch (apiError: any) {
        if (apiError.message?.includes("429") || apiError.message?.includes("Quota")) {
            console.error("[GEMINI QUOTA ERROR] Votre clé API a atteint sa limite ou n'a pas accès à ce modèle.");
            return NextResponse.json({ 
                success: false, 
                error: "QUOTA_EXCEEDED", 
                details: "La limite de l'API Gemini est atteinte (Limit 0). Veuillez vérifier votre clé API dans le dashboard Vercel." 
            }, { status: 429 });
        }
        throw apiError;
    }

    const responseText = result.response.text();
    const cleanedJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const editorialData = JSON.parse(cleanedJson);

    const dataToSave = JSON.stringify({
      date: new Date().toISOString(),
      ...editorialData,
      grounded: true
    });

    let savedUrl = "local";

    if (process.env.NODE_ENV === "development") {
      // OFFLINE MODE / LOCAL DEV
      const fs = require('fs');
      const path = require('path');
      const dirPath = path.join(process.cwd(), 'public', 'editorial');
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      fs.writeFileSync(path.join(dirPath, 'daily.json'), dataToSave);
      console.log("[CRON] Fichier sauvegardé localement dans public/editorial/daily.json");
    } else {
      // PRODUCTION MODE (VERCEL BLOB)
      if (!process.env.BLOB_READ_WRITE_TOKEN) {
        throw new Error("Missing BLOB_READ_WRITE_TOKEN for production deployment.");
      }
      const { url } = await put('editorial/daily.json', dataToSave, { 
        access: 'public', 
        addRandomSuffix: false, 
        allowOverwrite: true 
      });
      savedUrl = url;
    }

    return NextResponse.json({ 
        success: true, 
        message: 'Kérosène Grounded & Updated', 
        articlesCount: editorialData.articles?.length || 0,
        blobUrl: savedUrl 
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[CRON ERROR]", error);
    return NextResponse.json({ 
        success: false, 
        error: "INTERNAL_ERROR", 
        message: message 
    }, { status: 500 });
  }
}
