'use strict'
const fs = require('fs')
const path = require('path')
const TurndownService = require('turndown')
const { parse: parseHTML } = require('node-html-parser')

module.exports.register = function () {
  this.on('contentClassified', ({ contentCatalog }) => {
    // Store pages for later processing
    this.pages = []

    contentCatalog.getComponents().forEach(({ versions }) => {
      versions.forEach(({ name: component, version }) => {
        const pages = contentCatalog
          .findBy({ component, version, family: 'page' })
          .filter(page => page.pub)

        this.pages.push(...pages)
      })
    })
  })

  this.on('beforePublish', ({ playbook }) => {
    const siteUrl = playbook.site.url.replace(/\/+$/, '') // Remove trailing slashes

    // Initialize Turndown service with custom configuration
    const turndownService = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
      fence: '```',
      emDelimiter: '_',
      strongDelimiter: '**',
      linkStyle: 'inlined'
    })

    // Custom rule to remove images
    turndownService.addRule('removeImages', {
      filter: 'img',
      replacement: function () {
        return ''
      }
    })

    // Custom rule to remove Mermaid diagrams
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
        return ''
      }
    })

    // Custom rule to clean up heading anchors
    turndownService.addRule('cleanHeadings', {
      filter: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
      replacement: function (content, node, options) {
        var hLevel = Number(node.nodeName.charAt(1))
        var hPrefix = ''
        for (var i = 0; i < hLevel; i++) {
          hPrefix += '#'
        }

        // Remove empty anchor links like [](#id) from the content
        var cleanContent = content.replace(/\[\]\(#[^)]*\)\s*/g, '').trim()

        return '\n\n' + hPrefix + ' ' + cleanContent + '\n\n'
      }
    })

    // Custom rule to preserve code block languages
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
        var className = node.firstChild.className || ''
        var language = (className.match(/language-(\S+)/) || [null, ''])[1]

        var code = node.firstChild.textContent
        var fenceChar = options.fence
        var fenceSize = 3
        var fenceInCodeRegex = new RegExp('^' + fenceChar + '{' + fenceSize + ',}', 'gm')

        var match
        while ((match = fenceInCodeRegex.exec(code))) {
          if (match[0].length >= fenceSize) {
            fenceSize = match[0].length + 1
          }
        }

        var fence = Array(fenceSize + 1).join(fenceChar)

        return (
          '\n\n' + fence + language + '\n' +
          code.replace(/\n$/, '') +
          '\n' + fence + '\n\n'
        )
      }
    })

    // Write to temp directory first, then copy to build later
    const tempDir = path.join(__dirname, '.temp', 'markdown')
    // Convert relative outputDir to absolute path to ensure it resolves correctly in CI
    const outputDir = path.resolve(playbook.output.dir)

    // Clean and recreate temp markdown directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true })
    }
    fs.mkdirSync(tempDir, { recursive: true })

    console.log(`Generating markdown files to temp: ${tempDir}`)
    console.log(`Pages to process: ${this.pages.length}`)
    let markdownCount = 0

    // Process all stored pages
    this.pages.forEach((page) => {
      // Get the page content (HTML) and extract only the article/doc content
      const fullHtml = page.contents.toString()
      const parsed = parseHTML(fullHtml)

      // Try to extract just the article or .doc content
      const article = parsed.querySelector('article.doc') ||
                      parsed.querySelector('.doc') ||
                      parsed.querySelector('article') ||
                      parsed.querySelector('main')

      if (article) {
        // Remove article metadata elements
        // The article-info-bar is the first div after the h1.page heading
        const h1 = article.querySelector('h1.page')
        if (h1) {
          // Get the next sibling that is a div (the metadata bar)
          let nextElement = h1.nextElementSibling
          while (nextElement) {
            if (nextElement.tagName === 'DIV' &&
                (nextElement.rawText || nextElement.innerHTML).includes('Contribute')) {
              nextElement.remove()
              break
            }
            // Also check if it's the metadata div (contains calendar icon, reading time, etc)
            if (nextElement.tagName === 'DIV' && nextElement.classList &&
                nextElement.classList.toString().includes('border-vapor')) {
              nextElement.remove()
              break
            }
            nextElement = nextElement.nextElementSibling
          }
        }

        // Remove any toolbar or metadata sections
        const toolbars = article.querySelectorAll('.toolbar, .page-versions, .edit-this-page')
        toolbars.forEach(el => el.remove())
      }

      const htmlContent = article ? article.innerHTML : fullHtml

      // Convert HTML to Markdown
      let markdown = turndownService.turndown(htmlContent)

      // Convert relative links to absolute URLs
      // Match markdown links: [text](url) where url is relative (starts with ./ or ../ or /)
      markdown = markdown.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
        // Skip if already absolute (http://, https://, mailto:, etc.)
        if (/^[a-z]+:/.test(url)) {
          return match
        }

        // Handle anchor links (keep as-is)
        if (url.startsWith('#')) {
          return match
        }

        // Convert relative URLs to absolute
        let absoluteUrl = url
        if (url.startsWith('/')) {
          // Already starts with /, just prepend site URL
          absoluteUrl = siteUrl + url
        } else if (url.startsWith('../') || url.startsWith('./')) {
          // Relative path - resolve based on current page URL
          const pageUrl = page.pub.url
          const pageDir = pageUrl.endsWith('/') ? pageUrl : pageUrl.substring(0, pageUrl.lastIndexOf('/') + 1)

          // Simple resolution: count ../ and navigate up
          let upCount = 0
          let cleanUrl = url
          while (cleanUrl.startsWith('../')) {
            upCount++
            cleanUrl = cleanUrl.substring(3)
          }
          if (cleanUrl.startsWith('./')) {
            cleanUrl = cleanUrl.substring(2)
          }

          // Navigate up from current page directory
          let basePath = pageDir.split('/').filter(p => p)
          for (let i = 0; i < upCount; i++) {
            basePath.pop()
          }

          absoluteUrl = siteUrl + '/' + basePath.join('/') + (basePath.length > 0 ? '/' : '') + cleanUrl
        } else {
          // Relative URL without ./ or ../
          const pageUrl = page.pub.url
          const pageDir = pageUrl.endsWith('/') ? pageUrl : pageUrl.substring(0, pageUrl.lastIndexOf('/') + 1)
          absoluteUrl = siteUrl + pageDir + url
        }

        return `[${text}](${absoluteUrl})`
      })

      // Clean up excessive newlines
      markdown = markdown.replace(/\n{3,}/g, '\n\n')

      // Construct path in temp directory matching the HTML file structure
      const pageUrl = page.pub.url
      let mdPath

      if (pageUrl.endsWith('/')) {
        // Handle indexified URLs (e.g., /path/ -> /path/index.md)
        mdPath = path.join(tempDir, pageUrl, 'index.md')
      } else if (pageUrl.endsWith('.html')) {
        // Replace .html with .md
        mdPath = path.join(tempDir, pageUrl.replace(/\.html$/, '.md'))
      } else {
        // Add .md extension
        mdPath = path.join(tempDir, pageUrl + '.md')
      }

      // Ensure directory exists
      const mdDir = path.dirname(mdPath)
      if (!fs.existsSync(mdDir)) {
        fs.mkdirSync(mdDir, { recursive: true })
      }

      // Write markdown file
      try {
        fs.writeFileSync(mdPath, markdown, 'utf8')
        markdownCount++
      } catch (err) {
        console.error(`Error writing ${mdPath}:`, err.message)
      }
    })

    console.log(`Generated ${markdownCount} markdown files in temp directory`)
    console.log(`Markdown files will need to be copied to ${outputDir} after Antora completes`)

    // Write metadata file for post-processing
    const metadataFile = path.join(__dirname, '.temp', 'markdown-meta.json')
    fs.writeFileSync(metadataFile, JSON.stringify({
      tempDir,
      outputDir,
      fileCount: markdownCount
    }, null, 2))
    console.log(`Markdown metadata written to ${metadataFile}`)
  })
}
