module.exports.register = function (context = {}) {
  const logger = this.getLogger('unlisted-pages-extension')

  // Configuration is passed directly as properties in the context when loaded from playbook
  const { addToNavigation, unlistedPagesHeading = 'Unlisted Pages', allowedUnlistedPages = [] } = context

  console.log('=== UNLISTED PAGES EXTENSION DEBUG ===')
  console.log('Allowed unlisted pages from context:', JSON.stringify(allowedUnlistedPages))
  console.log('=== END DEBUG ===')

  this
    .on('navigationBuilt', ({ contentCatalog, playbook }) => {
      // Try to get config from playbook if not in context
      let finalAllowedPages = allowedUnlistedPages

      console.log('=== NAVIGATION BUILT EVENT DEBUG ===')
      console.log('playbook exists:', !!playbook)
      console.log('playbook.antora exists:', !!playbook?.antora)
      console.log('playbook.antora.extensions exists:', !!playbook?.antora?.extensions)
      if (playbook?.antora?.extensions) {
        console.log('Extensions in playbook:', JSON.stringify(playbook.antora.extensions, null, 2))
      }
      console.log('=== END EVENT DEBUG ===')

      if (finalAllowedPages.length === 0 && playbook?.antora?.extensions) {
        const extensionConfig = playbook.antora.extensions.find(ext =>
          ext.require === './extensions/unlisted-pages-extension.js' ||
          ext.require?.includes('unlisted-pages-extension')
        )
        console.log('Found extension config:', JSON.stringify(extensionConfig))
        // Antora converts camelCase keys to lowercase, so check for 'allowedunlistedpages'
        if (extensionConfig?.allowedunlistedpages) {
          finalAllowedPages = extensionConfig.allowedunlistedpages
          console.log('Found config in playbook:', JSON.stringify(finalAllowedPages))
        }
      }
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
              if (finalAllowedPages.includes(pageIdentifier) || finalAllowedPages.includes(page.src.relative)) {
                console.log(`Skipping allowed unlisted page: ${pageIdentifier}`)
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