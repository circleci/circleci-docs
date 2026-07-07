'use strict'

const File = require('vinyl')

/**
 * An Antora extension that auto-generates llms.txt from the documentation structure.
 *
 * Hooks into `beforePublish` to add llms.txt directly to the siteCatalog as a
 * Vinyl file — no intermediate filesystem writes or post-build copy steps needed.
 * Also creates a sitemap-llms.xml and registers it in the main sitemapindex so
 * that crawlers and LLMs can discover the file.
 *
 * Set SKIP_LLMS_TXT=true to disable generation (e.g. for faster local builds).
 */
module.exports.register = function () {
  const logger = this.getLogger('llms-txt-generator')

  this.once('beforePublish', ({ playbook, contentCatalog, siteCatalog }) => {
    if (process.env.SKIP_LLMS_TXT === 'true') {
      logger.info('Skipping llms.txt generation (SKIP_LLMS_TXT=true)')
      return
    }

    try {
      logger.info('Generating llms.txt...')
      const llmsTxt = generateLlmsTxt(playbook, contentCatalog)

      siteCatalog.addFile(new File({
        contents: Buffer.from(llmsTxt),
        mediaType: 'text/plain',
        out: { path: 'llms.txt' },
        path: 'llms.txt',
        pub: { url: '/llms.txt', rootPath: '' },
        src: { stem: 'llms' },
      }))

      addToSitemap(siteCatalog, playbook)

      logger.info('Successfully generated llms.txt')
    } catch (err) {
      // Never break the build — log and continue
      logger.error(`Error generating llms.txt: ${err.message}`)
    }
  })
}

/**
 * Create sitemap-llms.xml and register it in the main sitemapindex.
 */
function addToSitemap (siteCatalog, playbook) {
  const siteUrl = playbook.site.url.replace(/\/?$/, '/')
  const now = new Date().toISOString()

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}llms.txt</loc>
    <lastmod>${now}</lastmod>
  </url>
</urlset>
`

  siteCatalog.addFile(new File({
    contents: Buffer.from(sitemapXml),
    mediaType: 'text/xml',
    out: { path: 'sitemap-llms.xml' },
    path: 'sitemap-llms.xml',
    pub: { url: '/sitemap-llms.xml', rootPath: '' },
    src: { stem: 'sitemap-llms' },
  }))

  // Insert the new sub-sitemap into the main sitemapindex
  const mainSiteMap = siteCatalog.getFiles().find(f => f?.out?.path === 'sitemap.xml')
  if (mainSiteMap) {
    let xml = mainSiteMap.contents.toString()
    xml = xml.replace(
      /<\/sitemapindex>/,
      `  <sitemap>\n    <loc>${siteUrl}sitemap-llms.xml</loc>\n  </sitemap>\n</sitemapindex>`
    )
    mainSiteMap.contents = Buffer.from(xml)
  }
}

/**
 * Generate the complete llms.txt content.
 */
function generateLlmsTxt (playbook, contentCatalog) {
  const siteUrl = playbook.site.url
  const sections = []

  // Header
  sections.push('# CircleCI Documentation\n')
  sections.push('> Official technical documentation for CircleCI, a continuous integration and delivery platform\n')
  sections.push(`> Generated: ${new Date().toISOString()}\n`)

  // Site Information
  sections.push('## Site Information\n')
  sections.push(`- URL: ${siteUrl}`)
  sections.push('- Repository: https://github.com/circleci/circleci-docs\n')

  // Markdown Exports
  sections.push('## Markdown Exports\n')
  sections.push('All documentation pages are available in markdown format for easier parsing and processing.\n')
  sections.push('### How to Access Markdown Versions\n')
  sections.push('1. **Direct URL conversion**: Replace the HTML page URL with `/index.md`')
  sections.push('   - HTML: https://circleci.com/docs/guides/getting-started/first-steps/')
  sections.push('   - Markdown: https://circleci.com/docs/guides/getting-started/first-steps/index.md\n')
  sections.push('2. **Inline links in this file**: Each page listing below includes a [md] link')
  sections.push('   - Example: Page Title (https://circleci.com/docs/page/) [md](https://circleci.com/docs/page/index.md)\n')
  sections.push('3. **HTML metadata**: Each page includes `<link rel="alternate" type="text/markdown" href="index.md">` in the HTML head\n')
  sections.push('### About This File (llms.txt)\n')
  sections.push('- **Location**: https://circleci.com/docs/llms.txt')
  sections.push('- **Purpose**: Provides LLMs with complete site structure, navigation, and page descriptions')
  sections.push('- **Updates**: Automatically regenerated on each deployment')
  sections.push('- **Discovery**: Announced via `<link rel="alternate" type="text/plain" href="/docs/llms.txt">` in page headers')
  sections.push('- **Sitemap**: Listed in https://circleci.com/docs/sitemap-llms.xml\n')

  // Documentation Structure
  sections.push('## Documentation Structure\n')
  sections.push('This documentation is organized into the following Antora components:\n')

  const components = contentCatalog.getComponents()

  const componentOrder = ['root', 'guides', 'reference', 'orbs', 'server-admin']
  const excludedComponents = ['services', 'contributors']
  const sortedComponents = [...components]
    .filter(c => !excludedComponents.includes(c.name))
    .sort((a, b) => {
      const indexA = componentOrder.indexOf(a.name)
      const indexB = componentOrder.indexOf(b.name)
      if (indexA === -1 && indexB === -1) return a.name.localeCompare(b.name)
      if (indexA === -1) return 1
      if (indexB === -1) return -1
      return indexA - indexB
    })

  for (const component of sortedComponents) {
    if (component.name === 'server-admin') {
      const serverVersions = component.versions
        .map(v => v.version)
        .sort((a, b) => {
          const numA = parseFloat(a.replace('server-', ''))
          const numB = parseFloat(b.replace('server-', ''))
          return numB - numA
        })

      sections.push(`### ${component.title || component.name}`)
      sections.push(`- Versions: ${serverVersions.join(', ')}`)

      // Show navigation from the latest version only
      const latestVersion = component.versions[0]
      const startPage = getStartPage(latestVersion, siteUrl)
      if (startPage) sections.push(`- Start: ${startPage}`)

      const nav = formatNavigation(latestVersion.navigation, siteUrl, contentCatalog)
      if (nav) sections.push(nav)
      sections.push('')
      continue
    }

    for (const version of component.versions) {
      const title = version.title || component.title || component.name
      const versionLabel = version.version !== 'master' && version.version !== 'main'
        ? ` (${version.version})`
        : ''

      sections.push(`### ${title}${versionLabel}`)

      const startPage = getStartPage(version, siteUrl)
      if (startPage) sections.push(`- Start: ${startPage}`)

      const nav = formatNavigation(version.navigation, siteUrl, contentCatalog)
      if (nav) sections.push(nav)
      sections.push('')
    }
  }

  // Platform Badges
  sections.push('## Platform Badges\n')
  sections.push('Documentation pages include platform badges that indicate feature availability:\n')
  sections.push('- **Cloud**: The features and processes described on the page are available for CircleCI Cloud')
  sections.push('- **Server Admin**: This guide is for CircleCI Server administrators')
  sections.push('- **Server v4+**: The features and processes described on the page are available for CircleCI Server v4.x+')
  sections.push('- **Server v4.x** (specific versions like v4.2, v4.3): This guide is for that specific CircleCI Server version')
  sections.push('- **Server v3.x** (specific versions): This guide is for that specific CircleCI Server version')
  sections.push('\nPages may show multiple badges if a feature is available on multiple platforms.')
  sections.push('If no badge is shown, assume the feature is available on all platforms.\n')

  // Common URL Patterns
  sections.push('## Common URL Patterns\n')
  sections.push(`- Guides: ${siteUrl}/guides/<topic>/`)
  sections.push(`- Reference: ${siteUrl}/reference/<topic>/`)
  sections.push(`- Orbs: ${siteUrl}/orbs/<topic>/`)
  sections.push(`- Server Admin: ${siteUrl}/server-admin-<version>/<topic>/`)
  sections.push(`- API: ${siteUrl}/api/<version>/`)
  sections.push('')

  // API Documentation
  sections.push('## API Documentation\n')
  sections.push('CircleCI API v2 documentation is available in LLM-friendly format:\n')
  sections.push(`- **API Index for LLMs**: ${siteUrl}/api/v2/llms.txt`)
  sections.push(`  - Structured index of all API endpoints`)
  sections.push(`  - Tag-grouped operations with descriptions`)
  sections.push(`  - Authentication and rate limiting information`)
  sections.push(`- **Per-Endpoint Markdown**: ${siteUrl}/api/v2/operations/{operationId}.md`)
  sections.push(`  - Individual markdown files for each API endpoint`)
  sections.push(`  - Complete schemas, parameters, and examples`)
  sections.push(`  - Example: ${siteUrl}/api/v2/operations/createContext.md`)
  sections.push(`- **Machine-Readable Index**: ${siteUrl}/api/v2/operations/index.json`)
  sections.push(`- **Full OpenAPI Spec**: ${siteUrl}/api/v2/openapi.json`)
  sections.push(`- **Human-Readable Docs**: ${siteUrl}/api/v2/`)
  sections.push('')

  // Server Versions
  const serverVersions = extractServerVersions(playbook)
  if (Object.keys(serverVersions).length > 0) {
    sections.push('## Server Versions\n')
    for (const [version, number] of Object.entries(serverVersions).sort((a, b) => b[0].localeCompare(a[0]))) {
      sections.push(`- ${version}: ${number}`)
    }
    sections.push('')
  }

  return sections.join('\n')
}

function getStartPage (version, siteUrl) {
  if (!version.startPage) return null
  return siteUrl + version.startPage
}

function formatNavigation (navigation, siteUrl, contentCatalog, indent = 0) {
  if (!navigation || navigation.length === 0) return ''

  const lines = []
  const prefix = '  '.repeat(indent)

  for (const item of navigation) {
    if (item.content) {
      let urlPart = ''
      if (item.url) {
        const url = item.urlType === 'internal' ? siteUrl + item.url : item.url
        urlPart = ` (${url})`

        if (item.urlType === 'internal') {
          urlPart += ` [md](${getMarkdownUrl(item.url, siteUrl)})`
        }
      }

      let descriptionPart = ''
      if (item.urlType === 'internal' && item.url) {
        const page = findPageByUrl(contentCatalog, item.url)
        if (page?.asciidoc?.attributes?.['page-description']) {
          descriptionPart = `\n${prefix}  ${page.asciidoc.attributes['page-description']}`
        }
      }

      lines.push(`${prefix}- ${item.content}${urlPart}${descriptionPart}`)

      if (item.items && item.items.length > 0) {
        const childNav = formatNavigation(item.items, siteUrl, contentCatalog, indent + 1)
        if (childNav) lines.push(childNav)
      }
    } else if (item.items && item.items.length > 0) {
      const childNav = formatNavigation(item.items, siteUrl, contentCatalog, indent)
      if (childNav) lines.push(childNav)
    }
  }

  return lines.join('\n')
}

function findPageByUrl (contentCatalog, url) {
  for (const page of contentCatalog.getPages()) {
    if (page.pub && page.pub.url === url) return page
  }
  return null
}

function getMarkdownUrl (pageUrl, siteUrl) {
  if (pageUrl.endsWith('/')) return siteUrl + pageUrl + 'index.md'
  if (pageUrl.endsWith('.html')) return siteUrl + pageUrl.replace(/\.html$/, '.md')
  return siteUrl + pageUrl + '.md'
}

function extractServerVersions (playbook) {
  const versions = {}
  const attrs = playbook.asciidoc?.attributes || {}

  for (const [key, value] of Object.entries(attrs)) {
    if (key.startsWith('serverversion')) {
      const versionNum = key.replace('serverversion', '')
      const major = versionNum.charAt(0)
      const minor = versionNum.substring(1) || '0'
      versions[`Server ${major}.${minor}`] = value
    }
  }

  return versions
}
