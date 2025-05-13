'use strict'
module.exports = (component, { data: { root } }) => {
  const versions = component.versions || []
  const navList = []
  let selected = null

  versions.forEach((element) => {
    const { url, version, displayVersion } = element
    const item = {
      name: version,
      label: displayVersion,
      url,
      items: [],
      selected: version === root.page.componentVersion.version,
    }
    if (item.selected) {
      selected = item.label
    }
    navList.push(item)
  })

  // return the constructed nav list and the selected item
  return { navList, selected }
}
