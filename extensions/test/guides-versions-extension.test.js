'use strict'

// Run with: npm run test:extensions

const { test } = require('node:test')
const assert = require('node:assert')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const ext = require('../guides-versions-extension')
const { dropReason, serverExcludedRanges, unlinkDroppedXrefs, stripCrossComponentAliases, pruneNav } = ext._test

const dropped = new Map([['execution-managed:using-macos.adoc', { title: 'Using the macOS executor', reason: 'Cloud only' }]])
const unlink = (text, moduleName = 'about-circleci') => {
  const calls = []
  const out = unlinkDroppedXrefs(Buffer.from(text), moduleName, 'guides', dropped, new Map(), (u) => calls.push(u))
  return { out: out.toString(), calls }
}

test('dropReason reads platform, min version and deprecation', () => {
  assert.strictEqual(dropReason({ 'page-platform': 'Cloud' }, 410), 'Cloud only')
  assert.strictEqual(dropReason({ 'page-platform': 'Cloud, Server' }, 410), null)
  assert.strictEqual(dropReason({ 'page-platform': 'Server', 'page-server-min-version': '5.0' }, 410), 'needs Server 5.0')
  assert.strictEqual(dropReason({ 'page-platform': 'Server', 'page-server-deprecated-in': '4.10' }, 410), 'removed in Server 4.10')
})

test('unlinks xrefs to dropped pages and reports file lines', () => {
  const { out, calls } = unlink('Intro.\n\nSee xref:execution-managed:using-macos.adoc[macOS].\n')
  assert.strictEqual(out, 'Intro.\n\nSee macOS.\n')
  assert.deepStrictEqual(calls, [{ target: 'execution-managed:using-macos.adoc', text: 'macOS', line: 3 }])
})

test('uses the page title when the xref has no text', () => {
  assert.strictEqual(unlink('xref:execution-managed:using-macos.adoc[]').out, 'Using the macOS executor')
})

test('leaves xrefs inside ifndef::server[] alone', () => {
  const text = 'ifndef::server[]\nSee xref:execution-managed:using-macos.adoc[macOS].\nendif::[]\n'
  const { out, calls } = unlink(text)
  assert.strictEqual(out, text)
  assert.strictEqual(calls.length, 0)
})

test('leaves the single-line ifndef::server[] form alone', () => {
  const text = 'ifndef::server[See xref:execution-managed:using-macos.adoc[macOS].]\n'
  assert.strictEqual(unlink(text).calls.length, 0)
})

test('still unlinks inside other conditionals, and after an ifndef block closes', () => {
  const text = [
    'ifdef::server[]',
    'xref:execution-managed:using-macos.adoc[a]',
    'endif::server[]',
    'ifndef::server[]',
    'ifdef::foo[]',
    'xref:execution-managed:using-macos.adoc[b]',
    'endif::foo[]',
    'endif::server[]',
    'xref:execution-managed:using-macos.adoc[c]',
  ].join('\n')
  assert.deepStrictEqual(unlink(text).calls.map((c) => [c.text, c.line]), [['a', 2], ['c', 9]])
})

test('leaves listing and literal blocks alone', () => {
  const text = '----\nxref:execution-managed:using-macos.adoc[x]\n----\n....\n<<using-macos,y>>\n....\n'
  assert.strictEqual(unlink(text, 'execution-managed').calls.length, 0)
})

test('keeps line numbers right for the legacy <<>> form after an earlier unlink', () => {
  const text = 'xref:execution-managed:using-macos.adoc[first\nline]\n\n<<using-macos#top,second>>\n'
  const { calls } = unlink(text, 'execution-managed')
  assert.deepStrictEqual(calls.map((c) => c.line), [1, 4])
})

test('serverExcludedRanges runs an unclosed ifndef block to the end', () => {
  const text = 'a\nifndef::server[]\nb\n'
  assert.deepStrictEqual(serverExcludedRanges(text), [[2, text.length]])
})

test('stripCrossComponentAliases keeps guides aliases only', () => {
  const out = stripCrossComponentAliases(Buffer.from('= T\n:page-aliases: old.adoc, root:ROOT:old.adoc, guides:m:p.adoc\n'), 'guides')
  assert.strictEqual(out.toString(), '= T\n:page-aliases: old.adoc, guides:m:p.adoc\n')
})

test('pruneNav removes dropped entries and parents left empty', () => {
  const nav = ['* Execution', '** xref:execution-managed:using-macos.adoc[macOS]', '* xref:ROOT:index.adoc[Home]'].join('\n')
  assert.strictEqual(pruneNav(nav, new Set(['execution-managed:using-macos.adoc'])), '* xref:ROOT:index.adoc[Home]')
})

test('register adds a server bucket through updateVariables and filters the sitemap', () => {
  class File {
    constructor ({ path, contents, src }) {
      Object.assign(this, { path, contents, src })
    }
  }
  const src = { origin: { startPath: 'docs/guides' } }
  const page = (p, body) => new File({ path: p, contents: Buffer.from(body), src })
  const cloud = {
    name: 'guides',
    version: '',
    nav: ['modules/ROOT/nav.adoc'],
    files: [
      page('modules/ROOT/nav.adoc', '* xref:a:kept.adoc[Kept]\n* xref:a:cloud.adoc[Cloud]'),
      page('modules/a/pages/kept.adoc', '= Kept\n:page-platform: Cloud, Server\n\nSee xref:cloud.adoc[the Cloud page].'),
      page('modules/a/pages/cloud.adoc', '= Cloud\n:page-platform: Cloud\n\nBody.'),
    ],
  }
  const reportdir = fs.mkdtempSync(path.join(os.tmpdir(), 'guides-server-'))
  const handlers = {}
  let updated
  const context = {
    getLogger: () => ({ info () {}, warn () {}, error (msg) { context.errors.push(msg) } }),
    once: (event, fn) => { handlers[event] = fn },
    updateVariables: (vars) => { updated = vars },
    errors: [],
  }
  ext.register.call(context, { config: { serverversion: '4.10', maxunlinkedxrefs: 0, reportdir } })
  handlers.contentAggregated({ contentAggregate: [cloud] })

  const server = updated.contentAggregate.find((b) => b.version === 'server')
  assert.ok(server)
  assert.strictEqual(server.asciidoc.attributes['server-baseline-version'], '4.7')
  assert.deepStrictEqual(server.files.map((f) => f.path), ['modules/ROOT/nav.adoc', 'modules/a/pages/kept.adoc'])
  assert.match(server.files[1].contents.toString(), /See the Cloud page\./)
  assert.strictEqual(context.errors.length, 1, 'one unlink is over maxunlinkedxrefs: 0')
  assert.match(fs.readFileSync(path.join(reportdir, 'guides-server-unlinked.md'), 'utf8'), /## docs\/guides\/modules\/a\/pages\/kept.adoc\n\n- \[ \] Line 4: "the Cloud page" links to `a:cloud.adoc` \(Cloud only\)/)

  const sitemap = {
    out: { path: 'sitemap-guides.xml' },
    contents: Buffer.from(
      '<urlset>\n<url>\n<loc>https://x/docs/guides/a/kept/</loc>\n</url>\n<url>\n<loc>https://x/docs/guides/server/a/kept/</loc>\n</url>\n</urlset>'
    ),
  }
  handlers.beforePublish({ playbook: { site: { url: 'https://x/docs' } }, siteCatalog: { getFiles: () => [sitemap] } })
  assert.doesNotMatch(sitemap.contents.toString(), /guides\/server/)
  assert.match(sitemap.contents.toString(), /guides\/a\/kept/)
})

test('includedPartials follows includes from kept pages, skipping ifndef::server blocks', () => {
  const file = (p, body) => ({ path: p, contents: Buffer.from(body) })
  const page = file(
    'modules/a/pages/p.adoc',
    [
      '= P',
      'include::ROOT:partial$shown.adoc[]',
      'include::partial$own-module.adoc[]',
      'ifndef::server[]',
      'include::ROOT:partial$cloud-only.adoc[]',
      'endif::server[]',
      'include::reference:ROOT:partial$other-component.adoc[]',
      'include::ROOT:partial${attr}.adoc[]',
    ].join('\n')
  )
  const partials = [
    file('modules/ROOT/partials/shown.adoc', 'include::ROOT:partial$nested.adoc[]'),
    file('modules/ROOT/partials/nested.adoc', 'text'),
    file('modules/a/partials/own-module.adoc', 'text'),
    file('modules/ROOT/partials/cloud-only.adoc', 'include::ROOT:partial$only-from-cloud.adoc[]'),
    file('modules/ROOT/partials/only-from-cloud.adoc', 'text'),
  ]
  assert.deepStrictEqual(
    [...ext._test.includedPartials([page], partials, 'guides')].sort(),
    ['modules/ROOT/partials/nested.adoc', 'modules/ROOT/partials/shown.adoc', 'modules/a/partials/own-module.adoc']
  )
})
