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
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
    const rawArticles = recentArticles.filter(a => !a.source?.includes('IA') && a.link && new Date(a.pubDate) >= fiveDaysAgo);
    
    // Augmentation du pool pour permettre une sélection plus variée par thématique (100 articles)
    const headlinesContext = rawArticles.slice(0, 100).map((a: Article) => ({
      id: a.id,
      title: a.title,
      source: a.source,
      category: a.category,
      link: a.link,
      pubDate: a.pubDate,
      summary: a.excerpt || "",
      imageUrl: a.imageUrl,
      allImages: a.allImages || []
    }));

    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash"
    });

    const prompt = `
      Tu es le Rédacteur en Chef de KÉROSÈNE, une revue digitale de design radical et d'avant-culture.
      
      ANALYSE CES SOURCES : ${JSON.stringify(headlinesContext)}.
      
      TA MISSION :
      1. SÉLECTIONNE L'ARTICLE "HERO" (À LA UNE) : Choisis OBLIGATOIREMENT une actualité ULTRA-FRAÎCHE (analyse le champ "pubDate" pour prendre une des news les plus récentes) qui est visuellement et éditorialement la plus impactante de la journée. 
      2. POUR CET ARTICLE HERO : Rédige un contenu "longform" journalistique très fouillé.
      3. SÉLECTIONNE les sujets les PLUS MARQUANTS du jour pertinents pour CHACUNE des 6 thématiques (entre 1 et 5 par thématique selon la richesse de l'actualité).
         - GRAPHISME
         - PUBLICITÉ
         - SOCIAL MEDIA
         - INNOVATION
         - DROP
         - TREND

      CONTRAINTES :
      - Style "Club des D.A." (exigeant, technique, sans langue de bois, analyse journalistique pointue pour le HERO).
      - Le HERO doit obligatoirement avoir la catégorie "HERO".

      RÈGLES D'OR ABSOLUES (ÉCHEC INTERDIT) :
      - UTILISATION DES IDs : Tu ne dois sélectionner que des articles existants dans SOURCES et utiliser EXACTEMENT leur champ "id". Ne génère AUCUN article factice.
      - AUCUN DOUBLON DE SUJET : Ne choisis jamais deux fois la même campagne ou le même projet. Chaque "id" doit être unique.
      - FRAÎCHEUR EXTRÊME : Kérosène exige la primeur. Le Hero DOIT être une nouvelle très chaude (hier ou aujourd'hui selon pubDate).
      - VARIATION VISUELLE : La propriété "allImages" contient plusieurs visuels de la campagne. Tu DOIS ABSOLUMENT distribuer des images DIFFÉRENTES issues de "allImages" pour chaque slide de ton "longform". Ne répète JAMAIS "imageUrl" en boucle sur tous les slides.

      FORMAT JSON STRICT (un seul tableau "articles" contenant le HERO suivi des autres, pas de title, ni de fields inutiles) :
      {
        "articles": [
          {
            "id": "EXACT_ID_FOURNI_DANS_LES_SOURCES",
            "category": "HERO|GRAPHISME|PUBLICITÉ|SOCIAL MEDIA|INNOVATION|DROP|TREND",
            "insight": "Contenu HTML (p, strong) très détaillé, argumenté et exhaustif. Ne tronque jamais l'analyse.",
            "longform": {
              "slides": [
                { "text": "Analyse technique slide 1", "image": "URL_PIOCHÉE_DANS_ALLIMAGES", "caption": "Légende" }
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
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error(`Aucun JSON valide trouvé dans la réponse. Extrait: ${responseText.substring(0, 100)}...`);
    }
    const editorialData = JSON.parse(jsonMatch[0]);

    // MAPPING SÉCURISÉ : Reconstruire l'article à partir de la source brute pour interdire les hallucinations
    const rawArticlesArray = Array.from(rawArticles) as any[];
    const validatedArticles = (editorialData.articles || []).map((aiArt: any) => {
        const sourceArt = rawArticlesArray.find(r => r.id === aiArt.id);
        if (!sourceArt) return null; // ID halluciné ou invalide
        
        return {
            ...sourceArt, // Titre, link, imageUrl, pubDate 100% authentiques
            category: aiArt.category !== "HERO" ? aiArt.category : "HERO",
            insight: aiArt.insight,
            longform: aiArt.longform || { slides: [{ text: aiArt.insight, image: sourceArt.imageUrl }] }
        };
    }).filter(Boolean);

    // DÉDUPLICATION BLINDÉE (par ID, Link, et Similitude du Titre court)
    const dedupedArticles: any[] = [];
    const seenIds = new Set();
    const seenLinks = new Set();
    const seenTitles = new Set();
    
    for (const art of validatedArticles) {
        // Titre simplifié pour repérer 2 flux parlant de la même chose
        const simTitle = art.title.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 25);
        
        if (!seenIds.has(art.id) && !seenLinks.has(art.link) && !seenTitles.has(simTitle)) {
            dedupedArticles.push(art);
            seenIds.add(art.id);
            seenLinks.add(art.link);
            seenTitles.add(simTitle);
        }
    }

    const dataToSave = JSON.stringify({
      date: new Date().toISOString(),
      articles: dedupedArticles,
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
