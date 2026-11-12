#!/usr/bin/env node
'use strict'
// Reports pinned orb and cimg versions in code examples that are behind the latest release.
//
// Usage: node scripts/check-code-versions.js [--diff <diff-file>] <file>...
//
// With --diff, <diff-file> is a unified diff (for example from `gh pr diff`). Only lines the
// diff adds are checked, and files the diff does not touch are skipped. A file matches a diff
// path when it is the same path, ends with it, or has the same base name.
//
// Advisory only: always exits 0, because a docs example may pin an older version on purpose.
//   orbs   namespace/name@x.y.z   compared with the latest version in the orb registry
//   cimg   cimg/image:x.y.z       compared with the newest tag on Docker Hub in the same major version
// A lookup that fails is reported as unverified, never as current.

const fs = require('fs')
const path = require('path')

const ORB_RE = /\b([a-z0-9][a-z0-9-]*\/[a-z0-9][a-z0-9-]*)@(\d+(?:\.\d+){1,2})\b/g
const IMAGE_RE = /\bcimg\/([a-z0-9-]+):(\d+(?:\.\d+)*)(?![\w.-])/g

const cache = new Map()
const memo = (key, fn) => {
  if (!cache.has(key)) cache.set(key, fn().catch(() => null))
  return cache.get(key)
}

const parts = (v) => v.split('.').map(Number)
function newer (a, b) {
  const [x, y] = [parts(a), parts(b)]
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) > (y[i] || 0)
  }
  return false
}

const latestOrb = (name) => memo(`orb:${name}`, async () => {
  const res = await fetch('https://circleci.com/graphql-unstable', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: `{ orb(name: "${name}") { versions(count: 1) { version } } }` }),
  })
  return (await res.json()).data.orb.versions[0].version
})

const latestImage = (image, major) => memo(`cimg:${image}:${major}`, async () => {
  const url = `https://hub.docker.com/v2/repositories/cimg/${image}/tags?page_size=100&ordering=last_updated&name=${major}.`
  const tags = (await (await fetch(url)).json()).results.map((r) => r.name)
  const sameMajor = tags.filter((t) => /^\d+(\.\d+)*$/.test(t) && parts(t)[0] === major)
  return sameMajor.reduce((best, t) => (!best || newer(t, best) ? t : best), null)
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
      for (const [, name, pinned] of line.matchAll(ORB_RE)) {
        const latest = await latestOrb(name)
        findings.push({ where: `${file}:${i + 1}`, ref: `${name}@${pinned}`, pinned, latest })
      }
      for (const [, image, pinned] of line.matchAll(IMAGE_RE)) {
        const latest = await latestImage(image, parts(pinned)[0])
        findings.push({ where: `${file}:${i + 1}`, ref: `cimg/${image}:${pinned}`, pinned, latest })
      }
    }
  }
  for (const { where, ref, pinned, latest } of findings) {
    if (!latest) console.log(`${where}: ${ref} could not be verified`)
    else if (newer(latest, pinned)) {
      const how = ref.startsWith('cimg/') ? 'has a newer tag in the same major version' : 'is behind the latest version'
      console.log(`${where}: ${ref} ${how}, ${latest}`)
    }
  }
  console.log(`Checked ${findings.length} pinned version(s)${added ? ' on added lines' : ''} in ${args.length} file(s).`)
}

main()
