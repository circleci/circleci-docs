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
 * - no `page-aliases`: aliases redirect old Cloud URLs, and an alias into
 *   another component is not versioned, so it would be registered once per
 *   clone and fail the build as a duplicate
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

const PAGE_PATH = /^modules\/([^/]+)\/pages\/(.+\.adoc)$/
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

function stripAliases (contents) {
  return Buffer.from(contents.toString('utf8').replace(/^:page-aliases:.*(?: \\\n.*)*\n/m, ''))
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
    const droppedFiles = new Set(pages.filter((p) => droppedKeys.has(p.key)).map((p) => p.file))

    const files = []
    for (const file of source.files) {
      if (droppedFiles.has(file)) continue
      if (file.path === NAV_PATH) {
        const pruned = pruneNav(file.contents.toString('utf8'), droppedKeys)
        files.push(cloneFile(file, Buffer.from(pruned)))
      } else if (PAGE_PATH.test(file.path)) {
        files.push(cloneFile(file, stripAliases(file.contents)))
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
