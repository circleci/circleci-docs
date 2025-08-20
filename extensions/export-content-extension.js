const { parse: parseHTML } = require('node-html-parser');
const fs = require('fs');
const fsPromises = fs.promises;
const path = require('path');
const { algoliasearch } = require('algoliasearch');

/**
 * An Antora extension that exports page content to JSON and indexes it in Algolia v5 with chunking support.
 */
module.exports.register = function () {
  this.once('navigationBuilt', async ({ playbook, contentCatalog }) => {
    const siteUrl = playbook.site.url.replace(/\/+$/, '');
    const pages = collectPages(contentCatalog, siteUrl);
    const tempDir = path.join(__dirname, '.temp');
    await fsPromises.mkdir(tempDir, { recursive: true });
    const outPath = path.join(tempDir, 'site-content.json');
    await fsPromises.writeFile(outPath, JSON.stringify({ pages }, null, 2));
    console.log(`Wrote JSON to ${outPath}`);

    if (shouldSkipIndexing()) {
        console.log('Skipping Algolia indexing (requested by configuration)');
        return;
    }

    if (!hasIndexed(tempDir) && hasAlgoliaCredentials()) {
      try {
        await indexToAlgolia(pages);
        await fsPromises.writeFile(path.join(tempDir, 'algolia-indexed.marker'), new Date().toISOString());
        console.log('Algolia indexing completed and marker file created');
      } catch (err) {
        console.error('Error indexing to Algolia:', err);
      }
    } else {
      console.log('Skipping Algolia indexing (missing credentials or already indexed)');
    }
  });
};

/**
 * Collect pages from contentCatalog and extract text, including component, version, and relative URL
 */
function collectPages(contentCatalog, siteUrl) {
  const all = [];

  // Define which server-admin versions to exclude from indexing
  const excludedServerAdminVersions = [
    'server-4.2',
    'server-4.3',
    'server-4.4',
    'server-4.5',
    'server-4.6',
    'server-4.7'
  ];

  contentCatalog.getComponents().forEach(({ name: comp, versions }) => {
    versions.forEach(({ version }) => {
      // Skip indexing for excluded server-admin versions
      if (comp === 'server-admin' && excludedServerAdminVersions.includes(version)) {
        console.log(`Skipping Algolia indexing for server-admin version: ${version}`);
        return; // Skip this entire component version
      }

      const compVer = contentCatalog.getComponentVersion(comp, version);
      const navMap = getNavEntriesByUrl(compVer.navigation);
      contentCatalog
        .findBy({ component: comp, version, family: 'page' })
        .filter(page => page.pub)
        .forEach(page => {
          const relUrl = page.pub.url; // e.g. '/path/to/page.html'
          const html = `<article>${page.contents}</article>`;
          const text = parseHTML(html)
            .textContent.trim()
            .replace(/\n(\s*\n)+/g, '\n\n')
            .replace(/\.\n(?!\n)/g, '. ');
          const pathSegments = [compVer.title];
          const nav = navMap[relUrl]?.path.map(item => item.content);
          if (nav) pathSegments.push(...nav);
          all.push({
            component: comp,
            componentTitle: compVer.title,
            version,
            relUrl,
            url: siteUrl + relUrl,
            title: page.title,
            text,
            path: pathSegments,
          });
        });
    });
  });
  console.log(`Collected ${all.length} pages`);
  return all;
}

/**
 * Recursively map navigation entries by URL
 */
function getNavEntriesByUrl(items = [], accum = {}, trail = []) {
  items.forEach(item => {
    if (item.urlType === 'internal') {
      accum[item.url.split('#')[0]] = { path: [...trail, item] };
    }
    getNavEntriesByUrl(item.items, accum, item.content ? [...trail, item] : trail);
  });
  return accum;
}

function shouldSkipIndexing() {
  if (process.env.CI === 'true') {
      return process.env.CIRCLE_BRANCH !== 'main';
  }

  const val = (process.env.SKIP_INDEX_SEARCH || '').toLowerCase();
  return ['1', 'true'].includes(val);
}

function hasIndexed(dir) {
  return fs.existsSync(path.join(dir, 'algolia-indexed.marker'));
}

function hasAlgoliaCredentials() {
  const appId = process.env.ALGOLIA_APP_ID;
  const apiKey = process.env.ALGOLIA_ADMIN_KEY;
  const indexName = process.env.ALGOLIA_INDEX_NAME;
  return !!(appId && apiKey && indexName);
}

/**
 * Chunk pages into smaller records to meet Algolia's 10KB limit.
 */
function chunkText(text, maxBytes = 8500) {  // Reduced from 10000 to have margin for metadata
  const chunks = [];
  let current = '';

  text.split(/\n\n/).forEach(paragraph => {
    const para = paragraph + '\n\n';
    const combined = current + para;
    const size = Buffer.byteLength(combined, 'utf8');

    if (size > maxBytes) {
      if (current) chunks.push(current.trim());

      if (Buffer.byteLength(para, 'utf8') > maxBytes) {
        // Paragraph too big: split by sentences
        let sentenceBuf = '';
        paragraph.split(/(?<=\.)\s/).forEach(sentence => {
          const combinedSentence = sentenceBuf + sentence + ' ';
          const sentSize = Buffer.byteLength(combinedSentence, 'utf8');

          if (sentSize > maxBytes) {
            if (sentenceBuf) chunks.push(sentenceBuf.trim());

            if (Buffer.byteLength(sentence, 'utf8') > maxBytes) {
              // Sentence too big: split by characters
              let charBuf = '';
              for (const char of sentence) {
                charBuf += char;
                if (Buffer.byteLength(charBuf, 'utf8') >= maxBytes) {
                  chunks.push(charBuf.trim());
                  charBuf = '';
                }
              }
              if (charBuf) chunks.push(charBuf.trim());
            } else {
              sentenceBuf = sentence + ' ';
            }
          } else {
            sentenceBuf = combinedSentence;
          }
        });

        if (sentenceBuf) chunks.push(sentenceBuf.trim());
        current = '';
      } else {
        current = para;
      }
    } else {
      current = combined;
    }
  });

  if (current) chunks.push(current.trim());
  return chunks;
}

/**
 * Index to Algolia v5 using chunked records with component:version:pagePath-based objectIDs
 */
async function indexToAlgolia(pages) {
  const appId = process.env.ALGOLIA_APP_ID;
  const apiKey = process.env.ALGOLIA_ADMIN_KEY;
  const indexName = process.env.ALGOLIA_INDEX_NAME;
  if (!appId || !apiKey || !indexName) throw new Error('Missing Algolia credentials');

  const client = algoliasearch(appId, apiKey);
  const records = [];

  pages.forEach((p) => {
    const pathId = p.relUrl.replace(/^\/+/, '').replace(/[\/]/g, '_');
    const baseId = `${p.component}:${p.version}:${pathId}`;
    const chunks = chunkText(p.text);

    chunks.forEach((chunk, i) => {
      // Create the record with all fields except content
      const record = {
        url: p.url,
        relUrl: p.relUrl,
        title: p.title,
        path: p.path,
        component: `${p.componentTitle}:${p.version}`,
        version: p.version,
        objectID: `${baseId}:${i}`,
      };

      // Calculate metadata size
      const metadataSize = Buffer.byteLength(JSON.stringify(record), 'utf8');
      // Maximum allowed content size
      const maxContentSize = 9500 - metadataSize;

      // Trim content if necessary to ensure total record size is under limit
      let content = chunk;
      if (Buffer.byteLength(content, 'utf8') > maxContentSize) {
        content = content.slice(0, Math.floor(maxContentSize * 0.9));
      }

      record.content = content;
      records.push(record);
    });
  });

  console.log(`Prepared ${records.length} chunked records for indexing`);


  // Configure index settings with path faceting
  try {
    const settingsResponse = await client.setSettings({
      indexName,
      indexSettings: {
        // Enable faceting on path for hierarchical navigation
        attributesForFaceting: ['path', 'searchable(path)', 'component', 'searchable(component)', 'version', 'searchable(version)'],
        // Optional: Adjust search settings for better relevance
        searchableAttributes: ['title', 'content', 'path'],
        // Set a reasonable pagination limit
        paginationLimitedTo: 1000,
      },
    });

    console.log(`Applied index settings, task ID: ${settingsResponse.taskID}`);

    // Wait for task completion
    await waitForTask(client, indexName, settingsResponse.taskID);
    console.log('Index settings update completed successfully');

  } catch (err) {
    console.error('Error configuring index settings:', err);
  }

  const response = await client.replaceAllObjects({
    indexName: indexName,
    objects: records,
  });
  console.log(`Indexed ${response[0]?.objectIDs.length} records to ${indexName}`);

  return response;
}

/**
 * Wait for an Algolia task to complete
 * @param {Object} client - Algolia client
 * @param {String} indexName - Index name
 * @param {Number} taskID - Task ID to check
 * @param {Number} timeout - Maximum time to wait in ms (default: 60000)
 * @param {Number} pollInterval - How often to check status in ms (default: 1000)
 */
async function waitForTask(client, indexName, taskID, timeout = 60000, pollInterval = 1000) {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const taskResponse = await client.getTask({ indexName, taskID });

    if (taskResponse.status === 'published') {
      return taskResponse;
    }

    // Wait before checking again
    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }

  throw new Error(`Task ${taskID} timed out after ${timeout}ms`);
}
