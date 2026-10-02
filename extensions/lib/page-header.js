'use strict'

// Reads page-* header attributes from AsciiDoc source as plain text rather
// than YAML, so values like 4.10 stay strings and an empty attribute is an
// empty string, not boolean true.
//
// Used by scripts/check-metadata.js (schema validation) and
// guides-versions-extension.js (which pages the Server build drops), so both
// read a header the same way.

const ATTR_RE = /^:(!?)([\w-]+?)(!?):(?:\s+(.*?))?\s*$/

// Header = the title line plus the attribute and comment lines directly below it.
// Returns header attributes and any page-* attributes found after the header.
function parsePage (text) {
  const lines = text.split('\n')
  const attrs = {}
  const outside = []
  let inHeader = true
  let seenTitle = false
  lines.forEach((line, i) => {
    if (inHeader) {
      if (!seenTitle && line.startsWith('= ')) { seenTitle = true; return }
      if (seenTitle && line.trim() === '') { inHeader = false; return }
      if (line.startsWith('//')) return
    }
    const m = line.match(ATTR_RE)
    if (!m) return
    const [, unsetBefore, name, unsetAfter, value = ''] = m
    if (inHeader) {
      if (!unsetBefore && !unsetAfter) attrs[name] = { value, line: i + 1 }
    } else if (name.startsWith('page-')) {
      outside.push({ name, line: i + 1 })
    }
  })
  return { attrs, outside }
}

module.exports = { parsePage }
