'use strict'

const detag = require('./detag')

module.exports = (page, site, defaultPageTitle, { data }) => {
  const { contentCatalog } = data.root
  const pageFromCatalog = contentCatalog.findBy({
    family: 'page',
    version: page.componentVersion.version,
    component: page.component.name,
    module: page.module,
    relative: page.relativeSrcPath,
  })
  const meta = pageFromCatalog[0]?.asciidoc?.attributes?.meta

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: detag(page.title || defaultPageTitle),
    url: page.canonicalUrl,
  }

  const description = page.description || page.attributes?.description
  if (description) jsonLd.description = detag(description)
  if (meta?.lastUpdate) jsonLd.dateModified = new Date(meta.lastUpdate).toISOString().split('T')[0]
  if (site?.title) jsonLd.publisher = { '@type': 'Organization', name: site.title }

  return jsonLd
}
