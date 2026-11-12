#!/usr/bin/env node
'use strict'
// Checks CircleCI-provided names and versions in code examples against what CircleCI offers.
//
// Usage: node scripts/check-code-versions.js [--diff <diff-file>] <file>...
//
// With --diff, <diff-file> is a unified diff (for example from `gh pr diff`). Only lines the
// diff adds are checked, and files the diff does not touch are skipped. A file matches a diff
// path when it is the same path, ends with it, or has the same base name.
//
// Advisory only: always exits 0, because a docs example may pin an older version on purpose.
//   orbs             namespace/name@x.y.z   latest version from `circleci orb get`
//   cimg             cimg/image:x.y.z       newest Docker Hub tag in the same major version
//   resource class   resource_class: name   must be listed by the catalog API
//   machine image    image: ubuntu-2204:... must be listed by the catalog API
//   Xcode version    xcode: "15.3.0"        must be listed by the catalog API
// The catalog API is GET /api/v3/catalog/offerings, called with `circleci api`. It needs the CLI
// to be installed and authenticated. A lookup that fails is reported as unverified, never as current.

const fs = require('fs')
const path = require('path')
const { execFile } = require('child_process')
const { promisify } = require('util')

const run = promisify(execFile)

const ORB_RE = /\b([a-z0-9][a-z0-9-]*\/[a-z0-9][a-z0-9-]*)@(\d+(?:\.\d+){1,2})\b/g
const IMAGE_RE = /\bcimg\/([a-z0-9-]+):(\d+(?:\.\d+)*)(?![\w.-])/g
// Self-hosted runner classes (namespace/name) and pipeline parameters (<< >>) do not match.
const RESOURCE_CLASS_RE = /^\s*(?:-\s*)?resource_class:\s*["']?([A-Za-z0-9][\w.+-]*)["']?\s*(?:#.*)?$/
const MACHINE_IMAGE_RE = /^\s*(?:-\s*)?image:\s*["']?((?:ubuntu-\d{4}|android|windows-server-[\w-]+):[\w.-]+)["']?\s*(?:#.*)?$/
const XCODE_RE = /^\s*xcode:\s*["']?(\d[\d.]*)["']?\s*(?:#.*)?$/

const cache = new Map()
const memo = (key, fn) => {
  if (!cache.has(key)) cache.set(key, fn().catch(() => null))
  return cache.get(key)
}

const cli = async (...args) => (await run('circleci', args, { timeout: 30000 })).stdout

const parts = (v) => v.split('.').map(Number)
function newer (a, b) {
  const [x, y] = [parts(a), parts(b)]
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) > (y[i] || 0)
  }
  return false
}

const latestOrb = (name) => memo(`orb:${name}`, async () =>
  JSON.parse(await cli('orb', 'get', name, '--json')).latest_version)

const latestImage = (image, major) => memo(`cimg:${image}:${major}`, async () => {
  const url = `https://hub.docker.com/v2/repositories/cimg/${image}/tags?page_size=100&ordering=last_updated&name=${major}.`
  const tags = (await (await fetch(url)).json()).results.map((r) => r.name)
  const sameMajor = tags.filter((t) => /^\d+(\.\d+)*$/.test(t) && parts(t)[0] === major)
  return sameMajor.reduce((best, t) => (!best || newer(t, best) ? t : best), null)
})

// The response is { data: { attributes: { <executor>: { <resource class>: [<image>, ...] } } } }.
const catalog = () => memo('catalog', async () => {
  const executors = Object.values(JSON.parse(await cli('api', 'catalog/offerings')).data.attributes)
  return {
    resourceClasses: new Set(executors.flatMap((classes) => Object.keys(classes))),
    images: new Set(executors.flatMap((classes) => Object.values(classes).flat())),
  }
})

// Returns Map<path, Set<line number in the new file>> for the lines a unified diff adds.
function addedLines (diffText) {
  const added = new Map()
  let lines = null
  let n = 0
  for (const line of diffText.split('\n')) {
    const file = line.match(/^\+\+\+ (?:b\/)?(.+)$/)
    const hunk = line.match(/^@@ -\d+(?:,\d+)? \+(\d+)/)
    if (file) {
      lines = new Set()
      added.set(file[1], lines)
    } else if (hunk) {
      n = Number(hunk[1])
    } else if (lines && line.startsWith('+')) {
      lines.add(n++)
    } else if (lines && line.startsWith(' ')) {
      n++
    }
  }
  return added
}

const sameFile = (file, diffPath) =>
  file === diffPath || file.endsWith(`/${diffPath}`) || path.basename(file) === path.basename(diffPath)

async function main () {
  const args = process.argv.slice(2)
  const diffAt = args.indexOf('--diff')
  const added = diffAt === -1 ? null : addedLines(fs.readFileSync(args.splice(diffAt, 2)[1], 'utf8'))
  const findings = []
  for (const file of args) {
    let only = null
    if (added) {
      const match = [...added.keys()].find((p) => sameFile(file, p))
      if (!match) continue
      only = added.get(match)
    }
    const lines = fs.readFileSync(file, 'utf8').split('\n')
    for (const [i, line] of lines.entries()) {
      if (only && !only.has(i + 1)) continue
      const where = `${file}:${i + 1}`
      for (const [, name, pinned] of line.matchAll(ORB_RE)) {
        findings.push({ where, ref: `${name}@${pinned}`, pinned, latest: await latestOrb(name) })
      }
      for (const [, image, pinned] of line.matchAll(IMAGE_RE)) {
        findings.push({ where, ref: `cimg/${image}:${pinned}`, pinned, latest: await latestImage(image, parts(pinned)[0]) })
      }
      const offered = [
        [RESOURCE_CLASS_RE, 'resource class', (v, c) => c.resourceClasses.has(v)],
        [MACHINE_IMAGE_RE, 'machine image', (v, c) => c.images.has(v)],
        [XCODE_RE, 'Xcode version', (v, c) => c.images.has(`xcode:${v}`)],
      ]
      for (const [re, kind, isListed] of offered) {
        const match = line.match(re)
        if (!match) continue
        const cat = await catalog()
        findings.push({ where, ref: `${kind} ${match[1]}`, listed: cat ? isListed(match[1], cat) : null })
      }
    }
  }
  for (const { where, ref, pinned, latest, listed } of findings) {
    if (listed === false) console.log(`${where}: ${ref} is not in the CircleCI catalog`)
    else if (listed === null || (listed === undefined && !latest)) console.log(`${where}: ${ref} could not be verified`)
    else if (listed === undefined && newer(latest, pinned)) {
      const how = ref.startsWith('cimg/') ? 'has a newer tag in the same major version' : 'is behind the latest version'
      console.log(`${where}: ${ref} ${how}, ${latest}`)
    }
  }
  console.log(`Checked ${findings.length} item(s)${added ? ' on added lines' : ''} in ${args.length} file(s).`)
}

main()
