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
    const prompt = `
      Tu es le Rédacteur en Chef de KÉROSÈNE.
      Rédige 3 analyses créatives basées sur : ${headlines}
      Sortie JSON: { "articles": [...] }
    `;

    // VERSION 1.2 (LOGGING)
    console.log("Using model: gemini-pro");
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);

    if (!result) throw new Error("Gemini Pro failed to respond");
    
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
