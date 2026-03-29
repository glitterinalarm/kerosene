// VERSION 1.1.5 - ULTRA-STABLE
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { put } from '@vercel/blob';
import { fetchArticles } from '@/lib/rss';

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
    const headlinesContext = recentArticles.slice(0, 10).map((a: any) => ({
      title: a.title,
      summary: a.excerpt || "",
      imageUrl: a.imageUrl
    }));

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const visualLibrary = {
      branding: "photo-1558655146-d09347e92766",
      tech: "photo-1550684848-fac1c5b4e853",
      digital: "photo-1518770660439-4636190af475",
      craft: "photo-1561070791-2526d30994b5",
      architecture: "photo-1485628390555-1e7fa503f9fe"
    };

    const prompt = `
      Tu es rédacteur en chef de KÉROSÈNE. Analyse ces news : ${JSON.stringify(headlinesContext)}.
      Règles :
      1. Choisis 3 sujets.
      2. Utilise IMPÉRATIVEMENT l'URL 'imageUrl' fournie pour chaque news.
      3. Fallback Unsplash seulement si vide : ${JSON.stringify(visualLibrary)}
      4. Format JSON strict : { "articles": [{ "id": "...", "title": "...", "excerpt": "...", "category": "...", "insight": "...", "imageUrl": "...", "longform": { "slides": [...] } }] }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleanedJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const editorialData = JSON.parse(cleanedJson);

    const { url } = await put('editorial/daily.json', JSON.stringify({
      date: new Date().toISOString(),
      ...editorialData
    }), { access: 'public', addRandomSuffix: false, allowOverwrite: true });

    return NextResponse.json({ success: true, message: 'Kérosène Restored', articles: editorialData.articles.length });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
