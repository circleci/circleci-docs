const fs = require('fs');
const fsPromises = fs.promises;
const path = require('path');

/**
 * An Antora extension that auto-generates llms.txt from the documentation structure.
 * Only generates in CI on main branch to avoid local build artifacts.
 * The build task will copy it to the build directory.
 */
module.exports.register = function () {
  this.once('navigationBuilt', async ({ playbook, contentCatalog }) => {
    try {
      // Only generate llms.txt in CI on main branch
      const isCI = process.env.CI === 'true';
      const isMainBranch = process.env.CIRCLE_BRANCH === 'main';

      if (!isCI || !isMainBranch) {
        console.log(`Skipping llms.txt generation (CI: ${isCI}, Branch: ${process.env.CIRCLE_BRANCH || 'unknown'})`);
        return;
      }

      console.log('Generating llms.txt for main branch deployment...');
      const llmsTxt = await generateLlmsTxt(playbook, contentCatalog);

      // Write to repository root (visible on GitHub)
      const rootPath = path.join(__dirname, '..', 'llms.txt');
      await fsPromises.writeFile(rootPath, llmsTxt, 'utf8');
      console.log(`Generated llms.txt at ${rootPath}`);

      // Write metadata for gulp task to copy
      const metaPath = path.join(__dirname, '.temp', 'llms-meta.json');
      await fsPromises.mkdir(path.dirname(metaPath), { recursive: true });
      await fsPromises.writeFile(metaPath, JSON.stringify({
        sourceFile: rootPath,
        outputDir: playbook.output.dir,
        generated: new Date().toISOString()
      }), 'utf8');
    } catch (err) {
      // Never break the build - log error and continue
      console.error('Error generating llms.txt:', err);
      console.error('Build will continue without llms.txt generation');
    }
  });
};

/**
 * Generate the complete llms.txt content
 */
async function generateLlmsTxt(playbook, contentCatalog) {
  const sections = [];

  // Header
  sections.push('# CircleCI Documentation\n');
  sections.push('> Official technical documentation for CircleCI, a continuous integration and delivery platform\n');
  sections.push(`> Generated: ${new Date().toISOString()}\n`);

  // Site Information
  sections.push('## Site Information\n');
  sections.push(`- URL: ${playbook.site.url}`);
  sections.push('- Repository: https://github.com/circleci/circleci-docs');
  sections.push('- Generator: Antora (static site generator for technical documentation)');
  sections.push('- Markup: AsciiDoc\n');

  // Markdown Exports
  sections.push('## Markdown Exports\n');
  sections.push('All documentation pages are available in markdown format for easier parsing and processing.\n');
  sections.push('### How to Access Markdown Versions\n');
  sections.push('1. **Direct URL conversion**: Replace the HTML page URL with `/index.md`');
  sections.push('   - HTML: https://circleci.com/docs/guides/getting-started/first-steps/');
  sections.push('   - Markdown: https://circleci.com/docs/guides/getting-started/first-steps/index.md\n');
  sections.push('2. **Inline links in this file**: Each page listing below includes a [md] link');
  sections.push('   - Example: Page Title (https://circleci.com/docs/page/) [md](https://circleci.com/docs/page/index.md)\n');
  sections.push('3. **HTML metadata**: Each page includes `<link rel="alternate" type="text/markdown" href="index.md">` in the HTML head\n');
  sections.push('### About This File (llms.txt)\n');
  sections.push('- **Location**: https://circleci.com/docs/llms.txt');
  sections.push('- **Purpose**: Provides LLMs with complete site structure, navigation, and page descriptions');
  sections.push('- **Updates**: Automatically regenerated on each deployment to main branch');
  sections.push('- **Discovery**: Announced via `<link rel="alternate" type="text/plain" href="/docs/llms.txt">` in page headers');
  sections.push('- **Format**: Plain text with markdown-style formatting for readability\n');

  // Documentation Structure
  sections.push('## Documentation Structure\n');
  sections.push('This documentation is organized into the following Antora components:\n');

  const components = contentCatalog.getComponents();

  // Sort components by a logical order
  const componentOrder = ['root', 'guides', 'reference', 'orbs', 'server-admin', 'services', 'contributors'];
  const sortedComponents = components.sort((a, b) => {
    const indexA = componentOrder.indexOf(a.name);
    const indexB = componentOrder.indexOf(b.name);
    if (indexA === -1 && indexB === -1) return a.name.localeCompare(b.name);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  for (const component of sortedComponents) {
    // For server-admin, show all versions together
    if (component.name === 'server-admin') {
      const serverVersions = component.versions
        .map(v => v.version)
        .sort((a, b) => {
          // Extract version numbers for proper sorting
          const numA = parseFloat(a.replace('server-', ''));
          const numB = parseFloat(b.replace('server-', ''));
          return numB - numA; // Descending order (newest first)
        });

      sections.push(`### ${component.title || component.name}`);
      sections.push(`- Versions: ${serverVersions.join(', ')}`);

      // Use the latest version for start page
      const latestVersion = component.versions[0];
      const startPage = getStartPage(latestVersion, playbook.site.url);
      if (startPage) {
        sections.push(`- Start: ${startPage}`);
      }

      // Add navigation from the latest version
      const nav = formatNavigation(latestVersion.navigation, playbook.site.url, contentCatalog);
      if (nav) {
        sections.push(nav);
      }
      sections.push('');
      continue;
    }

    // For other components, show each version separately (if multiple versions exist)
    for (const version of component.versions) {
      const title = version.title || component.title || component.name;
      const versionLabel = version.version !== 'master' && version.version !== 'main'
        ? ` (${version.version})`
        : '';

      sections.push(`### ${title}${versionLabel}`);

      const startPage = getStartPage(version, playbook.site.url);
      if (startPage) {
        sections.push(`- Start: ${startPage}`);
      }

      const nav = formatNavigation(version.navigation, playbook.site.url, contentCatalog);
      if (nav) {
        sections.push(nav);
      }
      sections.push('');
    }
  }

  // Content Statistics
  sections.push('## Content Statistics\n');
  const stats = calculateStatistics(contentCatalog);
  sections.push(`- Total components: ${stats.componentCount}`);
  sections.push(`- Total pages: ${stats.totalPages}`);
  sections.push('\nPages by component:');
  for (const [comp, count] of Object.entries(stats.pagesByComponent).sort((a, b) => b[1] - a[1])) {
    sections.push(`  - ${comp}: ${count}`);
  }
  sections.push('');

  // Technical Stack
  sections.push('## Technical Stack\n');
  const techStack = await getTechnicalStack();
  for (const [name, version] of Object.entries(techStack)) {
    sections.push(`- ${name}: ${version}`);
  }
  sections.push('');

  // Common URL Patterns
  sections.push('## Common URL Patterns\n');
  sections.push(`- Guides: ${playbook.site.url}/guides/<topic>/`);
  sections.push(`- Reference: ${playbook.site.url}/reference/<topic>/`);
  sections.push(`- Orbs: ${playbook.site.url}/orbs/<topic>/`);
  sections.push(`- Server Admin: ${playbook.site.url}/server-admin-<version>/<topic>/`);
  sections.push(`- API: ${playbook.site.url}/api/<version>/`);
  sections.push('');

  // Server Versions
  const serverVersions = extractServerVersions(playbook);
  if (Object.keys(serverVersions).length > 0) {
    sections.push('## Server Versions\n');
    for (const [version, number] of Object.entries(serverVersions).sort((a, b) => b[0].localeCompare(a[0]))) {
      sections.push(`- ${version}: ${number}`);
    }
    sections.push('');
  }

  return sections.join('\n');
}

/**
 * Get the start page URL for a component version
 */
function getStartPage(version, siteUrl) {
  if (!version.startPage) return null;
  return siteUrl + version.startPage;
}

/**
 * Format navigation structure with proper indentation and markdown links
 */
function formatNavigation(navigation, siteUrl, contentCatalog, indent = 0) {
  if (!navigation || navigation.length === 0) return '';

  const lines = [];
  const prefix = '  '.repeat(indent);

  for (const item of navigation) {
    if (item.content) {
      // This is a navigation item with content
      const bullet = indent === 0 ? '-' : '-';
      const url = item.urlType === 'internal' ? siteUrl + item.url : item.url;

      // Add URL and markdown link if available
      let urlPart = '';
      if (item.url) {
        urlPart = ` (${url})`;

        // Add markdown link for internal URLs
        if (item.urlType === 'internal') {
          const markdownUrl = getMarkdownUrl(item.url, siteUrl);
          urlPart += ` [md](${markdownUrl})`;
        }
      }

      // Add page description if available
      let descriptionPart = '';
      if (item.urlType === 'internal' && item.url) {
        const page = findPageByUrl(contentCatalog, item.url);
        if (page && page.asciidoc && page.asciidoc.attributes && page.asciidoc.attributes['page-description']) {
          const description = page.asciidoc.attributes['page-description'];
          descriptionPart = `\n${prefix}  ${description}`;
        }
      }

      lines.push(`${prefix}${bullet} ${item.content}${urlPart}${descriptionPart}`);

      // Recursively format child items
      if (item.items && item.items.length > 0) {
        const childNav = formatNavigation(item.items, siteUrl, contentCatalog, indent + 1);
        if (childNav) {
          lines.push(childNav);
        }
      }
    } else if (item.items && item.items.length > 0) {
      // Group without content - just process children
      const childNav = formatNavigation(item.items, siteUrl, contentCatalog, indent);
      if (childNav) {
        lines.push(childNav);
      }
    }
  }

  return lines.join('\n');
}

/**
 * Find a page in the content catalog by its URL
 */
function findPageByUrl(contentCatalog, url) {
  // Antora URLs are like /component/module/page.html or /component/module/path/
  // We need to find the corresponding page in the catalog
  const pages = contentCatalog.getPages();

  for (const page of pages) {
    if (page.pub && page.pub.url === url) {
      return page;
    }
  }

  return null;
}

/**
 * Convert HTML URL to markdown URL following the pattern from markdown-export-extension
 */
function getMarkdownUrl(pageUrl, siteUrl) {
  if (pageUrl.endsWith('/')) {
    // Directory-style URL -> add index.md
    return siteUrl + pageUrl + 'index.md';
  } else if (pageUrl.endsWith('.html')) {
    // HTML file -> replace .html with .md
    return siteUrl + pageUrl.replace(/\.html$/, '.md');
  } else {
    // Other URLs -> add .md extension
    return siteUrl + pageUrl + '.md';
  }
}

/**
 * Calculate content statistics
 */
function calculateStatistics(contentCatalog) {
  const components = contentCatalog.getComponents();
  const pagesByComponent = {};
  let totalPages = 0;

  for (const component of components) {
    for (const version of component.versions) {
      const pages = contentCatalog.findBy({
        component: component.name,
        version: version.version,
        family: 'page'
      }).filter(page => page.pub);

      const key = component.name === 'server-admin'
        ? `${component.name} (${version.version})`
        : (component.title || component.name);

      pagesByComponent[key] = (pagesByComponent[key] || 0) + pages.length;
      totalPages += pages.length;
    }
  }

  return {
    componentCount: components.length,
    totalPages,
    pagesByComponent
  };
}

/**
 * Extract technical stack versions from package.json
 */
async function getTechnicalStack() {
  try {
    const packagePath = path.join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(await fsPromises.readFile(packagePath, 'utf8'));

    const stack = {
      'Static Site Generator': `Antora ${packageJson.devDependencies['@antora/cli']?.replace('^', '') || 'unknown'}`,
      'Markup Language': 'AsciiDoc',
      'API Docs': `Redocly CLI ${packageJson.devDependencies['@redocly/cli']?.replace('^', '') || 'unknown'}`,
      'Search': 'Algolia',
      'Build Tool': 'npm scripts with Gulp',
    };

    return stack;
  } catch (err) {
    console.error('Error reading package.json:', err);
    return {
      'Static Site Generator': 'Antora',
      'Markup Language': 'AsciiDoc',
    };
  }
}

/**
 * Extract server version numbers from playbook attributes
 */
function extractServerVersions(playbook) {
  const versions = {};
  const attrs = playbook.asciidoc?.attributes || {};

  for (const [key, value] of Object.entries(attrs)) {
    if (key.startsWith('serverversion')) {
      // Convert serverversion49 -> Server 4.9
      const versionNum = key.replace('serverversion', '');
      const major = versionNum.charAt(0);
      const minor = versionNum.substring(1) || '0';
      versions[`Server ${major}.${minor}`] = value;
    }
  }

  return versions;
}

