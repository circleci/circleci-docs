#!/usr/bin/env node

/**
 * Add CircleCI Server support notes to the API v2 OpenAPI spec.
 *
 * Reads openapi-server-support.json and puts each note at the start of the
 * matching operation or tag description, so the notes appear in the HTML
 * reference, the published openapi.json, and the LLM markdown.
 *
 * Notes are added to the start of the existing description. A JSON merge
 * patch cannot do this, because it replaces the whole description string.
 *
 * Usage:
 *   node scripts/apply-server-support-notes.js <spec.json> [notes.json]
 *
 * The spec file is updated in place. Unknown operation IDs or tags produce a
 * warning, not a failure, so an upstream rename does not block the build.
 */

const fs = require('fs')

const METHODS = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace']

function addNote (description, label, note) {
  const current = description || ''
  if (current.startsWith(label)) return current
  return current ? `${label} ${note}\n\n${current}` : `${label} ${note}`
}

function applyServerSupportNotes (spec, notes) {
  const label = notes.label
  const pending = new Set(Object.keys(notes.operations || {}))
  let operationCount = 0
  let tagCount = 0

  for (const pathItem of Object.values(spec.paths || {})) {
    for (const method of METHODS) {
      const operation = pathItem[method]
      if (!operation || !pending.has(operation.operationId)) continue
      operation.description = addNote(operation.description, label, notes.operations[operation.operationId])
      pending.delete(operation.operationId)
      operationCount++
    }
  }

  const missingTags = []
  for (const [name, note] of Object.entries(notes.tags || {})) {
    const tag = (spec.tags || []).find((t) => t.name === name)
    if (!tag) {
      missingTags.push(name)
      continue
    }
    tag.description = addNote(tag.description, label, note)
    tagCount++
  }

  return { operationCount, tagCount, missingOperations: [...pending], missingTags }
}

if (require.main === module) {
  const [specPath, notesPath = 'openapi-server-support.json'] = process.argv.slice(2)
  if (!specPath) {
    console.error('Usage: node scripts/apply-server-support-notes.js <spec.json> [notes.json]')
    process.exit(1)
  }

  const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'))
  const notes = JSON.parse(fs.readFileSync(notesPath, 'utf8'))
  const result = applyServerSupportNotes(spec, notes)
  fs.writeFileSync(specPath, JSON.stringify(spec, null, 2))

  console.log(`Added Server support notes to ${result.operationCount} operations and ${result.tagCount} tags`)
  for (const id of result.missingOperations) {
    console.warn(`⚠️  Server support note not applied: operationId "${id}" is not in the spec`)
  }
  for (const name of result.missingTags) {
    console.warn(`⚠️  Server support note not applied: tag "${name}" is not in the spec`)
  }
}

module.exports = { applyServerSupportNotes, addNote }
