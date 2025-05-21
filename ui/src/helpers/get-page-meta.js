'use strict'

module.exports = (page, { data }) => {
  const { contentCatalog } = data.root
  const pageFromCatalog = contentCatalog.findBy({
    family: 'page',
    version: page.componentVersion.version,
    component: page.component.name,
    module: page.module,
    relative: page.relativeSrcPath,
  })

  if (pageFromCatalog.length === 0) {
    console.log(
      'page not found in catalog:',
      page.component.name,
      page.componentVersion.version,
      page.module,
      page.relativeSrcPath
    )
    return null
  }

  return pageFromCatalog[0]?.asciidoc?.attributes?.meta
}
