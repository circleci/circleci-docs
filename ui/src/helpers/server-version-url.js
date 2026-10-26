'use strict'
// Returns the URL of the Server version of the current Cloud guides page. A page
// with no Server version returns nothing, except the start page, which returns
// the Server start page.
module.exports = ({ data: { root } }) => {
  const page = root.page || {}
  if (!page.component || page.component.name !== 'guides') return
  if (page.componentVersion && page.componentVersion.version) return
  const server = (page.versions || []).find((pageVersion) => pageVersion.version === 'server')
  if (!server) return
  const isStartPage = page.componentVersion && page.url === page.componentVersion.url
  return !server.missing || isStartPage ? server.url : undefined
}
