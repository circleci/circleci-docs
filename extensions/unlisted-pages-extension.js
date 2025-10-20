module.exports.register = function (context = {}) {
  const logger = this.getLogger('unlisted-pages-extension')

  console.log('=== UNLISTED PAGES EXTENSION DEBUG ===')
  console.log('Context keys:', Object.keys(context))
  console.log('Full context:', JSON.stringify(context, null, 2))

  const { addToNavigation, unlistedPagesHeading = 'Unlisted Pages', allowedUnlistedPages = [] } = context.config || context
  console.log('Allowed unlisted pages:', JSON.stringify(allowedUnlistedPages))
  console.log('=== END DEBUG ===')

  this
    .on('navigationBuilt', ({ contentCatalog }) => {
      contentCatalog.getComponents().forEach(({ versions }) => {
        versions.forEach(({ name: component, version, navigation: nav, url: defaultUrl }) => {
          const navEntriesByUrl = getNavEntriesByUrl(nav)
          const unlistedPages = contentCatalog
            .findBy({ component, version, family: 'page' })
            .filter((page) => page.out)
            .reduce((collector, page) => {
              if ((page.pub.url in navEntriesByUrl) || page.pub.url === defaultUrl) return collector
              // Check if this page is in the allowed unlisted pages list
              const pageIdentifier = (page.src.module === 'ROOT' ? '' : page.src.module + ':') + page.src.relative
              if (allowedUnlistedPages.includes(pageIdentifier) || allowedUnlistedPages.includes(page.src.relative)) {
                logger.info(`Skipping allowed unlisted page: ${pageIdentifier}`)
                return collector
              }
              logger.error({ file: page.src, source: page.src.origin }, `detected unlisted page (identifier: ${pageIdentifier}, relative: ${page.src.relative})`)
              return collector.concat(page)
            }, [])
          if (unlistedPages.length && addToNavigation) {
            nav.push({
              content: unlistedPagesHeading,
              items: unlistedPages.map((page) => {
                const title = 'navtitle' in page.asciidoc
                  ? page.asciidoc.navtitle
                  : (page.src.module === 'ROOT' ? '' : page.src.module + ':') + page.src.relative
                return { content: title, url: page.pub.url, urlType: 'internal' }
              }),
              root: true,
            })
          }
        })
      })
    })
}

function getNavEntriesByUrl (items = [], accum = {}) {
  items.forEach((item) => {
    if (item.urlType === 'internal') accum[item.url.split('#')[0]] = item
    getNavEntriesByUrl(item.items, accum)
  })
  return accum
}