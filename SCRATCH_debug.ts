import { fetchArticles } from './src/lib/rss.ts';

async function main() {
    try {
        const articles = await fetchArticles();
        console.log("TOP 3 ARTICLES FOR TODAY:");
        articles.slice(0, 3).forEach((a: any, i: number) => {
            console.log(`${i+1}. TITLE: ${a.title}`);
            console.log(`   LINK: ${a.link}`);
            console.log(`   SOURCE: ${a.source}`);
            console.log(`---`);
        });
    } catch (e) {
        console.error(e);
    }
}

main();
