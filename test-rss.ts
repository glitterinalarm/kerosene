import { fetchArticles } from './src/lib/rss';

async function test() {
    try {
        console.log("Fetching articles...");
        const articles = await fetchArticles();
        console.log(`Found ${articles.length} articles.`);
        articles.slice(0, 5).forEach(art => {
            console.log(`- ID: ${art.id}`);
            console.log(`  Title: ${art.title}`);
            console.log(`  Link: ${art.link}`);
        });
    } catch (e) {
        console.error(e);
    }
}

test();
