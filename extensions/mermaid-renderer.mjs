/**
 * ES Module wrapper for Beautiful Mermaid
 * This helper script renders Mermaid diagrams using beautiful-mermaid
 * and outputs JSON to stdout for consumption by the CommonJS extension
 */

import { renderMermaidSVG, THEMES } from 'beautiful-mermaid'
import { readFileSync } from 'fs'

// Read input from file path provided as argument
const inputPath = process.argv[2]
const input = JSON.parse(readFileSync(inputPath, 'utf8'))

try {
  let options = input.options

  // If a theme name is specified, use the built-in theme
  if (input.themeName && THEMES[input.themeName]) {
    options = THEMES[input.themeName]
  }

  const svg = renderMermaidSVG(input.source, options)
  process.stdout.write(JSON.stringify({ success: true, svg }))
} catch (error) {
  process.stdout.write(JSON.stringify({
    success: false,
    error: error.message,
    stack: error.stack
  }))
  process.exit(1)
}
