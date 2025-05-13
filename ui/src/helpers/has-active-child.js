module.exports = (items, options) => {
  const pageUrl = options.data.root.page.url
  function check (list) {
    if (!list || !list.length) return false
    for (const item of list) {
      if (item.url === pageUrl || check(item.items)) {
        return true
      }
    }
    return false
  }
  return check(items)
}
