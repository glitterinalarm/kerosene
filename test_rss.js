const Parser = require('rss-parser');
const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'mediaContent'],
      ['media:thumbnail', 'mediaThumbnail'],
      ['content:encoded', 'contentEncoded'],
      ['description', 'description'],
      ['enclosure', 'enclosure'],
    ]
  }
});

const feeds = [
  "https://www.itsnicethat.com/rss",
  "https://www.creativereview.co.uk/feed/",
  "https://thedsgnblog.com/rss",
  "https://www.blogdumoderateur.com/feed/",
  "https://www.danstapub.com/feed/",
];

async function testFeeds() {
  for (const url of feeds) {
    console.log(`\n\n=== Fetching ${url} ===`);
    try {
      const feed = await parser.parseURL(url);
      if (feed.items.length > 0) {
        const item = feed.items[0];
        console.log(`Title: ${item.title}`);
        console.dir(Object.keys(item));
        
        let img = null;
        if (item.enclosure && item.enclosure.url && item.enclosure.type && item.enclosure.type.startsWith('image/')) {
            img = item.enclosure.url;
        }
        
        const contentStr = (item.contentEncoded || item.content || item.description || "");
        const match = contentStr.match(/<img[^>]+src=["']([^"']+)["']/i);
        if (!img && match) img = match[1];

        // Regarder spécifiquement mediaContent et thumbnail des customFields n'est parfois pas retourné sous la forme object mais string, ou n'est pas configuré
        if (!img && item.mediaContent && item.mediaContent['$']) {
            img = item.mediaContent['$'].url;
        }

        console.log(`Found Image? ${img}`);
      }
    } catch (e) {
      console.log(`Error parsing ${url}: ${e.message}`);
    }
  }
}

testFeeds();
