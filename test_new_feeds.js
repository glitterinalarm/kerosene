const Parser = require('rss-parser');
const parser = new Parser();

async function testFeeds() {
  const urls = [
    'https://www.idnworld.com/feed/',
    'https://www.idnworld.com/rss',
    'https://www.brandingmag.com/feed/',
    'https://www.underconsideration.com/brandnew/feed.xml'
  ];
  for (let url of urls) {
    try {
      const feed = await parser.parseURL(url);
      console.log('SUCCESS:', url, feed.title);
    } catch (e) {
      console.log('FAIL:', url, e.message.substring(0, 100));
    }
  }
}
testFeeds();
