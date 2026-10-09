#!/usr/bin/env node
'use strict'
// Validates page-* header attributes against schemas/docs-metadata.schema.json.
//
// Usage:
//   node scripts/check-metadata.js              check every page
//   node scripts/check-metadata.js <file>...    check only these files (out-of-scope files are skipped)

const fs = require('fs')
const path = require('path')
const { execFileSync } = require('child_process')
const { parsePage } = require('../extensions/lib/page-header')

const ROOT = path.resolve(__dirname, '..')
const SCHEMA_PATH = path.join(ROOT, 'schemas/docs-metadata.schema.json')
const PAGE_RE = /^docs\/[^/]+\/modules\/[^/]+\/pages\/.+\.adoc$/
const EXCLUDED = /^docs\/contributors\//

const SUPPORTED_SCHEMA_KEYS = new Set(['$schema', '$id', 'title', 'description', 'type', 'required', 'additionalProperties', 'properties'])
const SUPPORTED_PROPERTY_KEYS = new Set(['type', 'description', 'pattern', 'enum', 'minLength', 'maxLength'])
const LIST_FIELDS = ['page-content-type', 'page-platform', 'page-vcs', 'page-plan']
const PLAN_ORDER = ['Free', 'Performance', 'Scale']

function loadSchema () {
  const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf8'))
  const unsupported = Object.keys(schema).filter((k) => !SUPPORTED_SCHEMA_KEYS.has(k))
  for (const [name, prop] of Object.entries(schema.properties)) {
    for (const k of Object.keys(prop)) if (!SUPPORTED_PROPERTY_KEYS.has(k)) unsupported.push(`${name}.${k}`)
    if (prop.type !== 'string') unsupported.push(`${name}.type=${prop.type}`)
  }
  if (unsupported.length) {
    console.error(`check-metadata: schema uses keywords this script doesn't check: ${unsupported.join(', ')}`)
    console.error('Extend scripts/check-metadata.js before adding them to the schema.')
    process.exit(2)
  }
  return schema
}

function splitList (value) {
  return value.split(',').map((v) => v.trim())
}

function listAllPages () {
  return execFileSync('git', ['ls-files', 'docs/*/modules/*/pages/**.adoc'], { cwd: ROOT }).toString().trim().split('\n')
    .filter((f) => PAGE_RE.test(f) && !EXCLUDED.test(f) && fs.existsSync(path.join(ROOT, f)))
}

// Maps each description to every page that uses it, across all pages, so a
// partial run (the pre-commit hook) still catches clashes with unstaged pages.
function indexDescriptions () {
  const index = new Map()
  for (const file of listAllPages()) {
    const desc = parsePage(fs.readFileSync(path.join(ROOT, file), 'utf8')).attrs['page-description']
    if (!desc || !desc.value) continue
    if (!index.has(desc.value)) index.set(desc.value, [])
    index.get(desc.value).push(file)
  }
  return index
}

function checkPage (file, schema, descriptions) {
  const errors = []
  const err = (line, msg) => errors.push(`${file}:${line}: ${msg}`)
  const { attrs, outside } = parsePage(fs.readFileSync(path.join(ROOT, file), 'utf8'))

  const desc = attrs['page-description']
  const sharedWith = desc && desc.value ? (descriptions.get(desc.value) || []).filter((f) => f !== file) : []
  if (sharedWith.length) {
    err(desc.line, `:page-description: is the same as ${sharedWith.join(', ')}. Make it unique (for Server pages, include the version)`)
  }

  for (const name of schema.required) {
    if (!(name in attrs)) err(1, `missing required attribute :${name}:`)
  }

  for (const { name, line } of outside) {
    err(line, `:${name}: is outside the page header, so it isn't page metadata. Move it above the first blank line`)
  }

  for (const [name, prop] of Object.entries(schema.properties)) {
    if (!(name in attrs)) continue
    const { line } = attrs[name]
    // Version values are quoted in source by convention; the quotes aren't part of the value.
    const value = attrs[name].value.replace(/^"(.*)"$/, '$1')
    if (prop.minLength !== undefined && value.length < prop.minLength) {
      err(line, value.length === 0 ? `:${name}: is empty` : `:${name}: is ${value.length} characters, minimum is ${prop.minLength}`)
      continue
    }
    if (prop.maxLength !== undefined && value.length > prop.maxLength) {
      err(line, `:${name}: is ${value.length} characters, maximum is ${prop.maxLength}`)
    }
    if (prop.enum && !prop.enum.includes(value)) {
      err(line, `:${name}: "${value}" isn't allowed. Use one of: ${prop.enum.join(', ')}`)
    }
    if (prop.pattern && !new RegExp(prop.pattern).test(value)) {
      err(line, `:${name}: "${value}" doesn't match the schema pattern ${prop.pattern}`)
    }
  }

  // Rules the schema can't express.
  for (const name of LIST_FIELDS) {
    if (!(name in attrs)) continue
    const values = splitList(attrs[name].value)
    const dupes = values.filter((v, i) => values.indexOf(v) !== i)
    if (dupes.length) err(attrs[name].line, `:${name}: lists ${[...new Set(dupes)].join(', ')} more than once`)
  }

  const vcs = attrs['page-vcs']
  if (vcs) {
    const values = splitList(vcs.value)
    if (values.includes('all') && values.length > 1) err(vcs.line, ':page-vcs: "all" can\'t be combined with specific providers')
  }

  const plan = attrs['page-plan']
  if (plan) {
    const values = splitList(plan.value)
    const sorted = [...values].sort((a, b) => PLAN_ORDER.indexOf(a) - PLAN_ORDER.indexOf(b))
    if (values.join() !== sorted.join()) err(plan.line, `:page-plan: list plans in the order ${PLAN_ORDER.join(', ')}`)
  }

  const platform = attrs['page-platform'] ? splitList(attrs['page-platform'].value) : []
  if (platform.length && !platform.includes('Server')) {
    for (const name of ['page-server-min-version', 'page-server-deprecated-in']) {
      if (name in attrs) err(attrs[name].line, `:${name}: only applies when :page-platform: includes Server`)
    }
  }
  if (plan && platform.length && !platform.includes('Cloud')) {
    err(plan.line, ':page-plan: only applies to Cloud pages. Remove it from Server-only pages')
  }

  const lineOf = (e) => Number(e.slice(file.length + 1).split(':')[0])
  return errors.sort((a, b) => lineOf(a) - lineOf(b))
}

function main () {
  const schema = loadSchema()
  const args = process.argv.slice(2)
  const files = args.length
    ? args.map((f) => path.relative(ROOT, path.resolve(f)).split(path.sep).join('/'))
      .filter((f) => PAGE_RE.test(f) && !EXCLUDED.test(f) && fs.existsSync(path.join(ROOT, f)))
    : listAllPages()

  const descriptions = indexDescriptions()
  const errors = files.flatMap((f) => checkPage(f, schema, descriptions))
  errors.forEach((e) => console.error(e))
  const failed = new Set(errors.map((e) => e.split(':')[0])).size
  console.log(`check-metadata: ${files.length} pages checked, ${failed} with errors`)
  if (errors.length) {
    console.log('Attribute rules: schemas/docs-metadata.schema.json and the "Page Attributes" section of AGENTS.md')
    process.exit(1)
  }
}

main()
