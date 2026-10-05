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
 *   `server-version-num` (410), `server-admin-version` and
 *   `server-baseline-version` ("4.7")
 * - only the pages that apply to that Server version, worked out from
 *   `page-platform`, `page-server-min-version` and `page-server-deprecated-in`
 * - a copy of the nav with entries for dropped pages removed
 * - a Server start page (`serverstartpage`), since the Cloud start page is
 *   Cloud-only
 * - xrefs to dropped pages replaced by their link text, so the Server build
 *   has no links to pages it does not contain. Xrefs inside
 *   `ifndef::server[]` and in listing or literal blocks are left alone, since
 *   they never render as links in the Server build. The rest are listed, with
 *   file and line, in `extensions/.temp/guides-server-unlinked.md` (and
 *   `.json`) so they can be wrapped in `ifndef::server[]`. Xrefs in a partial
 *   are listed only when a Server page shows that partial
 * - no `page-aliases` into other components: such an alias is not versioned,
 *   so it would be registered once per clone and fail the build as a
 *   duplicate. Aliases within guides stay, since xrefs reach pages through them
 *
 * Pages that need a later Server version than the baseline keep
 * `page-server-min-version`, which page-availability-extension.js shows as a
 * "Server version: 4.9 and later" sidebar.
 *
 * The unversioned Cloud bucket is left exactly as it is. Server pages are
 * removed from the sitemap, since their canonical URL is the Cloud page.
 *
 * Playbook config (Antora lowercases extension config keys, so read them
 * lowercased):
 *
 *   - require: ./extensions/guides-versions-extension.js
 *     serverversion: '4.10'
 *     serverbaseline: '4.7'
 *     serverstartpage: getting-started:create-project.adoc
 *     # Set to false to publish Cloud only (no Server build, no version switcher).
 *     enabled: true
 *     # Fails the build (logs an error) when more xrefs than this are
 *     # unlinked, so new links to Cloud-only pages get wrapped. Lower it as
 *     # the list shrinks.
 *     maxunlinkedxrefs: 132
 */

const fs = require('fs')
const path = require('path')
const { parsePage } = require('./lib/page-header')
const { COMPONENT, VERSION, DISPLAY_VERSION, BASELINE_ATTRIBUTE, versionNum } = require('./lib/guides-server')

const PAGE_PATH = /^modules\/([^/]+)\/pages\/(.+\.adoc)$/
const PARTIAL_PATH = /^modules\/([^/]+)\/partials\/.+\.adoc$/
const NAV_PATH = 'modules/ROOT/nav.adoc'
const REPORT_DIR = path.join(__dirname, '.temp')
const REPORT_NAME = 'guides-server-unlinked'

// Header attributes as plain strings, with surrounding quotes removed.
function readHeaderAttributes (contents) {
  const { attrs } = parsePage(contents.toString('utf8'))
  return Object.fromEntries(Object.entries(attrs).map(([name, { value }]) => [name, value.replace(/^"(.*)"$/, '$1')]))
}

// Returns why the page is not part of the Server version, or null when it is.
function dropReason (attrs, serverNum) {
  const platform = attrs['page-platform']
  if (platform && !/server/i.test(platform)) return 'Cloud only'
  const min = attrs['page-server-min-version']
  if (min && versionNum(min) > serverNum) return `needs Server ${min}`
  const deprecated = attrs['page-server-deprecated-in']
  if (deprecated && versionNum(deprecated) <= serverNum) return `removed in Server ${deprecated}`
  return null
}

function readTitle (contents) {
  const m = contents.toString('utf8').match(/^= (.+)$/m)
  return m ? m[1].trim() : ''
}

// Returns the [start, end) character ranges of `text` that never render as
// links in the Server build: content inside `ifndef::server[]` blocks, the
// single-line `ifndef::server[text]` form, and listing (----) and literal
// (....) blocks. Only the exact `server` attribute is recognised.
function serverExcludedRanges (text) {
  const ranges = []
  // One entry per open conditional block: its start offset when it is an
  // `ifndef::server[]` block, otherwise null.
  const stack = []
  const insideExclusion = () => stack.some((start) => start !== null)
  let delimiter = null
  let blockStart = 0
  let offset = 0
  for (const line of text.split('\n')) {
    const end = offset + line.length + 1
    const directive = line.match(/^(ifn?def)::([^[]*)\[(.*)\]\s*$/)
    if (delimiter) {
      if (line === delimiter) {
        if (!insideExclusion()) ranges.push([blockStart, end])
        delimiter = null
      }
    } else if (/^(-{4,}|\.{4,})$/.test(line)) {
      delimiter = line
      blockStart = offset
    } else if (directive && directive[3] !== '') {
      // Single-line form: ifndef::server[content]
      if (directive[1] === 'ifndef' && directive[2] === 'server') ranges.push([offset, end])
    } else if (directive || /^ifeval::\[.*\]\s*$/.test(line)) {
      stack.push(directive && directive[1] === 'ifndef' && directive[2] === 'server' ? offset : null)
    } else if (/^endif::[^[]*\[\]\s*$/.test(line) && stack.length) {
      const start = stack.pop()
      if (start !== null && !insideExclusion()) ranges.push([start, end])
    }
    offset = end
  }
  // Unclosed blocks run to the end of the file, as in Asciidoctor.
  const openExclusion = stack.find((start) => start !== null)
  if (openExclusion !== undefined) ranges.push([openExclusion, text.length])
  if (delimiter && !insideExclusion()) ranges.push([blockStart, text.length])
  return ranges
}

// Returns the paths (`modules/<module>/partials/<path>`) of the partials that
// the Server build shows: those that a kept page includes outside the
// excluded ranges, directly or through other partials. Includes from other
// components, and targets built from attributes, are not followed.
function includedPartials (pageFiles, partialFiles, componentName) {
  const byPath = new Map(partialFiles.map((file) => [file.path, file]))
  const found = new Set()
  const queue = [...pageFiles]
  while (queue.length) {
    const file = queue.shift()
    const ownModule = file.path.split('/')[1]
    const text = file.contents.toString('utf8')
    const ranges = serverExcludedRanges(text)
    for (const m of text.matchAll(/^include::([^[\s]+)\[/gm)) {
      if (ranges.some(([start, end]) => m.index >= start && m.index < end)) continue
      const target = m[1]
      if (target.includes('{')) continue
      const spec = target.match(/^(?:(?:([\w-]+):)?([\w-]+):)?partial\$(.+)$/)
      if (!spec || (spec[1] && spec[1] !== componentName)) continue
      const key = `modules/${spec[2] || ownModule}/partials/${spec[3]}`
      if (found.has(key) || !byPath.has(key)) continue
      found.add(key)
      queue.push(byPath.get(key))
    }
  }
  return found
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
// dropped pages, to `{ title, reason }`. `moved` maps `module:page.adoc` keys
// of aliases that another component defines to the full target, because an
// alias from another component is not versioned and does not resolve from the
// Server build. `onUnlink` is called with `{ target, text, line }`.
function unlinkDroppedXrefs (contents, moduleName, componentName, dropped, moved, onUnlink) {
  const resolve = (target) => {
    const parts = target.split(':')
    if (parts.length === 3 && parts[0] === componentName) parts.shift()
    if (parts.length > 2) return null
    return parts.length === 2 ? parts.join(':') : moduleName && `${moduleName}:${parts[0]}`
  }
  // Replacements keep the number of newlines, so line numbers from either pass
  // match the source file. Excluded ranges are worked out again for the second
  // pass, because the first one changes character offsets.
  const pass = (text, pattern, rewrite) => {
    const ranges = serverExcludedRanges(text)
    return text.replace(pattern, (...args) => {
      const offset = args[args.length - 2]
      if (ranges.some(([start, end]) => offset >= start && offset < end)) return args[0]
      const lineOf = () => text.slice(0, offset).split('\n').length
      return rewrite(lineOf, ...args)
    })
  }
  const unlink = (key, linkText, lineOf) => {
    const text = linkText.trim() || dropped.get(key).title
    onUnlink({ target: key, text, line: lineOf() })
    return text
  }
  let text = pass(
    contents.toString('utf8'),
    /xref:([^[\s]+?\.adoc)(#[^[\s]*)?\[([^\]]*)\]/g,
    (lineOf, match, target, anchor, linkText) => {
      const key = resolve(target)
      if (!key) return match
      if (dropped.has(key)) return unlink(key, linkText, lineOf)
      if (moved.has(key)) return `xref:${moved.get(key)}${anchor || ''}[${linkText}]`
      return match
    }
  )
  // Legacy form: <<page#anchor,text>> or <<page.adoc#anchor,text>>
  text = pass(text, /<<([\w./-]+?)(\.adoc)?(#[^,>\s]*)?,([^>]*)>>/g, (lineOf, match, target, ext, anchor, linkText) => {
    const key = resolve(`${target}.adoc`)
    if (!key) return match
    if (moved.has(key)) return `xref:${moved.get(key)}${anchor || ''}[${linkText}]`
    if (!dropped.has(key)) return match
    return unlink(key, linkText, lineOf)
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
  return new file.constructor({
    path: file.path,
    contents: contents || file.contents,
    stat: file.stat,
    src: { ...file.src },
  })
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

// A checklist of unlinked xrefs, grouped by source file, for wrapping them in
// `ifndef::server[]`.
function formatReport (entries, serverVersion) {
  const byFile = new Map()
  for (const entry of entries) {
    if (!byFile.has(entry.file)) byFile.set(entry.file, [])
    byFile.get(entry.file).push(entry)
  }
  const lines = [
    `# Xrefs unlinked in the guides Server ${serverVersion} build`,
    '',
    `${entries.length} xrefs in ${byFile.size} files point to pages the Server build drops, so they render as plain text.`,
    'Wrap each one (or the sentence or section around it) in `ifndef::server[]`, then rebuild to update this list.',
    'Partials are shared, so one fix in a partial covers every page that includes it.',
    '',
  ]
  for (const [file, fileEntries] of [...byFile].sort(([a], [b]) => a.localeCompare(b))) {
    lines.push(`## ${file}`, '')
    for (const { line, text, target, reason } of fileEntries.sort((a, b) => a.line - b.line)) {
      lines.push(`- [ ] Line ${line}: "${text}" links to \`${target}\` (${reason})`)
    }
    lines.push('')
  }
  return lines.join('\n')
}

module.exports.register = function register ({ config }) {
  const logger = this.getLogger('guides-versions-extension')
  const componentName = COMPONENT
  const serverVersion = String(config.serverversion || '4.10')
  const baselineVersion = String(config.serverbaseline || '4.7')
  const maxUnlinked = config.maxunlinkedxrefs === undefined ? null : Number(config.maxunlinkedxrefs)
  const reportDir = config.reportdir || REPORT_DIR

  // `enabled: false` skips the Server build, so only Cloud is published and the
  // version switcher does not appear. Set it back to true to build Server again.
  if (String(config.enabled).toLowerCase() === 'false') return

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
      if (reason) dropped.set(page.key, { title: readTitle(page.file.contents), reason })
    }
    const droppedKeys = new Set(dropped.keys())
    // Aliases of dropped pages are dropped too, and aliases that pages in other
    // components define in guides are rewritten to the real page.
    const droppedInfo = new Map(dropped)
    const moved = new Map()
    for (const bucket of contentAggregate) {
      for (const file of bucket.files) {
        const m = file.path.match(PAGE_PATH)
        if (!m) continue
        for (const alias of readGuidesAliases(file.contents, m[1], componentName, bucket.name)) {
          if (bucket.name === componentName) {
            if (dropped.has(`${m[1]}:${m[2]}`)) droppedInfo.set(alias, dropped.get(`${m[1]}:${m[2]}`))
          } else {
            moved.set(alias, `${bucket.name}:${m[1]}:${m[2]}`)
          }
        }
      }
    }
    const unlinked = []
    const droppedFiles = new Set(pages.filter((p) => droppedKeys.has(p.key)).map((p) => p.file))
    const sourcePath = (file) => path.posix.join((file.src.origin && file.src.origin.startPath) || '', file.path)
    const recordUnlink = (file) => ({ target, text, line }) =>
      unlinked.push({ file: sourcePath(file), line, text, target, reason: droppedInfo.get(target).reason })
    // Xrefs in partials that no Server page shows are still unlinked, but not
    // reported, since there is nothing to wrap.
    const shownPartials = includedPartials(
      source.files.filter((file) => PAGE_PATH.test(file.path) && !droppedFiles.has(file)),
      source.files.filter((file) => PARTIAL_PATH.test(file.path)),
      componentName
    )
    const recordPartialUnlink = (file) => (shownPartials.has(file.path) ? recordUnlink(file) : () => {})

    const files = []
    for (const file of source.files) {
      if (droppedFiles.has(file)) continue
      if (file.path === NAV_PATH) {
        const pruned = pruneNav(file.contents.toString('utf8'), droppedKeys)
        files.push(cloneFile(file, Buffer.from(pruned)))
      } else if (PAGE_PATH.test(file.path)) {
        const moduleName = file.path.match(PAGE_PATH)[1]
        const unlink = unlinkDroppedXrefs(file.contents, moduleName, componentName, droppedInfo, moved, recordUnlink(file))
        files.push(cloneFile(file, stripCrossComponentAliases(unlink, componentName)))
      } else if (PARTIAL_PATH.test(file.path)) {
        files.push(cloneFile(file, unlinkDroppedXrefs(file.contents, null, componentName, droppedInfo, moved, recordPartialUnlink(file))))
      } else {
        files.push(cloneFile(file))
      }
    }

    const nav = source.nav ? [...source.nav] : source.nav
    if (nav && source.nav.origin) nav.origin = source.nav.origin

    const reasons = [...dropped.values()].reduce((acc, { reason }) => ({ ...acc, [reason]: (acc[reason] || 0) + 1 }), {})
    logger.info(
      `${componentName} server ${serverVersion}: ${pages.length - dropped.size} pages kept, ` +
        `${dropped.size} dropped ${JSON.stringify(reasons)}`
    )

    fs.mkdirSync(reportDir, { recursive: true })
    fs.writeFileSync(path.join(reportDir, `${REPORT_NAME}.json`), JSON.stringify(unlinked, null, 2))
    fs.writeFileSync(path.join(reportDir, `${REPORT_NAME}.md`), formatReport(unlinked, serverVersion))
    const report = path.relative(process.cwd(), path.join(reportDir, `${REPORT_NAME}.md`))
    if (maxUnlinked !== null && unlinked.length > maxUnlinked) {
      logger.error(
        `${componentName} server: ${unlinked.length} xrefs to dropped pages, more than maxunlinkedxrefs (${maxUnlinked}). ` +
          `Wrap the new ones in ifndef::server[] (list in ${report})`
      )
    } else {
      logger.info(`${componentName} server: ${unlinked.length} xrefs to dropped pages replaced by link text (list in ${report})`)
    }

    this.updateVariables({
      contentAggregate: [
        ...contentAggregate,
        {
          ...source,
          version: VERSION,
          displayVersion: DISPLAY_VERSION,
          asciidoc: {
            ...source.asciidoc,
            attributes: {
              ...(source.asciidoc && source.asciidoc.attributes),
              server: '',
              'server-version': serverVersion,
              'server-version-num': num,
              'server-admin-version': `server-${serverVersion}`,
              [BASELINE_ATTRIBUTE]: baselineVersion,
            },
          },
          nav,
          startPage: config.serverstartpage || source.startPage,
          files,
        },
      ],
    })
  })

  // Server pages have the Cloud page as their canonical URL, so listing them
  // in the sitemap would send search engines conflicting signals.
  this.once('beforePublish', ({ playbook, siteCatalog }) => {
    const prefix = `${playbook.site.url}/${componentName}/${VERSION}/`
    for (const file of siteCatalog.getFiles()) {
      if (!/^sitemap.*\.xml$/.test((file.out && file.out.path) || '')) continue
      const xml = file.contents.toString()
      const filtered = xml.replace(/<url>\s*<loc>([^<]*)<\/loc>[\s\S]*?<\/url>\s*/g, (entry, loc) =>
        loc.startsWith(prefix) ? '' : entry
      )
      if (filtered !== xml) file.contents = Buffer.from(filtered)
    }
  })
}

module.exports._test = { includedPartials, dropReason, serverExcludedRanges, unlinkDroppedXrefs, stripCrossComponentAliases, pruneNav, formatReport }
