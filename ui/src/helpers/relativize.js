'use strict'

const { posix: path } = require('path')

module.exports = (to, from, ctx) => {
  if (!to) return '#'
  if (to.charAt() !== '/') return to
  // NOTE only legacy invocation provides both to and from
  if (!ctx) from = (ctx = from).data.root.page.url
  if (!from) return (ctx.data.root.site.path || '') + to
  let hash = ''
  const hashIdx = to.indexOf('#')
  if (~hashIdx) {
    hash = to.slice(hashIdx)
    to = to.slice(0, hashIdx)
  }
  if (to === from) return hash || (isDir(to) ? './' : path.basename(to))
  const rel = path.relative(path.dirname(from + '.'), to)
  return rel ? (isDir(to) ? rel + '/' : rel) + hash : (isDir(to) ? './' : '../' + path.basename(to)) + hash
}

function isDir (str) {
  return str.charAt(str.length - 1) === '/'
}
