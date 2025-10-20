module.exports.register = function ({ config }) {
  const { addToNavigation, unlistedPagesHeading = 'Unlisted Pages', allowedUnlistedPages = [] } = config || {}
  const logger = this.getLogger('unlisted-pages-extension')
  logger.info(`Allowed unlisted pages config: ${JSON.stringify(allowedUnlistedPages)}`)
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