/**
 * Markdown Export Extension for Antora
 *
 * This Antora extension converts the generated HTML documentation pages into
 * Markdown format, making each page available as a downloadable .md file.
 *
 * Purpose:
 * - Provides markdown versions of all documentation pages
 * - Converts HTML to clean, readable markdown
 * - Preserves code blocks with language syntax highlighting
 * - Converts relative links to absolute URLs
 * - Removes UI elements (images, diagrams, metadata bars)
 *
 * How it works:
 * 1. Collects all pages during 'contentClassified' event
 * 2. Converts HTML to Markdown during 'beforePublish' event
 * 3. Writes .md files to temp directory
 * 4. Post-build script copies them to final output directory
 */

'use strict'
const fs = require('fs')
const path = require('path')
const TurndownService = require('turndown') // HTML to Markdown converter
const { parse: parseHTML } = require('node-html-parser') // HTML parser

module.exports.register = function () {
  /**
   * EVENT 1: contentClassified
   *
   * This event fires after Antora has classified all content but before
   * it starts generating the site. We use it to collect all pages that
   * need to be converted to Markdown.
   */
  this.on('contentClassified', ({ contentCatalog }) => {
    // Initialize array to store all pages for later processing
    this.pages = []

    // Iterate through all components (guides, reference, orbs, etc.)
    contentCatalog.getComponents().forEach(({ versions }) => {
      // For each version of each component
      versions.forEach(({ name: component, version }) => {
        // Find all pages in this component/version that will be published
        const pages = contentCatalog
          .findBy({ component, version, family: 'page' })
          .filter(page => page.pub) // Only include pages that will be published

        // Add these pages to our collection
        this.pages.push(...pages)
      })
    })
  })

  /**
   * EVENT 2: beforePublish
   *
   * This event fires after HTML is generated but before the site is published.
   * We use it to convert all collected pages to Markdown format.
   */
  this.on('beforePublish', ({ playbook }) => {
    // Get the site URL and remove any trailing slashes
    const siteUrl = playbook.site.url.replace(/\/+$/, '')

    /**
     * TURNDOWN CONFIGURATION
     *
     * Turndown is the library that converts HTML to Markdown.
     * Configure it to produce clean, consistent markdown.
     */
    const turndownService = new TurndownService({
      headingStyle: 'atx',        // Use # for headings (not underlines)
      codeBlockStyle: 'fenced',   // Use ``` for code blocks (not indentation)
      fence: '```',               // Fence character for code blocks
      emDelimiter: '_',           // Use _ for emphasis (not *)
      strongDelimiter: '**',      // Use ** for bold
      linkStyle: 'inlined'        // Use [text](url) format (not reference style)
    })

    /**
     * CUSTOM RULE: Remove Images
     *
     * Images don't translate well to markdown exports, so we remove them.
     * Users viewing the markdown online can see images on the actual site.
     */
    turndownService.addRule('removeImages', {
      filter: 'img',
      replacement: function () {
        return '' // Replace all images with empty string
      }
    })

    /**
     * CUSTOM RULE: Remove Mermaid Diagrams
     *
     * Mermaid diagrams are rendered as SVG/canvas in HTML but don't
     * export well to markdown. Remove them from the export.
     */
    turndownService.addRule('removeMermaid', {
      filter: function (node) {
        return (
          node.nodeName === 'DIV' &&
          (node.classList.contains('mermaid') ||
           node.classList.contains('mermaidTooltip') ||
           node.classList.contains('openblock'))
        )
      },
      replacement: function () {
        return '' // Replace diagrams with empty string
      }
    })

    /**
     * CUSTOM RULE: Clean Up Headings
     *
     * AsciiDoc/Antora adds anchor links to headings (for linking to sections).
     * These appear as empty markdown links [](#id) which we want to remove.
     */
    turndownService.addRule('cleanHeadings', {
      filter: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
      replacement: function (content, node, options) {
        // Get heading level (h1 = 1, h2 = 2, etc.)
        var hLevel = Number(node.nodeName.charAt(1))

        // Build the markdown prefix (# for h1, ## for h2, etc.)
        var hPrefix = ''
        for (var i = 0; i < hLevel; i++) {
          hPrefix += '#'
        }

        // Remove empty anchor links like [](#introduction) from the heading text
        var cleanContent = content.replace(/\[\]\(#[^)]*\)\s*/g, '').trim()

        // Return properly formatted markdown heading with blank lines
        return '\n\n' + hPrefix + ' ' + cleanContent + '\n\n'
      }
    })

    /**
     * CUSTOM RULE: Preserve Code Block Languages
     *
     * Ensure code blocks maintain their syntax highlighting language.
     * For example, ```javascript or ```yaml
     */
    turndownService.addRule('fencedCodeBlock', {
      filter: function (node, options) {
        return (
          options.codeBlockStyle === 'fenced' &&
          node.nodeName === 'PRE' &&
          node.firstChild &&
          node.firstChild.nodeName === 'CODE'
        )
      },
      replacement: function (content, node, options) {
        // Extract language from class name (e.g., "language-javascript")
        var className = node.firstChild.className || ''
        var language = (className.match(/language-(\S+)/) || [null, ''])[1]

        // Get the actual code content
        var code = node.firstChild.textContent
        var fenceChar = options.fence
        var fenceSize = 3

        // Check if the code contains ``` and adjust fence size if needed
        // (prevents breaking out of the code block)
        var fenceInCodeRegex = new RegExp('^' + fenceChar + '{' + fenceSize + ',}', 'gm')

        var match
        while ((match = fenceInCodeRegex.exec(code))) {
          if (match[0].length >= fenceSize) {
            fenceSize = match[0].length + 1
          }
        }

        // Create fence with appropriate length
        var fence = Array(fenceSize + 1).join(fenceChar)

        // Return formatted code block with language
        return (
          '\n\n' + fence + language + '\n' +
          code.replace(/\n$/, '') +
          '\n' + fence + '\n\n'
        )
      }
    })

    /**
     * DIRECTORY SETUP
     *
     * Create temporary directory for markdown files. We can't write directly
     * to the output directory yet because Antora hasn't finished building.
     * A post-build script will copy these files to the final location.
     */
    const tempDir = path.join(__dirname, '.temp', 'markdown')
    // Convert relative outputDir to absolute path for CI compatibility
    const outputDir = path.resolve(playbook.output.dir)

    // Clean up any existing temp markdown directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true })
    }
    fs.mkdirSync(tempDir, { recursive: true })

    console.log(`Generating markdown files to temp: ${tempDir}`)
    console.log(`Pages to process: ${this.pages.length}`)
    let markdownCount = 0

    /**
     * PROCESS ALL PAGES
     *
     * Convert each HTML page to Markdown and write to temp directory.
     */
    this.pages.forEach((page) => {
      /**
       * EXTRACT ARTICLE CONTENT
       *
       * Parse the HTML and extract just the main article content,
       * ignoring navigation, sidebars, footers, etc.
       */
      const fullHtml = page.contents.toString()
      const parsed = parseHTML(fullHtml)

      // Find the main article content (try multiple selectors)
      const article = parsed.querySelector('article.doc') ||
                      parsed.querySelector('.doc') ||
                      parsed.querySelector('article') ||
                      parsed.querySelector('main')

      if (article) {
        /**
         * REMOVE METADATA ELEMENTS
         *
         * Remove the article info bar (last updated, reading time, etc.)
         * and other UI elements that aren't relevant to markdown export.
         */
        const h1 = article.querySelector('h1.page')
        if (h1) {
          // Find the metadata bar (the div after the h1)
          let nextElement = h1.nextElementSibling
          while (nextElement) {
            // Check if this is the info bar with Contribute link
            if (nextElement.tagName === 'DIV' &&
                (nextElement.rawText || nextElement.innerHTML).includes('Contribute')) {
              nextElement.remove()
              break
            }
            // Also check if it's the info bar with border-vapor styling
            if (nextElement.tagName === 'DIV' && nextElement.classList &&
                nextElement.classList.toString().includes('border-vapor')) {
              nextElement.remove()
              break
            }
            nextElement = nextElement.nextElementSibling
          }
        }

        // Remove toolbars and edit links
        const toolbars = article.querySelectorAll('.toolbar, .page-versions, .edit-this-page')
        toolbars.forEach(el => el.remove())
      }

      // Get the cleaned HTML content
      const htmlContent = article ? article.innerHTML : fullHtml

      /**
       * CONVERT HTML TO MARKDOWN
       *
       * Use Turndown service with our custom rules to convert HTML to markdown.
       */
      let markdown = turndownService.turndown(htmlContent)

      /**
       * CONVERT RELATIVE LINKS TO ABSOLUTE URLS
       *
       * Markdown files can be viewed anywhere (locally, in editors, etc.)
       * so we need to convert all relative links to absolute URLs pointing
       * to the live documentation site.
       *
       * Examples:
       * - ./intro.adoc -> https://circleci.com/docs/guides/intro/
       * - ../config.adoc -> https://circleci.com/docs/reference/config/
       * - /docs/page -> https://circleci.com/docs/page
       */
      markdown = markdown.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
        // Skip if already absolute (http://, https://, mailto:, etc.)
        if (/^[a-z]+:/.test(url)) {
          return match
        }

        // Keep anchor links (e.g., #section-name) as-is
        if (url.startsWith('#')) {
          return match
        }

        // Convert relative URLs to absolute
        let absoluteUrl = url
        if (url.startsWith('/')) {
          // URL starts with / - just prepend site domain
          absoluteUrl = siteUrl + url
        } else if (url.startsWith('../') || url.startsWith('./')) {
          // Relative path - resolve based on current page URL
          const pageUrl = page.pub.url
          const pageDir = pageUrl.endsWith('/') ? pageUrl : pageUrl.substring(0, pageUrl.lastIndexOf('/') + 1)

          // Count how many directories to go up (../)
          let upCount = 0
          let cleanUrl = url
          while (cleanUrl.startsWith('../')) {
            upCount++
            cleanUrl = cleanUrl.substring(3)
          }
          // Remove leading ./
          if (cleanUrl.startsWith('./')) {
            cleanUrl = cleanUrl.substring(2)
          }

          // Navigate up from current page directory
          let basePath = pageDir.split('/').filter(p => p)
          for (let i = 0; i < upCount; i++) {
            basePath.pop()
          }

          // Construct absolute URL
          absoluteUrl = siteUrl + '/' + basePath.join('/') + (basePath.length > 0 ? '/' : '') + cleanUrl
        } else {
          // Relative URL without ./ or ../ - resolve relative to current page
          const pageUrl = page.pub.url
          const pageDir = pageUrl.endsWith('/') ? pageUrl : pageUrl.substring(0, pageUrl.lastIndexOf('/') + 1)
          absoluteUrl = siteUrl + pageDir + url
        }

        return `[${text}](${absoluteUrl})`
      })

      /**
       * CLEAN UP FORMATTING
       *
       * Remove excessive blank lines (more than 2 consecutive newlines).
       */
      markdown = markdown.replace(/\n{3,}/g, '\n\n')

      /**
       * CONSTRUCT OUTPUT PATH
       *
       * Create markdown file path matching the HTML structure.
       * Examples:
       * - /guides/intro/ -> /guides/intro/index.md
       * - /reference/config.html -> /reference/config.md
       */
      const pageUrl = page.pub.url
      let mdPath

      if (pageUrl.endsWith('/')) {
        // Indexified URL (pretty URLs) -> create index.md
        mdPath = path.join(tempDir, pageUrl, 'index.md')
      } else if (pageUrl.endsWith('.html')) {
        // Replace .html extension with .md
        mdPath = path.join(tempDir, pageUrl.replace(/\.html$/, '.md'))
      } else {
        // Add .md extension
        mdPath = path.join(tempDir, pageUrl + '.md')
      }

      /**
       * WRITE MARKDOWN FILE
       *
       * Create directory if needed and write the markdown content.
       */
      const mdDir = path.dirname(mdPath)
      if (!fs.existsSync(mdDir)) {
        fs.mkdirSync(mdDir, { recursive: true })
      }

      try {
        fs.writeFileSync(mdPath, markdown, 'utf8')
        markdownCount++
      } catch (err) {
        console.error(`Error writing ${mdPath}:`, err.message)
      }
    })

    console.log(`Generated ${markdownCount} markdown files in temp directory`)
    console.log(`Markdown files will need to be copied to ${outputDir} after Antora completes`)

    /**
     * WRITE METADATA FILE
     *
     * Store information about where files need to be copied.
     * The post-build script reads this file to know what to do.
     */
    const metadataFile = path.join(__dirname, '.temp', 'markdown-meta.json')
    fs.writeFileSync(metadataFile, JSON.stringify({
      tempDir,      // Where markdown files are now
      outputDir,    // Where they need to be copied
      fileCount: markdownCount
    }, null, 2))
    console.log(`Markdown metadata written to ${metadataFile}`)
  })
}
