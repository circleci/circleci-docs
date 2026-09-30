#!/usr/bin/env node
'use strict'
// Finds places where `:page-platform: Cloud, Server` guides pages treat Server
// differently from Cloud. Audit tooling for DOC-280, see
// planning/guides-cloud-server-versioning-audit-plan.md.
//
// Usage:
//   node scripts/audit-server-signals.js
//
// Writes to planning/audit/:
//   guides-server-signals.csv   one row per signal, per page (partials are resolved and reported against each including page)
//   guides-server-pages.csv     one row per in-scope page, with counts and a provisional triage group
//   guides-server-partials.csv  one row per partial that has signals, with the pages that include it
//
// Triage groups: A (no signals), A-low (only low-confidence signals),
// B (only links to Cloud-only pages or server-admin), C (explicit Server wording,
// needs manual review), C-matrix (only matrix-feature keywords: check against the
// VCS feature matrix).

const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const GUIDES = path.join(ROOT, 'docs/guides')
const OUT_DIR = path.join(ROOT, 'planning/audit')
const OTHER_COMPONENTS = new Set(['reference', 'orbs', 'server-admin', 'root', 'services', 'contributors'])
const FAMILY_DIRS = { partial: 'partials', example: 'examples', page: 'pages' }
const ATTR_RE = /^:(!?)([\w-]+?)(!?):(?:\s+(.*?))?\s*$/

// Capitalised "Server" that is not CircleCI Server.
const GENERIC_SERVER = /\b(?:Enterprise|Windows|X|SQL|Application|HTTP|HTTPS|Web|MCP|Language|Git|Jenkins|Remote|Proxy|Registry|Mail|SMTP|DNS|Bitbucket|GitLab|Artifact) Server\b|\bServer[- ](?:Sent|Message|Side|Name|Core)\b/g
const CIRCLECI_SERVER = /\bCircleCI[ -]?[Ss]erver\b|\bcircleci server\b/
const CAP_SERVER = /\bServer\b/
const LOWER_SERVER = /\bserver\b/
const SERVER_VERSION = /\bv?[345]\.\d+(?:\.\d+)?\+?/
const CLOUD_ONLY_WORDING = /(?:not|isn't|aren't|unavailable|unsupported).{0,40}(?:available|supported)?.{0,20}(?:on|for|in) (?:CircleCI )?[Ss]erver|cloud[- ]only|only (?:available )?(?:on|for|in) (?:CircleCI )?[Cc]loud|not (?:available|supported) (?:on|for|in) (?:self-hosted|server)/i

// Features the VCS matrix marks No for the GitHub OAuth on Server column.
// See integration/pages/version-control-system-integration-overview.adoc.
const MATRIX_FEATURES = [
  ['schedule-triggers', /schedule triggers?|scheduled pipelines?|schedule-triggers/i],
  ['rerun-failed-tests', /rerun failed tests|rerun-failed-tests/i],
  ['rollback-pipelines', /rollback pipelines?|set-up-rollbacks/i],
  ['deploy-pipelines', /deploy pipelines?|set-up-deploys|deploys overview|deployment-overview|deploy markers?|release markers?/i],
  ['chunk', /\bChunk\b|chunk-cli/],
  ['fine-grained-permissions', /fine-grained/i],
  ['custom-config-path', /custom (?:configuration|config)(?: file)? path|config(?:uration)? file path/i],
  ['github-actions-config', /GitHub Actions workflow/i],
  ['centralized-config', /centralized config|job overrides?/i],
  ['cross-repo', /cross-repo/i],
  ['custom-webhooks', /custom webhooks?|custom-webhooks/i],
  ['pr-event-triggers', /pull[- ]request event/i]
]
const CLOUD_CONCEPTS = [
  ['credits', /\bcredits?\b/i],
  ['plan-names', /\b(?:Free|Performance|Scale) (?:plan|tier)\b/],
  ['app-url', /app\.circleci\.com/],
  ['other-vcs', /\bGitLab\b|\bBitbucket\b|\bGitHub App\b(?! Server)/]
]

const ADMONITION_LINE = /^(NOTE|TIP|WARNING|IMPORTANT|CAUTION):\s/
const ADMONITION_BLOCK = /^\[(NOTE|TIP|WARNING|IMPORTANT|CAUTION)[\],]/

function walk (dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walk(p, out)
    else if (e.name.endsWith('.adoc')) out.push(p)
  }
  return out
}

// Header attributes only (title line to first blank line).
function readHeader (text) {
  const attrs = {}
  let title = ''
  let seenTitle = false
  for (const line of text.split('\n')) {
    if (!seenTitle) { if (line.startsWith('= ')) { seenTitle = true; title = line.slice(2).trim() } continue }
    if (line.trim() === '') break
    const m = line.match(ATTR_RE)
    if (m && !m[1] && !m[3]) attrs[m[2]] = m[4] || ''
  }
  return { attrs, title }
}

function pageKey (file) {
  const m = path.relative(path.join(GUIDES, 'modules'), file).match(/^([^/]+)\/pages\/(.+)$/)
  return m ? `${m[1]}:${m[2]}` : null
}

const platformByKey = new Map()
const pageFiles = walk(path.join(GUIDES, 'modules')).filter((f) => pageKey(f))
for (const f of pageFiles) {
  const { attrs } = readHeader(fs.readFileSync(f, 'utf8'))
  platformByKey.set(pageKey(f), (attrs['page-platform'] || '').split(',').map((s) => s.trim()).filter(Boolean))
}

const isCloudOnly = (key) => {
  const p = platformByKey.get(key)
  return !!p && p.includes('Cloud') && !p.includes('Server')
}

// Resolve the target of an xref to a guides page key, 'server-admin', or null (other component or unresolved).
function resolveXref (target, contextModule) {
  const clean = target.replace(/#.*$/, '').replace(/^\d+(?:\.\d+)*@/, '')
  const parts = clean.split(':')
  if (parts[0] === 'server-admin' || /^server-\d/.test(parts[0])) return 'server-admin'
  if (OTHER_COMPONENTS.has(parts[0])) return null
  if (parts[0] === 'guides') parts.shift()
  let mod = contextModule
  if (parts.length >= 2) mod = parts[parts.length - 2]
  const page = parts[parts.length - 1]
  if (!page.endsWith('.adoc')) return null
  return `${mod}:${page}`
}

// Resolve `include::[guides:]module:family$path[]` relative to the file that holds the directive.
function resolveInclude (target, fromModule) {
  const parts = target.replace(/^guides:/, '').split(':')
  let mod = fromModule
  let rest = parts[0]
  if (parts.length === 2) { mod = parts[0]; rest = parts[1] }
  const m = rest.match(/^(partial|example|page|attachment)\$(.+)$/)
  if (!m || !FAMILY_DIRS[m[1]]) return null
  const file = path.join(GUIDES, 'modules', mod, FAMILY_DIRS[m[1]], m[2])
  return fs.existsSync(file) ? { file, module: mod } : null
}

function cleanSnippet (s) {
  return s.replace(/\s+/g, ' ').trim().slice(0, 180)
}

function serverConfidence (text) {
  if (CIRCLECI_SERVER.test(text)) return 'high'
  const stripped = text.replace(GENERIC_SERVER, '')
  if (CAP_SERVER.test(stripped)) return 'high'
  if (LOWER_SERVER.test(stripped)) return 'low'
  return null
}

// Scan one file. `ctx` carries the including page's module (for xrefs) and the signal sink.
function scanFile (file, fileModule, ctx, seen) {
  if (seen.has(file)) return
  seen.add(file)
  const rel = path.relative(GUIDES, file)
  const lines = fs.readFileSync(file, 'utf8').split('\n')
  let inComment = false
  let inCode = null
  let inTable = false
  let tabsPending = false
  let tabsDelim = null
  let admon = null

  const add = (line, type, detail, confidence, snippet) =>
    ctx.signals.push({ line, source: rel, type, detail, confidence, snippet: cleanSnippet(snippet) })

  const flushAdmon = () => {
    if (!admon) return
    const text = admon.lines.join(' ')
    const conf = serverConfidence(text) || (CLOUD_ONLY_WORDING.test(text) ? 'high' : null)
    if (conf) {
      const v = SERVER_VERSION.test(text) ? ` ${text.match(SERVER_VERSION)[0]}` : ''
      add(admon.start, 'admonition-server', admon.kind + v, conf, text)
    }
    admon = null
  }

  lines.forEach((raw, idx) => {
    const n = idx + 1
    const line = raw.replace(/\s+$/, '')

    if (/^\/{4,}$/.test(line)) { inComment = !inComment; return }
    if (inComment) return

    const pre = line.match(/^(ifdef|ifndef|ifeval)::(.*)$/)
    if (pre) { add(n, 'existing-conditional', pre[1], 'high', line); return }
    const inc = line.match(/^include::([^[]+)\[/)
    if (inc) {
      const r = resolveInclude(inc[1], fileModule)
      if (r) { ctx.includes.add(path.relative(GUIDES, r.file)); scanFile(r.file, r.module, ctx, seen) }
      return
    }

    if (/^(-{4,}|\.{4,})$/.test(line)) {
      if (!inCode) inCode = line[0]
      else if (line[0] === inCode) inCode = null
      return
    }
    if (inCode) return
    if (/^\/\//.test(line)) return
    if (/^:[!\w-]+:/.test(line)) return

    // Block admonition
    if (admon && admon.block) {
      if (/^={4,}$/.test(line)) { if (admon.opened) flushAdmon(); else admon.opened = true; return }
      if (!admon.opened) { if (line.trim() === '') return; flushAdmon() } else { admon.lines.push(line); return }
    }
    if (admon && !admon.block) {
      if (line.trim() === '') flushAdmon(); else { admon.lines.push(line); return }
    }
    const ab = line.match(ADMONITION_BLOCK)
    if (ab) { admon = { start: n, kind: ab[1], block: true, lines: [], opened: false }; return }
    const al = line.match(ADMONITION_LINE)
    if (al) { admon = { start: n, kind: al[1], block: false, lines: [line] }; return }

    // Tabs
    if (/^\[tabs[\],]/.test(line)) { tabsPending = true; return }
    if (tabsPending && /^={4,}$/.test(line)) { tabsDelim = line; tabsPending = false; return }
    if (tabsDelim && line === tabsDelim) { tabsDelim = null; return }
    if (tabsDelim) {
      const tab = line.match(/^([^:\s][^:]*)::\s*$/)
      if (tab && /server|cloud/i.test(tab[1])) { add(n, 'tab-server', tab[1], 'high', line); return }
    }

    // Headings
    const h = line.match(/^(=+)\s+(.*)$/)
    if (h && h[1].length >= 2) {
      const conf = serverConfidence(h[2])
      if (conf) add(n, 'heading-server', `h${h[1].length}`, conf, line)
      return
    }

    if (/^\|={3,}$/.test(line)) { inTable = !inTable; return }

    // Images
    const img = line.match(/image::?([^[\s]+)\[/)
    if (img) add(n, 'image', img[1], 'low', line)

    // Links
    for (const m of line.matchAll(/xref:([^[\s]+?)\[/g)) {
      const r = resolveXref(m[1], ctx.module)
      if (r === 'server-admin') add(n, 'xref-server-admin', m[1], 'high', line)
      else if (r && isCloudOnly(r)) add(n, 'xref-cloud-only', r, 'high', line)
    }
    if (/server-admin/.test(line) && !/xref:/.test(line)) add(n, 'xref-server-admin', 'link', 'high', line)

    // Wording
    if (CLOUD_ONLY_WORDING.test(line)) add(n, 'cloud-only-wording', '', 'high', line)
    const conf = serverConfidence(line)
    if (conf) {
      if (SERVER_VERSION.test(line) && conf === 'high') add(n, 'server-version', line.match(SERVER_VERSION)[0], 'high', line)
      else if (inTable) add(n, 'table-server', '', conf, line)
      else add(n, 'server-mention', '', conf, line)
    }

    for (const [name, re] of MATRIX_FEATURES) if (re.test(line)) add(n, 'matrix-feature', name, 'high', line)
    for (const [name, re] of CLOUD_CONCEPTS) if (re.test(line)) add(n, 'cloud-concept', name, 'low', line)
  })
  flushAdmon()
}

// Collapse duplicate rows (same type, line, source) that several regexes can produce.
function dedupe (signals) {
  const seen = new Set()
  return signals.filter((s) => {
    const k = `${s.source}|${s.line}|${s.type}|${s.detail}`
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
}

const csv = (rows, cols) => [cols.join(',')].concat(rows.map((r) => cols.map((c) => {
  const v = String(r[c] ?? '')
  return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v
}).join(','))).join('\n') + '\n'

const SIGNAL_TYPES = ['heading-server', 'tab-server', 'admonition-server', 'table-server', 'server-version', 'cloud-only-wording', 'server-mention', 'matrix-feature', 'existing-conditional', 'xref-cloud-only', 'xref-server-admin', 'cloud-concept', 'image']
const CONTENT_TYPES = new Set(['heading-server', 'tab-server', 'admonition-server', 'table-server', 'server-version', 'cloud-only-wording', 'server-mention', 'matrix-feature', 'existing-conditional'])
const LINK_TYPES = new Set(['xref-cloud-only', 'xref-server-admin'])

const signalRows = []
const pageRows = []
const partialUse = new Map()

for (const f of pageFiles.sort()) {
  const key = pageKey(f)
  const platform = platformByKey.get(key)
  if (!(platform.includes('Cloud') && platform.includes('Server'))) continue
  const text = fs.readFileSync(f, 'utf8')
  const { attrs, title } = readHeader(text)
  const mod = key.split(':')[0]
  const ctx = { module: mod, signals: [], includes: new Set() }
  scanFile(f, mod, ctx, new Set())
  const signals = dedupe(ctx.signals)

  const counts = Object.fromEntries(SIGNAL_TYPES.map((t) => [t, 0]))
  for (const s of signals) {
    counts[s.type]++
    signalRows.push({ page: key, module: mod, line: s.line, source_file: s.source, signal_type: s.type, detail: s.detail, confidence: s.confidence, snippet: s.snippet })
    if (s.source.includes('/partials/') || s.source.includes('/examples/')) {
      if (!partialUse.has(s.source)) partialUse.set(s.source, { pages: new Set(), signals: new Set() })
      partialUse.get(s.source).pages.add(key)
      partialUse.get(s.source).signals.add(`${s.line}:${s.type}`)
    }
  }
  const content = signals.filter((s) => CONTENT_TYPES.has(s.type))
  const high = content.filter((s) => s.confidence === 'high')
  const links = signals.filter((s) => LINK_TYPES.has(s.type))
  const low = signals.filter((s) => s.confidence === 'low' && s.type !== 'image')
  let group = 'A'
  const explicit = high.filter((s) => s.type !== 'matrix-feature')
  if (explicit.length) group = 'C'
  else if (high.length) group = 'C-matrix'
  else if (links.length) group = 'B'
  else if (content.length || low.length) group = 'A-low'
  pageRows.push({
    page: key,
    module: mod,
    title,
    server_min_version: attrs['page-server-min-version'] || '',
    server_deprecated_in: attrs['page-server-deprecated-in'] || '',
    lines: text.split('\n').length,
    includes: ctx.includes.size,
    ...counts,
    high_content_signals: high.length,
    triage_group: group
  })
}

fs.mkdirSync(OUT_DIR, { recursive: true })
const sigCols = ['page', 'module', 'line', 'source_file', 'signal_type', 'detail', 'confidence', 'snippet']
fs.writeFileSync(path.join(OUT_DIR, 'guides-server-signals.csv'), csv(signalRows, sigCols))
const pageCols = ['page', 'module', 'title', 'server_min_version', 'server_deprecated_in', 'lines', 'includes'].concat(SIGNAL_TYPES, ['high_content_signals', 'triage_group'])
fs.writeFileSync(path.join(OUT_DIR, 'guides-server-pages.csv'), csv(pageRows, pageCols))
const partialRows = [...partialUse.entries()].sort().map(([file, u]) => ({ partial: file, signals: u.signals.size, included_by_pages: u.pages.size, pages: [...u.pages].sort().join(' ') }))
fs.writeFileSync(path.join(OUT_DIR, 'guides-server-partials.csv'), csv(partialRows, ['partial', 'signals', 'included_by_pages', 'pages']))

const groups = {}
for (const r of pageRows) groups[r.triage_group] = (groups[r.triage_group] || 0) + 1
console.log(`In-scope pages: ${pageRows.length}`)
console.log(`Signals: ${signalRows.length}`)
console.log(`Triage groups: ${JSON.stringify(groups)}`)
console.log(`Partials with signals: ${partialRows.length}`)
console.log(`Wrote ${path.relative(ROOT, OUT_DIR)}/guides-server-{signals,pages,partials}.csv`)
