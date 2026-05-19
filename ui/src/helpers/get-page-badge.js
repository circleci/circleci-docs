'use strict'

// Cache for URL-to-page mapping to avoid repeated searches
let urlCache = null

/**
 * Retrieves page badge information for a given navigation item URL
 *
 * @param {string} url - The navigation item URL
 * @param {Object} options - Handlebars options object
 * @returns {Object|null} Badge data object or null if no badge
 */
module.exports = (url, options) => {
  if (!url || !options || !options.data || !options.data.root) {
    return null
  }

  const { contentCatalog } = options.data.root

  if (!contentCatalog) {
    return null
  }

  try {
    // Build URL cache on first use
    if (!urlCache) {
      urlCache = new Map()
      const pages = contentCatalog.getPages()
      pages.forEach((page) => {
        if (page.pub && page.pub.url) {
          urlCache.set(page.pub.url, page)
        }
      })
    }

    // Get page from cache by URL
    const page = urlCache.get(url)

    if (!page || !page.asciidoc || !page.asciidoc.attributes) {
      return null
    }

    const attrs = page.asciidoc.attributes
    const badgeText = attrs['page-badge']

    if (!badgeText) {
      return null
    }

    // Build badge data object matching article.hbs pattern
    const badgeData = {
      text: badgeText,
      classes: attrs['page-badge-classes'] || 'text-terminal-black border',
    }

    // Build inline style if hex colors provided
    let styleArr = ['font-family: \'Roboto\', sans-serif', 'font-weight: 700']

    if (attrs['page-badge-bg']) {
      styleArr.push(`background-color: ${attrs['page-badge-bg']}`)
    }

    if (attrs['page-badge-border']) {
      styleArr.push(`border: 1px solid ${attrs['page-badge-border']}`)
    }

    badgeData.style = styleArr.join('; ')

    return badgeData
  } catch (err) {
    // Silently fail for URLs that don't correspond to pages
    // (e.g., external links, category headers without pages)
    return null
  }
}
