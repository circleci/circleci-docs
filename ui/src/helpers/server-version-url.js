'use strict'
// On a page in the Cloud guides, returns the URL of the same page in the guides
// Server build (guides-versions-extension.js), or nothing when the page has no
// Server version. The Cloud start page, which the top nav Guides tab links to,
// returns the Server start page instead.
module.exports = ({ data: { root } }) => {
  const page = root.page || {}
  if (!page.component || page.component.name !== 'guides') return
  if (page.componentVersion && page.componentVersion.version) return
  const server = (page.versions || []).find((pageVersion) => pageVersion.version === 'server')
  if (!server) return
  const isStartPage = page.componentVersion && page.url === page.componentVersion.url
  return !server.missing || isStartPage ? server.url : undefined
}
