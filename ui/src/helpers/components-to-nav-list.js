'use strict'
module.exports = ({ data: { root } }) => {
  let components = root.site.components || []

  if (!Array.isArray(components)) {
    components = Object.values(components).map((component) => {
      return {
        ...component,
        ...component.latest,
      }
    })
  }
  const rootPageComponent = root
  const navList = []
  let selected = null
  const componentsOrder = [
    'ROOT',
    'guides',
    'reference',
    'server-admin',
    'orbs',
    'contributors',
  ]

  for (let i = 0; i < components.length; i++) {
    const component = components[i]
    const { title, url, name } = component
    const item = {
      name,
      label: title,
      url,
      items: [],
      selected: rootPageComponent.name === component.name,
    }
    if (item.selected) {
      selected = item.label
    }
    navList.push(item)
  }

  // Sort navList based on the order in componentsOrder
  navList.sort((a, b) => {
    const indexA = componentsOrder.indexOf(a.name)
    const indexB = componentsOrder.indexOf(b.name)
    if (indexA === -1 && indexB === -1) return 0
    if (indexA === -1) return 1
    if (indexB === -1) return -1
    return indexA - indexB
  })

  return {
    selected,
    navList,
  }
}
