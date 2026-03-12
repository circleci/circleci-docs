/**
 * Beautiful Mermaid Extension for Antora
 *
 * Renders Mermaid diagrams at build time with dual SVG variants (light + dark themes).
 * Supports CircleCI brand colors and instant theme switching without re-rendering.
 *
 * THEME CONFIGURATION:
 * See lines 62-75 below to switch between built-in themes and custom colors.
 *
 * Built-in themes available:
 * - Light: github-light, zinc-light, catppuccin-latte, nord-light, tokyo-night-light, solarized-light
 * - Dark: github-dark, zinc-dark, catppuccin-mocha, nord, tokyo-night, tokyo-night-storm, dracula, one-dark, solarized-dark
 *
 * To use built-in themes:
 * 1. Set USE_BUILTIN_THEMES = true (line 67)
 * 2. Uncomment and set LIGHT_THEME_NAME and DARK_THEME_NAME (lines 68-69)
 * 3. Rebuild: npm run build:ui && npm run build:docs
 *
 * To customize colors:
 * 1. Keep USE_BUILTIN_THEMES = false
 * 2. Edit the lightTheme and darkTheme objects (lines 74-94)
 * 3. Rebuild: npm run build:ui && npm run build:docs
 */

'use strict'

const { execSync } = require('child_process')
const { writeFileSync, unlinkSync, existsSync, mkdirSync } = require('fs')
const path = require('path')

// Path to the ES module helper
const HELPER_PATH = path.join(__dirname, 'mermaid-renderer.mjs')
const TEMP_DIR = path.join(__dirname, '.temp')

// Ensure temp directory exists
if (!existsSync(TEMP_DIR)) {
  mkdirSync(TEMP_DIR, { recursive: true })
}

/**
 * Render a Mermaid diagram using beautiful-mermaid via a helper process
 */
function renderMermaidSVG(source, options, themeName = null) {
  const tmpInput = path.join(TEMP_DIR, `mermaid-input-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.json`)

  const payload = { source, options }
  if (themeName) {
    payload.themeName = themeName
  }

  writeFileSync(tmpInput, JSON.stringify(payload))

  try {
    const output = execSync(`node "${HELPER_PATH}" "${tmpInput}"`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    })

    unlinkSync(tmpInput)

    const result = JSON.parse(output)
    if (result.success) {
      return result.svg
    } else {
      throw new Error(result.error || 'Unknown error rendering Mermaid')
    }
  } catch (err) {
    if (existsSync(tmpInput)) {
      unlinkSync(tmpInput)
    }
    // If the error has stderr output, include it
    if (err.stderr) {
      throw new Error(`Mermaid rendering failed: ${err.stderr}`)
    }
    throw err
  }
}

module.exports.register = function register(registry, context = {}) {
  // ===========================================
  // THEME CONFIGURATION
  // ===========================================
  // Choose between built-in themes or custom colors

  // Option 1: Use Beautiful Mermaid's built-in themes
  // Uncomment these lines to use built-in themes:
  // const USE_BUILTIN_THEMES = true
  // const LIGHT_THEME_NAME = 'github-light'  // or: zinc-light, catppuccin-latte, nord-light, tokyo-night-light, solarized-light
  // const DARK_THEME_NAME = 'github-dark'    // or: zinc-dark, catppuccin-mocha, nord, tokyo-night, tokyo-night-storm, dracula, one-dark, solarized-dark

  // Option 2: Use custom CircleCI brand colors (CURRENT)
  const USE_BUILTIN_THEMES = false

  // CircleCI brand theme configurations
  // Light theme uses CircleCI green (#008542) as accent
  const lightTheme = {
    bg: '#ffffff',
    fg: '#00381A',
    accent: '#008542',
    line: '#B4B8C6',
    muted: '#E3F5E5B2',
    border: '#008542'
  }

  // Dark theme uses lighter green for better contrast
  const darkTheme = {
    bg: '#0D1423',
    fg: '#D7DBE3',
    accent: '#94E5AB',
    line: '#3D4A5E',
    muted: '#565f89'
  }

  // Register the block processor for [mermaid] blocks
  registry.block('mermaid', function () {
    const self = this
    self.onContext('listing')
    self.positionalAttributes(['target', 'format'])

    self.process(function (parent, reader, attrs) {
      const mermaidSource = reader.getLines().join('\n')

      try {
        let lightSVG, darkSVG

        if (USE_BUILTIN_THEMES) {
          // Use Beautiful Mermaid's built-in themes
          lightSVG = renderMermaidSVG(mermaidSource, null, LIGHT_THEME_NAME)
          darkSVG = renderMermaidSVG(mermaidSource, null, DARK_THEME_NAME)
        } else {
          // Use custom CircleCI brand colors
          // Beautiful Mermaid uses a simple format: { bg, fg, accent, line }
          lightSVG = renderMermaidSVG(mermaidSource, {
            bg: lightTheme.bg,
            fg: lightTheme.fg,
            accent: lightTheme.accent,
            line: lightTheme.line
          })

          darkSVG = renderMermaidSVG(mermaidSource, {
            bg: darkTheme.bg,
            fg: darkTheme.fg,
            accent: darkTheme.accent,
            line: darkTheme.line
          })
        }

        // Escape the mermaid source for data attribute
        const escapedSource = mermaidSource
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')

        // Build HTML with both SVG variants
        let html = `<div class="mermaid-diagram-container" data-mermaid-source="${escapedSource}">`
        html += `<div class="mermaid-content diagram-light">${lightSVG}</div>`
        html += `<div class="mermaid-content diagram-dark">${darkSVG}</div>`
        html += `</div>`

        // Add title below diagram if present (matches image caption behavior)
        if (attrs.title) {
          html += `<div class="title">${attrs.title}</div>`
        }

        // Create pass-through block with the rendered HTML
        return self.createBlock(parent, 'pass', html, attrs)

      } catch (error) {
        console.error('Error rendering Mermaid diagram:', error)

        // Fallback: return error message
        const errorHtml = `<div class="mermaid-diagram-container error">
          <pre style="color: red; border: 1px solid red; padding: 1rem; background: #fff8f8;">
Error rendering Mermaid diagram: ${error.message}

Source:
${mermaidSource}
          </pre>
        </div>`

        return self.createBlock(parent, 'pass', errorHtml, attrs)
      }
    })
  })
}
