// source: https://github.com/plenaryapp/awesome-rss-feeds

const listRoot = document.querySelector('.news-list');
const statusText = document.querySelector('#status-text');

const date = new Date();
document.querySelector('#date').textContent = date.toDateString();

const feeds = [
    { name: 'The Hindu', url: 'https://www.thehindu.com/feeder/default.rss' },
    { name: 'BBC News - India', url: 'http://feeds.bbci.co.uk/news/world/asia/india/rss.xml' },
    { name: 'The Indian Express', url: 'http://indianexpress.com/print/front-page/feed/' },
    { name: 'India - The Guardian', url: 'https://www.theguardian.com/world/india/rss' },
    { name: 'Times of India', url: 'https://timesofindia.indiatimes.com/rssfeedstopstories.cms' },
    { name: 'Top Stories - Google News', url: 'https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN%3Aen&oc=11' }
];

let loaded = 0;
let failed = 0;

feeds.forEach(function (feed) {
    getFeed(feed.url, feed.name);
});

function stripHtml(html) {
    if (!html) {
        return 'No summary available.';
    }
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const text = (doc.body.textContent || '').replace(/\s+/g, ' ').trim();
    if (!text) {
        return 'No summary available.';
    }
    return text.length > 240 ? text.slice(0, 237) + '...' : text;
}

function updateStatus() {
    const finished = loaded + failed;
    if (finished < feeds.length) {
        statusText.textContent = 'Loading feeds: ' + finished + '/' + feeds.length;
        return;
    }

    if (failed > 0) {
        statusText.textContent = 'Loaded ' + loaded + ' feeds. ' + failed + ' failed to respond.';
        return;
    }

    statusText.textContent = 'All sources refreshed successfully.';
}

function renderError(name) {
    const block = document.createElement('li');
    block.className = 'source-block';
    block.innerHTML =
        '<h3 class="source-title">' + name + '</h3>' +
        '<p class="notice error">This source is temporarily unavailable.</p>';
    listRoot.appendChild(block);
}

function getFeed(url, name) {
    feednami.load(url, function (result) {
        if (result.error || !result.feed || !result.feed.entries) {
            failed += 1;
            renderError(name);
            updateStatus();
            return;
        }

        loaded += 1;

        const sourceBlock = document.createElement('li');
        sourceBlock.className = 'source-block';

        const heading = document.createElement('h3');
        heading.className = 'source-title';
        heading.textContent = name;
        sourceBlock.appendChild(heading);

        const articleList = document.createElement('ul');
        articleList.className = 'news-list';

        const entries = result.feed.entries.slice(0, 7);
        entries.forEach(function (entry, index) {
            const item = document.createElement('li');
            item.className = 'news-item';
            item.style.animationDelay = (index * 60) + 'ms';

            const headline = document.createElement('a');
            headline.href = entry.link;
            headline.target = '_blank';
            headline.rel = 'noopener noreferrer';
            headline.textContent = entry.title || 'Untitled story';

            const summary = document.createElement('p');
            summary.className = 'summary';
            summary.textContent = stripHtml(entry.summary);

            const meta = document.createElement('p');
            meta.className = 'meta';
            const published = entry.pubDate ? new Date(entry.pubDate) : null;
            meta.textContent = published && !Number.isNaN(published.getTime())
                ? published.toLocaleString()
                : 'Recent update';

            item.appendChild(headline);
            item.appendChild(summary);
            item.appendChild(meta);
            articleList.appendChild(item);
        });

        if (entries.length === 0) {
            const empty = document.createElement('p');
            empty.className = 'notice';
            empty.textContent = 'No stories available for this source right now.';
            sourceBlock.appendChild(empty);
        } else {
            sourceBlock.appendChild(articleList);
        }

        listRoot.appendChild(sourceBlock);
        updateStatus();
    });
}

updateStatus();


