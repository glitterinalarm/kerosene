const Parser = require('rss-parser');
const parser = new Parser({
  customFields: {
    item: [
      ['description', 'description'],
      ['content:encoded', 'contentEncoded']
    ]
  }
});

async function test() {
  const feed = await parser.parseURL("https://thedsgnblog.com/rss");
  const item = feed.items[0]; // N N
  console.log("RSS Title:", item.title);
  console.log("--- DESCRIPTION ---");
  console.log(item.description || "NO DESC");
  console.log("--- CONTENT ENCODED ---");
  console.log(item.contentEncoded || "NO CONTENT");
}
test();
