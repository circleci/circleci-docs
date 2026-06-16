'use strict'
const fs = require('fs')
const path = require('path')
const TurndownService = require('turndown')
const { parse: parseHTML } = require('node-html-parser')

const BATCH_SIZE = 50

function buildTurndownService() {
  const td = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    fence: '```',
    emDelimiter: '_',
    strongDelimiter: '**',
    linkStyle: 'inlined',
  })

  td.addRule('removeImages', {
    filter: 'img',
    replacement: () => '',
  })

  td.addRule('cleanHeadings', {
    filter: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    replacement(content, node) {
      const level = Number(node.nodeName.charAt(1))
      const prefix = '#'.repeat(level)
      const clean = content.replace(/\[\]\(#[^)]*\)\s*/g, '').trim()
      return `\n\n${prefix} ${clean}\n\n`
    },
  })

  td.addRule('fencedCodeBlock', {
    filter(node, options) {
      return (
        options.codeBlockStyle === 'fenced' &&
        node.nodeName === 'PRE' &&
        node.firstChild &&
        node.firstChild.nodeName === 'CODE'
      )
    },
    replacement(content, node, options) {
      const className = node.firstChild.className || ''
      const language = (className.match(/language-(\S+)/) || [null, ''])[1]
      const code = node.firstChild.textContent
      const fenceChar = options.fence
      let fenceSize = 3
      const fenceInCodeRegex = new RegExp(`^${fenceChar}{${fenceSize},}`, 'gm')
      let match
      while ((match = fenceInCodeRegex.exec(code))) {
        if (match[0].length >= fenceSize) fenceSize = match[0].length + 1
      }
      const fence = fenceChar.repeat(fenceSize)
      return `\n\n${fence}${language}\n${code.replace(/\n$/, '')}\n${fence}\n\n`
    },
  })

  return td
}

function filePathToPageUrl(filePath, buildDir) {
  const rel = path.relative(buildDir, filePath).split(path.sep).join('/')
  if (rel === 'index.html') return '/'
  if (rel.endsWith('/index.html')) return '/' + rel.slice(0, -'index.html'.length)
  if (rel.endsWith('.html')) return '/' + rel.slice(0, -5)
  return '/' + rel
}

function findHtmlFiles(dir) {
  const results = []
  function walk(current) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name)
      if (entry.isDirectory()) walk(full)
      else if (entry.name.endsWith('.html')) results.push(full)
    }
  }
  walk(dir)
  return results
}

function convertPage(filePath, buildDir, siteUrl, td) {
  const pageUrl = filePathToPageUrl(filePath, buildDir)
  const fullHtml = fs.readFileSync(filePath, 'utf8')
  const parsed = parseHTML(fullHtml)

  const article =
    parsed.querySelector('article.doc') ||
    parsed.querySelector('.doc') ||
    parsed.querySelector('article') ||
    parsed.querySelector('main')

  if (!article) return false

  const h1 = article.querySelector('h1.page')
  if (h1) {
    let next = h1.nextElementSibling
    while (next) {
      if (
        next.tagName === 'DIV' &&
        (next.rawText || next.innerHTML).includes('Contribute')
      ) {
        next.remove()
        break
      }
      if (
        next.tagName === 'DIV' &&
        next.classList?.toString().includes('border-vapor')
      ) {
        next.remove()
        break
      }
      next = next.nextElementSibling
    }
  }

  article
    .querySelectorAll('.toolbar, .page-versions, .edit-this-page')
    .forEach(el => el.remove())

  article.querySelectorAll('.openblock.tabs').forEach(tabBlock => {
    const labels = [...tabBlock.querySelectorAll('.tablist .tab')].map(t =>
      t.textContent.trim()
    )
    const panels = tabBlock.querySelectorAll('.tabpanel')
    let html = '<div class="tabs-content">'
    panels.forEach((panel, i) => {
      if (labels[i]) html += `<p><strong>${labels[i]}:</strong></p>`
      html += panel.innerHTML
    })
    html += '</div>'
    tabBlock.replaceWith(html)
  })

  article.querySelectorAll('.mermaid.content').forEach(el => {
    const code = el.rawText || el.textContent || ''
    el.replaceWith(
      `<pre><code class="language-mermaid">${code.trim()}</code></pre>`
    )
  })

  let markdown = td.turndown(article.innerHTML)

  markdown = markdown.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
    if (/^[a-z]+:/.test(url) || url.startsWith('#')) return match

    let absoluteUrl
    if (url.startsWith('/')) {
      absoluteUrl = siteUrl + url
    } else {
      const pageDir = pageUrl.endsWith('/')
        ? pageUrl
        : pageUrl.substring(0, pageUrl.lastIndexOf('/') + 1)

      if (url.startsWith('../') || url.startsWith('./')) {
        let upCount = 0
        let cleanUrl = url
        while (cleanUrl.startsWith('../')) { upCount++; cleanUrl = cleanUrl.substring(3) }
        if (cleanUrl.startsWith('./')) cleanUrl = cleanUrl.substring(2)
        let basePath = pageDir.split('/').filter(p => p)
        for (let i = 0; i < upCount; i++) basePath.pop()
        absoluteUrl =
          siteUrl +
          '/' +
          basePath.join('/') +
          (basePath.length > 0 ? '/' : '') +
          cleanUrl
      } else {
        absoluteUrl = siteUrl + pageDir + url
      }
    }

    return `[${text}](${absoluteUrl})`
  })

  markdown = markdown.replace(/\n{3,}/g, '\n\n')
  markdown =
    `> For the complete documentation index, see [llms.txt](${siteUrl}/llms.txt)\n\n` +
    markdown

  const mdPath = filePath.replace(/\.html$/, '.md')
  fs.writeFileSync(mdPath, markdown, 'utf8')
  return true
}

async function convertHtmlToMarkdown(buildDir, siteUrl) {
  const td = buildTurndownService()
  const htmlFiles = findHtmlFiles(buildDir)
  console.log(`Converting ${htmlFiles.length} HTML files to markdown`)

  let count = 0
  for (let i = 0; i < htmlFiles.length; i += BATCH_SIZE) {
    const batch = htmlFiles.slice(i, i + BATCH_SIZE)
    for (const filePath of batch) {
      try {
        if (convertPage(filePath, buildDir, siteUrl, td)) count++
      } catch (err) {
        console.error(`Error processing ${filePath}:`, err.message)
      }
    }
    await new Promise(resolve => setImmediate(resolve))
  }

  console.log(`Generated ${count} markdown files`)
}

module.exports = { convertHtmlToMarkdown }

if (require.main === module) {
  const buildDir = process.argv[2] || path.join(__dirname, '..', 'build')
  const siteUrl = process.argv[3] || 'https://circleci.com/docs'
  convertHtmlToMarkdown(buildDir, siteUrl).catch(err => {
    console.error(err)
    process.exit(1)
  })
}
