'use strict'

/**
 * Antora extension (DOC-281) that builds the guides component twice
 * from the same source files: once for Cloud (the existing unversioned build)
 * and once for the latest CircleCI Server release.
 *
 * On `contentAggregated` it clones the unversioned guides bucket into one
 * component version called `server` (displayed as "Server"). The clone gets:
 *
 * - the AsciiDoc attributes `server`, `server-version` ("4.10"),
 *   `server-version-num` (410) and `server-admin-version`
 * - only the pages that apply to that Server version, worked out from
 *   `page-platform`, `page-server-min-version` and `page-server-deprecated-in`
 * - a copy of the nav with entries for dropped pages removed
 * - a Server start page (`serverstartpage`), since the Cloud start page is
 *   Cloud-only
 * - xrefs to dropped pages replaced by their link text, so the Server build
 *   has no links to pages it does not contain (the xrefs are reported in
 *   `extensions/.temp/guides-server-unlinked.json`)
 * - no `page-aliases` into other components: such an alias is not versioned,
 *   so it would be registered once per clone and fail the build as a
 *   duplicate. Aliases within guides stay, since xrefs reach pages through them
 *
 * Pages that need a later Server version than the earliest one covered keep
 * `page-server-min-version`, which page-availability-extension.js shows as a
 * "Server version: 4.9 and later" sidebar.
 *
 * The unversioned Cloud bucket is left exactly as it is.
 *
 * Playbook config (Antora lowercases extension config keys, so read them
 * lowercased):
 *
 *   - require: ./extensions/guides-versions-extension.js
 *     component: guides
 *     serverversion: '4.10'
 *     serverstartpage: getting-started:config-intro.adoc
 */

const fs = require('fs')
const path = require('path')

const PAGE_PATH = /^modules\/([^/]+)\/pages\/(.+\.adoc)$/
const PARTIAL_PATH = /^modules\/([^/]+)\/partials\/.+\.adoc$/
const NAV_PATH = 'modules/ROOT/nav.adoc'

function versionNum (version) {
  const [major, minor] = version.split('.').map(Number)
  return major * 100 + minor
}

function readHeaderAttributes (contents) {
  const attrs = {}
  const lines = contents.toString('utf8').split('\n', 60)
  for (const line of lines) {
    const m = line.match(/^:(page-[\w-]+):\s*(.*?)\s*$/)
    if (m) attrs[m[1]] = m[2].replace(/^"(.*)"$/, '$1')
  }
  return attrs
}

// Returns a reason string if the page is not part of the Server version, else null.
function dropReason (attrs, serverNum) {
  const platform = attrs['page-platform']
  if (platform && !/server/i.test(platform)) return 'platform'
  const min = attrs['page-server-min-version']
  if (min && versionNum(min) > serverNum) return 'min-version'
  const deprecated = attrs['page-server-deprecated-in']
  if (deprecated && versionNum(deprecated) <= serverNum) return 'deprecated'
  return null
}

function readTitle (contents) {
  const m = contents.toString('utf8').match(/^= (.+)$/m)
  return m ? m[1].trim() : ''
}

// Reads `page-aliases` from a page header and returns the aliases that sit in
// the guides namespace, as `module:page.adoc` keys.
function readGuidesAliases (contents, ownModule, componentName, ownComponent) {
  const text = contents.toString('utf8')
  if (!text.includes(':page-aliases:')) return []
  const m = text.match(/^:page-aliases:[ \t]*(.*(?: \\\n.*)*)$/m)
  if (!m) return []
  return m[1]
    .replace(/ \\\n\s*/g, ' ')
    .split(',')
    .map((alias) => alias.trim().split(':').filter((part) => part !== ''))
    .map((parts) => {
      // `guides:module:page.adoc` is an alias in guides; `module:page.adoc`
      // and `page.adoc` are aliases in the page's own component.
      if (parts.length === 3 && parts[0] === componentName) return parts.slice(1).join(':')
      if (parts.length === 3 && ownComponent !== componentName) return null
      if (parts.length === 2 && ownComponent === componentName) return parts.join(':')
      if (parts.length === 1 && ownComponent === componentName) return `${ownModule}:${parts[0]}`
      return null
    })
    .filter(Boolean)
}

// Replaces xref macros that point at a dropped page with their link text (or
// the dropped page's title when the macro has no text). `moduleName` is the
// module of the page being edited, used to resolve targets without a module.
// Partials pass null, because a module-less target there is relative to the
// page that includes the partial and cannot be resolved, so it is left alone.
//
// `dropped` maps `module:page.adoc` keys of dropped pages, and of aliases of
// dropped pages, to their title. `moved` maps `module:page.adoc` keys of
// aliases that another component defines to the full target, because an alias
// from another component is not versioned and does not resolve from the
// Server build.
function unlinkDroppedXrefs (contents, moduleName, componentName, dropped, moved, onUnlink) {
  const resolve = (target) => {
    const parts = target.split(':')
    if (parts.length === 3 && parts[0] === componentName) parts.shift()
    if (parts.length > 2) return null
    return parts.length === 2 ? parts.join(':') : moduleName && `${moduleName}:${parts[0]}`
  }
  const text = contents
    .toString('utf8')
    .replace(/xref:([^[\s]+?\.adoc)(#[^[\s]*)?\[([^\]]*)\]/g, (match, target, anchor, linkText) => {
      const key = resolve(target)
      if (!key) return match
      if (dropped.has(key)) {
        onUnlink(key)
        return linkText.trim() || dropped.get(key).title
      }
      if (moved.has(key)) return `xref:${moved.get(key)}${anchor || ''}[${linkText}]`
      return match
    })
    // Legacy form: <<page#anchor,text>> or <<page.adoc#anchor,text>>
    .replace(/<<([\w./-]+?)(\.adoc)?(#[^,>\s]*)?,([^>]*)>>/g, (match, target, ext, anchor, linkText) => {
      const key = resolve(`${target}.adoc`)
      if (!key) return match
      if (moved.has(key)) return `xref:${moved.get(key)}${anchor || ''}[${linkText}]`
      if (!dropped.has(key)) return match
      onUnlink(key)
      return linkText.trim() || dropped.get(key).title
    })
  return Buffer.from(text)
}

// Removes page aliases that point into another component. An alias into
// another component has no version, so cloning the page would register it a
// second time and fail the build as a duplicate. Aliases within the guides
// component are kept, because other pages reach their targets through them.
function stripCrossComponentAliases (contents, componentName) {
  return Buffer.from(
    contents.toString('utf8').replace(/^:page-aliases:[ \t]*(.*(?: \\\n.*)*)\n/m, (match, value) => {
      const kept = value
        .replace(/ \\\n\s*/g, ' ')
        .split(',')
        .map((alias) => alias.trim())
        .filter(Boolean)
        .filter((alias) => {
          const parts = alias.split(':').filter((part) => part !== '')
          return parts.length < 3 || parts[0] === componentName
        })
      return kept.length ? `:page-aliases: ${kept.join(', ')}\n` : ''
    })
  )
}

function cloneFile (file, contents) {
  const clone = new file.constructor({
    path: file.path,
    contents: contents || file.contents,
    stat: file.stat,
    src: { ...file.src },
  })
  return clone
}

// Removes nav lines that link to dropped pages. A parent line left with no
// children and no link of its own is removed too.
function pruneNav (source, droppedPages) {
  const lines = source.split('\n')
  const keep = lines.map((line) => {
    const m = line.match(/xref:(?:([\w-]+):)?([^:[\s]+\.adoc)\[/)
    if (!m) return true
    return !droppedPages.has(`${m[1] || 'ROOT'}:${m[2]}`)
  })
  const depth = (line) => (line.match(/^(\*+)\s/) || [, ''])[1].length
  for (let i = lines.length - 1; i >= 0; i--) {
    if (!keep[i]) continue
    const d = depth(lines[i])
    if (!d || /xref:|link:/.test(lines[i])) continue
    let hasChild = false
    for (let j = i + 1; j < lines.length && depth(lines[j]) > d; j++) {
      if (keep[j]) {
        hasChild = true
        break
      }
    }
    if (!hasChild) keep[i] = false
  }
  return lines.filter((_, i) => keep[i]).join('\n')
}

module.exports.register = function register ({ config }) {
  const logger = this.getLogger('guides-versions-extension')
  const componentName = config.component || 'guides'
  const serverVersion = String(config.serverversion || '4.10')

  this.once('contentAggregated', ({ contentAggregate }) => {
    const source = contentAggregate.find((b) => b.name === componentName && !b.version)
    if (!source) {
      logger.warn(`no unversioned ${componentName} bucket found, nothing to clone`)
      return
    }

    // Read each page's metadata once.
    const pages = []
    for (const file of source.files) {
      const m = file.path.match(PAGE_PATH)
      if (m) pages.push({ file, key: `${m[1]}:${m[2]}`, attrs: readHeaderAttributes(file.contents) })
    }

    const num = versionNum(serverVersion)
    const dropped = new Map()
    for (const page of pages) {
      const reason = dropReason(page.attrs, num)
      if (reason) dropped.set(page.key, reason)
    }
    const droppedKeys = new Set(dropped.keys())
    const droppedInfo = new Map(
      pages.filter((p) => droppedKeys.has(p.key)).map((p) => [p.key, { title: readTitle(p.file.contents) }])
    )
    // Aliases of dropped pages are dropped too, and aliases that pages in other
    // components define in guides are rewritten to the real page.
    const moved = new Map()
    for (const bucket of contentAggregate) {
      for (const file of bucket.files) {
        const m = file.path.match(PAGE_PATH)
        if (!m) continue
        for (const alias of readGuidesAliases(file.contents, m[1], componentName, bucket.name)) {
          if (bucket.name === componentName) {
            if (droppedInfo.has(`${m[1]}:${m[2]}`)) droppedInfo.set(alias, droppedInfo.get(`${m[1]}:${m[2]}`))
          } else {
            moved.set(alias, `${bucket.name}:${m[1]}:${m[2]}`)
          }
        }
      }
    }
    const unlinked = {}
    const droppedFiles = new Set(pages.filter((p) => droppedKeys.has(p.key)).map((p) => p.file))

    const files = []
    for (const file of source.files) {
      if (droppedFiles.has(file)) continue
      if (file.path === NAV_PATH) {
        const pruned = pruneNav(file.contents.toString('utf8'), droppedKeys)
        files.push(cloneFile(file, Buffer.from(pruned)))
      } else if (PAGE_PATH.test(file.path)) {
        const pageKey = file.path.match(PAGE_PATH).slice(1, 3).join(':')
        const moduleName = file.path.match(PAGE_PATH)[1]
        const unlink = unlinkDroppedXrefs(file.contents, moduleName, componentName, droppedInfo, moved, (target) => {
          ;(unlinked[pageKey] = unlinked[pageKey] || []).push(target)
        })
        files.push(cloneFile(file, stripCrossComponentAliases(unlink, componentName)))
      } else if (PARTIAL_PATH.test(file.path)) {
        const partialKey = `partial:${file.path.replace(/^modules\//, '')}`
        const unlink = unlinkDroppedXrefs(file.contents, null, componentName, droppedInfo, moved, (target) => {
          ;(unlinked[partialKey] = unlinked[partialKey] || []).push(target)
        })
        files.push(cloneFile(file, unlink))
      } else {
        files.push(cloneFile(file))
      }
    }

    const nav = source.nav ? [...source.nav] : source.nav
    if (nav && source.nav.origin) nav.origin = source.nav.origin

    const reasons = [...dropped.values()].reduce((acc, r) => ({ ...acc, [r]: (acc[r] || 0) + 1 }), {})
    logger.info(
      `${componentName} server ${serverVersion}: ${pages.length - dropped.size} pages kept, ` +
        `${dropped.size} dropped ${JSON.stringify(reasons)}`
    )

    const unlinkedCount = Object.values(unlinked).reduce((n, targets) => n + targets.length, 0)
    logger.info(`${componentName} server: ${unlinkedCount} xrefs to dropped pages replaced by link text`)
    const reportDir = path.join(__dirname, '.temp')
    fs.mkdirSync(reportDir, { recursive: true })
    fs.writeFileSync(path.join(reportDir, 'guides-server-unlinked.json'), JSON.stringify(unlinked, null, 2))

    contentAggregate.push({
      ...source,
      version: 'server',
      displayVersion: 'Server',
      asciidoc: {
        ...source.asciidoc,
        attributes: {
          ...(source.asciidoc && source.asciidoc.attributes),
          server: '',
          'server-version': serverVersion,
          'server-version-num': num,
          'server-admin-version': `server-${serverVersion}`,
        },
      },
      nav,
      startPage: config.serverstartpage || source.startPage,
      files,
    })
  })
}
