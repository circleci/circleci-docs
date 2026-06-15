const { parse: parseHTML } = require('node-html-parser');
const fs = require('fs');
const fsPromises = fs.promises;
const path = require('path');
const { algoliasearch } = require('algoliasearch');

/**
 * An Antora extension that exports page content to JSON and indexes it in Algolia.
 * One record per section (h2/h3/h4 heading), with the section heading stored as a
 * dedicated field and the section anchor included in the record URL.
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
 * Collect all sections across all pages, one entry per h2/h3/h4 section.
 */
function collectPages(contentCatalog, siteUrl) {
  const all = [];

  const excludedServerAdminVersions = [
    'server-4.2',
    'server-4.3',
    'server-4.4',
    'server-4.5',
    'server-4.6',
    'server-4.7',
    'server-4.8',
    'server-4.9',
  ];

  contentCatalog.getComponents().forEach(({ name: comp, versions }) => {
    versions.forEach(({ version }) => {
      if (comp === 'server-admin' && excludedServerAdminVersions.includes(version)) {
        console.log(`Skipping Algolia indexing for server-admin version: ${version}`);
        return;
      }

      const compVer = contentCatalog.getComponentVersion(comp, version);
      const navMap = getNavEntriesByUrl(compVer.navigation);
      contentCatalog
        .findBy({ component: comp, version, family: 'page' })
        .filter(page => page.pub)
        .forEach(page => {
          const relUrl = page.pub.url;
          const pathSegments = [compVer.title];
          const nav = navMap[relUrl]?.path.map(item => item.content);
          if (nav) pathSegments.push(...nav);

          const sections = extractSections(page.contents.toString(), page.title || '', relUrl);
          sections.forEach(section => {
            all.push({
              component: comp,
              componentTitle: compVer.title,
              version,
              relUrl: section.relUrl,
              url: siteUrl + section.relUrl,
              title: page.title || '',
              heading: section.heading,
              content: section.content,
              path: pathSegments,
            });
          });
        });
    });
  });
  console.log(`Collected ${all.length} sections across all pages`);
  return all;
}

/**
 * Split a page's HTML into sections at h2/h3/h4 boundaries.
 * Returns one record per section with heading text, body content, and anchor URL.
 * AsciiDoc with idprefix="" and idseparator="-" generates IDs like "pipeline-states".
 */
function extractSections(html, pageTitle, pageRelUrl) {
  const parts = html.split(/(?=<h[2-4][\s>])/i);
  const sections = [];

  parts.forEach((part, index) => {
    if (!part.trim()) return;

    const parsed = parseHTML(`<div>${part}</div>`);
    const headingEl = parsed.querySelector('h2, h3, h4');
    headingEl?.querySelector('.subsection-badge')?.remove();

    const heading = headingEl
      ? headingEl.textContent.trim()
      : (index === 0 ? pageTitle : '');

    const anchor = headingEl?.getAttribute('id') || '';
    const relUrl = anchor ? `${pageRelUrl}#${anchor}` : pageRelUrl;
    // Remove the heading node first — textContent inserts no separator where a
    // tag is stripped, so heading text would otherwise fuse to the first body word.
    headingEl?.remove();
    const body = parsed.textContent.trim();
    const content = `${heading} ${body}`.trim().replace(/\s+/g, ' ');

    if (!content) return;
    sections.push({ heading, content, relUrl });
  });

  // Fallback for pages with no h2/h3/h4 structure
  if (sections.length === 0) {
    const content = parseHTML(`<article>${html}</article>`)
      .textContent.trim()
      .replace(/\s+/g, ' ');
    sections.push({ heading: pageTitle, content, relUrl: pageRelUrl });
  }

  return sections;
}

/**
 * Recursively map navigation entries by URL.
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
 * Index section records to Algolia. One record per section, no chunking.
 * Oversized sections (large code blocks) are truncated rather than split.
 */
async function indexToAlgolia(pages) {
  const appId = process.env.ALGOLIA_APP_ID;
  const apiKey = process.env.ALGOLIA_ADMIN_KEY;
  const indexName = process.env.ALGOLIA_INDEX_NAME;
  if (!appId || !apiKey || !indexName) throw new Error('Missing Algolia credentials');

  const client = algoliasearch(appId, apiKey);
  const records = [];

  pages.forEach((p) => {
    const objectID = p.relUrl.replace(/^\/+/, '').replace(/[^a-zA-Z0-9-]/g, '_');

    const record = {
      url: p.url,
      relUrl: p.relUrl,
      title: p.title,
      heading: p.heading,
      path: p.path,
      component: `${p.componentTitle}:${p.version}`,
      version: p.version,
      objectID,
    };

    const metadataSize = Buffer.byteLength(JSON.stringify(record), 'utf8');
    const maxContentSize = 9500 - metadataSize;

    let content = p.content;
    if (Buffer.byteLength(content, 'utf8') > maxContentSize) {
      content = content.slice(0, Math.floor(maxContentSize * 0.9));
    }

    record.content = content;
    records.push(record);
  });

  console.log(`Prepared ${records.length} section records for indexing`);

  try {
    const settingsResponse = await client.setSettings({
      indexName,
      indexSettings: {
        attributesForFaceting: ['component', 'searchable(component)', 'version', 'searchable(version)'],
        searchableAttributes: ['title', 'heading', 'content', 'path'],
        paginationLimitedTo: 1000,
      },
    });

    console.log(`Applied index settings, task ID: ${settingsResponse.taskID}`);
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

async function waitForTask(client, indexName, taskID, timeout = 60000, pollInterval = 1000) {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const taskResponse = await client.getTask({ indexName, taskID });
    if (taskResponse.status === 'published') {
      return taskResponse;
    }
    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }

  throw new Error(`Task ${taskID} timed out after ${timeout}ms`);
}
