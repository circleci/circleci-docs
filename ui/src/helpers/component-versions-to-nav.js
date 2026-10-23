'use strict'
module.exports = (component, { data: { root } }) => {
  const versions = component.versions || []
  // page.versions has one entry per version of the current page. Its url is the
  // same page in that version, or that version's start page when the page does
  // not exist there (missing: true).
  const pageVersions = {}
  ;((root.page && root.page.versions) || []).forEach((pageVersion) => {
    pageVersions[pageVersion.version] = pageVersion
  })
  const navList = []
  let selected = null

  versions.forEach((element) => {
    const { url, version, displayVersion } = element
    const pageVersion = pageVersions[version]
    const item = {
      name: version,
      value: version,
      label: displayVersion,
      url: pageVersion ? pageVersion.url : url,
      items: [],
      selected: version === root.page.componentVersion.version,
    }
    if (item.selected) {
      selected = item.label
    }
    navList.push(item)
  })

  // The guides switcher links to the page that explains the versions, in the
  // version being read.
  const current = root.page.componentVersion.version
  const aboutUrl = component.name === 'guides'
    ? `/guides/${current ? current + '/' : ''}about-circleci/about-cloud-and-server-docs/`
    : undefined

  // return the constructed nav list, the selected item, and the about page
  return { navList, selected, aboutUrl }
}
