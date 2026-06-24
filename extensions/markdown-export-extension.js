/**
 * Markdown Export Extension for Antora
 *
 * This Antora extension converts the generated documentation pages into
 * Markdown format, making each page available as a downloadable .md file.
 *
 * Purpose:
 * - Provides markdown versions of all documentation pages
 * - Converts HTML to clean, readable markdown
 * - Preserves code blocks with language syntax highlighting
 * - Converts relative links to absolute URLs
 * - Removes UI elements (images, diagrams)
 *
 * How it works:
 * 1. Hooks the 'documentsConverted' event. At this point Antora has converted
 *    each page's AsciiDoc into an *embeddable HTML body* (page.contents), but
 *    has NOT yet wrapped it in the site layout (header, nav, footer, the
 *    article info bar, toolbars, etc. — those are added later, at
 *    'pagesComposed'). Working from the pre-composition body means we never
 *    have to find and strip the site chrome by hand.
 * 2. For each page: parse the body, run DOM pre-passes (remove inline images,
 *    convert data tables, mermaid, and tabs), convert the result to Markdown
 *    with Turndown, swap structured blocks back in, rewrite links, and write
 *    the .md file to a temp directory.
 * 3. A post-build script (gulp.d/tasks/build-site.js) copies them to the final
 *    output directory once Antora finishes publishing.
 *
 * Tables and tabs use a "placeholder" pattern: the block is converted to
 * Markdown during the DOM pass (calling Turndown on each cell/panel), stashed
 * behind a token, and the token is swapped back in after the main Turndown pass
 * so its Markdown isn't re-escaped. Complex tables are instead kept as HTML and
 * emitted verbatim via the keepDataTables rule.
 *
 * MAINTAINER NOTE — possible future refactor:
 * The placeholder pattern means Turndown is invoked many times per page (once
 * for the whole body, plus once per simple-table cell, per tab panel, and for
 * the title). It is correct and the full-site build time is fine, but if build
 * time or readability ever becomes a concern, the cleaner design is to mark
 * simple tables/tabs in the DOM and register *scoped* Turndown rules for
 * table/tr/td (and the tab wrappers) that emit GFM in the single page-level
 * Turndown pass — no per-cell calls, no placeholders. This is roughly what
 * turndown-plugin-gfm does; we avoid that plugin because its global table rules
 * and its keep() for header-less tables capture Asciidoctor admonition blocks
 * (NOTE/TIP/WARNING, also rendered as <table>) and dump them as raw HTML, so a
 * scoped/hand-rolled version would be required.
 */

'use strict'
const fs = require('fs')
const path = require('path')
const TurndownService = require('turndown') // HTML to Markdown converter
const { parse: parseHTML } = require('node-html-parser') // HTML parser

module.exports.register = function () {
  /**
   * EVENT: documentsConverted
   *
   * Fires after every page's AsciiDoc has been converted to embeddable HTML
   * but before the UI layout is applied. page.contents holds just the document
   * body, so there is no site chrome to remove.
   */
  this.on('documentsConverted', ({ playbook, contentCatalog }) => {
    // Get the site URL and remove any trailing slashes
    const siteUrl = playbook.site.url.replace(/\/+$/, '')

    /**
     * URL RESOLVER
     *
     * Resolve a possibly-relative link to an absolute docs URL so markdown
     * files work when viewed outside the site. Already-absolute links (with a
     * scheme such as http: or mailto:) and pure anchor links are returned
     * unchanged. Used both for markdown links and for links inside HTML tables.
     */
    const absolutizeUrl = (url, pageUrl) => {
      // Already absolute (http://, https://, mailto:, etc.) or a pure anchor
      if (/^[a-z]+:/.test(url) || url.startsWith('#')) {
        return url
      }
      // Root-relative - just prepend the site domain
      if (url.startsWith('/')) {
        return siteUrl + url
      }
      const pageDir = pageUrl.endsWith('/')
        ? pageUrl
        : pageUrl.substring(0, pageUrl.lastIndexOf('/') + 1)
      if (url.startsWith('../') || url.startsWith('./')) {
        // Relative path - walk up from the current page directory
        let upCount = 0
        let cleanUrl = url
        while (cleanUrl.startsWith('../')) {
          upCount++
          cleanUrl = cleanUrl.substring(3)
        }
        if (cleanUrl.startsWith('./')) {
          cleanUrl = cleanUrl.substring(2)
        }
        const basePath = pageDir.split('/').filter(p => p)
        for (let i = 0; i < upCount; i++) {
          basePath.pop()
        }
        return siteUrl + '/' + basePath.join('/') + (basePath.length > 0 ? '/' : '') + cleanUrl
      }
      // Bare relative URL - resolve against the current page directory
      return siteUrl + pageDir + url
    }

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
     * KEEP COMPLEX TABLES AS HTML
     *
     * Markdown table syntax can only hold single-line cells. Simple tables are
     * turned into GFM markdown tables in the per-page DOM pass below, but
     * CircleCI tables frequently put lists, multiple paragraphs, or code blocks
     * inside cells, and those can't be represented as a markdown table, so we
     * keep them as HTML. Such tables are marked with data-md-keep in the DOM
     * pass and emitted verbatim by this rule.
     *
     * Admonition blocks (NOTE/TIP/WARNING), which Asciidoctor also renders as
     * <table>, are never marked and have no table rule, so they flatten to text
     * via Turndown's default handling.
     */
    turndownService.addRule('keepDataTables', {
      filter: function (node) {
        return node.nodeName === 'TABLE' && node.hasAttribute('data-md-keep')
      },
      replacement: function (content, node) {
        node.removeAttribute('data-md-keep')
        return '\n\n' + node.outerHTML + '\n\n'
      }
    })

    /**
     * BUILD A GFM MARKDOWN TABLE
     *
     * Convert a simple data table (inline-only cells, with a heading row) to a
     * GitHub-flavored markdown table. Each cell's inline content is converted
     * with Turndown and forced onto a single line: hard line breaks (<br>) are
     * preserved as a literal <br> (which GFM renders as a line break within a
     * cell), any other stray newlines are collapsed to spaces, and pipes are
     * escaped so they don't break columns.
     */
    const buildGfmTable = (table) => {
      const cellToMarkdown = (cellEl) => {
        // Protect <br> from Turndown (which would turn it into a newline that
        // breaks the row); restore it as a literal <br> after conversion.
        const html = cellEl.innerHTML.replace(/<br\s*\/?>/gi, '{X-BR-X}')
        return turndownService
          .turndown(html)
          .replace(/\s*\n+\s*/g, ' ')          // collapse stray line breaks to a space
          .replace(/\s*\{X-BR-X\}\s*/g, '<br>') // restore hard line breaks (no padding)
          .replace(/\|/g, '\\|')               // escape pipes so columns survive
          .trim()
      }

      const rowToMarkdown = (tr) => {
        const cellsMd = tr.querySelectorAll('th, td').map(cellToMarkdown)
        return '| ' + cellsMd.join(' | ') + ' |'
      }

      const headRow = table.querySelector('thead tr')
      const columnCount = headRow.querySelectorAll('th, td').length
      const lines = [
        rowToMarkdown(headRow),
        '| ' + Array(columnCount).fill('---').join(' | ') + ' |'
      ]
      table.querySelectorAll('tbody tr').forEach(tr => lines.push(rowToMarkdown(tr)))
      return lines.join('\n')
    }

    /**
     * CUSTOM RULE: Replace Images With Alt Text
     *
     * By the time Turndown runs, inline images and icons have been removed from
     * the DOM, so this only sees block images (image::foo[]). The image binary
     * isn't useful in a markdown export, but its alt text usually describes what
     * the image shows, so surface that as a labeled blockquote block for readers
     * (and LLMs). Images without usable alt text are dropped, to avoid emitting
     * empty "Image:" blocks.
     */
    turndownService.addRule('imageAltText', {
      filter: 'img',
      replacement: function (content, node) {
        const alt = (node.getAttribute('alt') || '').trim()
        if (!alt) {
          return '' // No alt text to surface - drop the image
        }
        return '\n\n> **Image:** ' + alt + '\n\n'
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
        var codeEl = node.firstChild

        // Asciidoctor/shiki put the language in data-lang (e.g. data-lang="yaml");
        // fall back to a "language-xxx" class for any other source.
        var className = codeEl.getAttribute('class') || ''
        var language =
          codeEl.getAttribute('data-lang') ||
          (className.match(/language-(\S+)/) || [null, ''])[1] ||
          ''

        // Get the actual code content (textContent strips shiki's highlight spans)
        var code = codeEl.textContent

        // Use a backtick fence at least three long, widened if the code itself
        // contains a longer run of backticks so it can't break out of the block.
        var longestBacktickRun = (code.match(/`+/g) || [])
          .reduce(function (max, run) { return Math.max(max, run.length) }, 0)
        var fence = '`'.repeat(Math.max(3, longestBacktickRun + 1))

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

    /**
     * COLLECT PAGES
     *
     * Gather every publishable page across all components/versions. The `pub`
     * property (and `pub.url`) is assigned during classification, which runs
     * before this event, so it is available here.
     */
    const pages = contentCatalog
      .findBy({ family: 'page' })
      .filter(page => page.pub)

    console.log(`Generating markdown files to temp: ${tempDir}`)
    console.log(`Pages to process: ${pages.length}`)
    let markdownCount = 0

    /**
     * PROCESS ALL PAGES
     *
     * Convert each page's HTML body to Markdown and write to temp directory.
     */
    pages.forEach((page) => {
      /**
       * PARSE THE DOCUMENT BODY
       *
       * page.contents is the embeddable HTML body (no site chrome). We still
       * parse it so we can flatten interactive elements (tabs) and convert
       * mermaid diagrams before handing it to Turndown.
       */
      const parsed = parseHTML(page.contents.toString())

      /**
       * REMOVE INLINE IMAGES AND ICONS
       *
       * Asciidoctor renders inline images (the image:foo[] macro, including the
       * theme-aware icons from theme-icon-extension) as <span class="image">,
       * while block images (image::foo[]) render as <div class="imageblock">.
       * Inline images and icons are decorative in a markdown export, so drop
       * them entirely. Block images are kept and surfaced as alt text below.
       */
      parsed.querySelectorAll('span.image').forEach(el => el.remove())

      /**
       * CONVERT DATA TABLES
       *
       * Each Asciidoctor data table (table.tableblock) is either converted to a
       * GFM markdown table (if it is simple) or kept as HTML (if it is complex).
       * Admonition blocks, which Asciidoctor also renders as <table>, are not
       * table.tableblock, so they are left alone and flatten to text.
       *
       * Common tidy-up for both paths:
       * - remove <colgroup> column-width definitions
       * - unwrap cells whose only child is a <p>, so a "simple" cell holds
       *   inline content directly (which both markdown tables and the HTML
       *   path render cleanly), while cells with lists/blocks keep them
       *
       * A table is "simple" when it has a heading row (GFM tables require one)
       * and every cell holds only inline content: no lists, nested tables, code
       * blocks, multiple paragraphs, or spanned cells (colspan/rowspan), none of
       * which a markdown table cell can represent. Hard line breaks (<br>) are
       * allowed - buildGfmTable keeps them as literal <br>, which GFM renders as
       * a line break inside a cell. Anything else is kept as HTML.
       *
       * Simple tables are converted to markdown now and stashed behind a
       * placeholder, which is swapped back in after Turndown runs (so the cell
       * markdown isn't re-escaped, and in-table links still get absolutized).
       * Complex tables are kept as HTML: we strip presentational class/style
       * (preserving structural colspan/rowspan), absolutize their links (kept
       * HTML bypasses the markdown link rewriting), and mark them data-md-keep.
       */
      const blockCellSelector = 'ul, ol, dl, pre, table, div, blockquote, h1, h2, h3, h4, h5, h6, hr, p'
      const gfmTablePlaceholders = []
      const tabPlaceholders = []
      parsed.querySelectorAll('table.tableblock').forEach(table => {
        table.querySelectorAll('colgroup').forEach(colgroup => colgroup.remove())

        table.querySelectorAll('th, td').forEach(cellEl => {
          const elementChildren = cellEl.childNodes.filter(n => n.nodeType === 1)
          if (elementChildren.length === 1 && elementChildren[0].tagName === 'P') {
            cellEl.set_content(elementChildren[0].innerHTML)
          }
        })

        // GFM tables need exactly one header row and can't represent a footer,
        // so anything else is kept as HTML (buildGfmTable only reads the single
        // thead row and the tbody rows, so this also avoids dropping content).
        const hasSingleHeader =
          table.querySelectorAll('thead tr').length === 1 && !table.querySelector('tfoot')
        const cells = table.querySelectorAll('th, td')
        const isSimple = cells.every(cellEl =>
          !cellEl.querySelector(blockCellSelector) &&
          !cellEl.getAttribute('colspan') &&
          !cellEl.getAttribute('rowspan'))

        if (hasSingleHeader && isSimple) {
          // Convert to a markdown table now, swap back in after Turndown.
          const token = `XGFMTABLE${gfmTablePlaceholders.length}X`
          gfmTablePlaceholders.push({ token, markdown: buildGfmTable(table) })
          table.replaceWith(`<p>${token}</p>`)
          return
        }

        // Keep as cleaned HTML.
        table.removeAttribute('class')
        table.removeAttribute('style')
        table.querySelectorAll('*').forEach(el => {
          el.removeAttribute('class')
          el.removeAttribute('style')
        })
        table.querySelectorAll('a').forEach(a => {
          const href = a.getAttribute('href')
          if (href) {
            a.setAttribute('href', absolutizeUrl(href, page.pub.url))
          }
        })
        table.setAttribute('data-md-keep', '')
      })

      /**
       * CONVERT MERMAID TO CODE BLOCKS
       *
       * Extract mermaid diagrams and convert them to proper <pre><code> blocks
       * so Turndown's code block rule handles them with proper whitespace preservation.
       */
      const mermaidDivs = parsed.querySelectorAll('.mermaid.content')
      mermaidDivs.forEach(mermaidDiv => {
        // Get raw text which preserves newlines in node-html-parser
        const mermaidCode = mermaidDiv.rawText || mermaidDiv.textContent || ''

        // Replace with a proper code block that Turndown knows how to handle
        // Use <pre><code> structure so Turndown's code block rule processes it
        const codeBlock = `<pre><code class="language-mermaid">${mermaidCode.trim()}</code></pre>`
        mermaidDiv.replaceWith(codeBlock)
      })

      /**
       * CONVERT TABS TO <Tabs>/<Tab> BLOCKS
       *
       * Tabs are interactive UI. Flattening them to paragraphs loses the link
       * between a tab's label and its content, so instead emit an XML-style
       * structure: <Tabs> wrapping one <Tab title="..."> per tab. This gives an
       * ingesting model explicit, unambiguous boundaries and preserves the
       * "these are alternatives" relationship between tabs.
       *
       * Each panel's content is converted to real markdown (so code blocks,
       * lists, tables, and images survive) and stashed behind a placeholder that
       * is swapped back in after Turndown runs, so the panel markdown isn't
       * re-escaped. This runs after the table and mermaid passes so panel
       * content containing those is already handled.
       */
      parsed.querySelectorAll('.openblock.tabs').forEach(tabBlock => {
        const tabLabels = tabBlock
          .querySelectorAll('.tablist .tab')
          .map(tab => tab.textContent.trim())
        const tabPanels = tabBlock.querySelectorAll('.tabpanel')

        const parts = ['<Tabs>']
        tabPanels.forEach((panel, index) => {
          // Escape double quotes so they don't break the title attribute
          const title = (tabLabels[index] || `Tab ${index + 1}`).replace(/"/g, "'")
          const panelMarkdown = turndownService.turndown(panel.innerHTML).trim()
          parts.push(`<Tab title="${title}">`, '', panelMarkdown, '', '</Tab>')
        })
        parts.push('</Tabs>')

        const token = `XTABSBLOCK${tabPlaceholders.length}X`
        tabPlaceholders.push({ token, markdown: parts.join('\n') })
        tabBlock.replaceWith(`<p>${token}</p>`)
      })

      // Get the cleaned HTML content
      const htmlContent = parsed.innerHTML

      /**
       * CONVERT HTML TO MARKDOWN
       *
       * Use Turndown service with our custom rules to convert HTML to markdown.
       */
      let markdown = turndownService.turndown(htmlContent)

      /**
       * RESTORE TABS AND TABLES
       *
       * Swap the markdown tab blocks and tables back in for their placeholders.
       * Done before the link rewriting below so links inside them are
       * absolutized too. Tabs are restored first so a table nested inside a tab
       * (its placeholder carried in the tab markdown) is then resolved by the
       * table pass. A replacement function is used so "$" sequences in the
       * content (e.g. a `$` code span) aren't interpreted as String.replace
       * special patterns.
       */
      tabPlaceholders.forEach(({ token, markdown: tabsMd }) => {
        markdown = markdown.replace(token, () => '\n\n' + tabsMd + '\n\n')
      })
      gfmTablePlaceholders.forEach(({ token, markdown: tableMd }) => {
        markdown = markdown.replace(token, () => '\n\n' + tableMd + '\n\n')
      })

      /**
       * ADD THE PAGE TITLE
       *
       * The document title (h1) is rendered by the UI layout, not by the
       * AsciiDoc converter, so it is not part of page.contents at this stage.
       * Reconstruct it from the parsed AsciiDoc metadata so the markdown export
       * still leads with the page title.
       *
       * doctitle is converted inline HTML (typographic characters appear as
       * entities such as &#8217;, and inline markup as tags), so we run it
       * through Turndown to decode it the same way the rendered <h1> was.
       * When a page declares a badge attribute (e.g. "Beta", "Preview"), the
       * layout appends it to the heading, so we preserve it here too.
       */
      const doctitle = page.asciidoc && page.asciidoc.doctitle
      if (doctitle) {
        const badge = page.asciidoc.attributes && page.asciidoc.attributes['page-badge']
        const titleHtml = badge ? `${doctitle} ${badge}` : doctitle
        const titleMd = turndownService.turndown(`<h1>${titleHtml}</h1>`).trim()
        markdown = `${titleMd}\n\n` + markdown
      }

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
        const absoluteUrl = absolutizeUrl(url, page.pub.url)
        // Leave the link untouched when nothing needed resolving
        return absoluteUrl === url ? match : `[${text}](${absoluteUrl})`
      })

      /**
       * CLEAN UP FORMATTING
       *
       * Remove excessive blank lines (more than 2 consecutive newlines).
       */
      markdown = markdown.replace(/\n{3,}/g, '\n\n')

      /**
       * ADD LLMS.TXT DIRECTIVE
       *
       * Add a blockquote at the top of each markdown file pointing agents
       * to the llms.txt documentation index. This helps AI agents discover
       * the complete documentation structure.
       */
      const llmsTxtDirective = `> For the complete documentation index, see [llms.txt](${siteUrl}/llms.txt)\n\n`
      markdown = llmsTxtDirective + markdown

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
