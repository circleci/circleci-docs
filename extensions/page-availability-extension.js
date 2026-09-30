'use strict'

const { Block } = require('@asciidoctor/core')()
const {
  LABELS,
  SCOPED_COMPONENTS,
  getPlanAvailability,
  getVcsAvailability,
  getServerVersionAvailability,
} = require('./lib/page-availability')

/**
 * AsciiDoc extension that generates a sidebar summarizing which cloud plans
 * and version control providers a page applies to, from its `page-plan` and
 * `page-vcs` attributes.
 *
 * Scope: guides and reference only (checked via page-component-name).
 * In a Server build (the `server` attribute is set) it shows the minimum
 * Server version from `page-server-min-version` instead, when that is later
 * than the earliest covered version.
 * Only restricted lines are shown - a page on all three plans, or with
 * page-vcs: all, gets no line for that attribute. A page with no restricted
 * lines gets no sidebar at all. This keeps the sidebar meaningful for human
 * readers.
 *
 * The sidebar is inserted as the first block of the body - inside the
 * preamble when the page has one, otherwise as the doc's own first block.
 *
 * Registered as an asciidoc extension in antora-playbook.yml.
 */
module.exports.register = function register(registry) {
  registry.treeProcessor(function () {
    this.process((doc) => {
      const componentName = doc.getAttribute('page-component-name')
      if (!SCOPED_COMPONENTS.includes(componentName)) return doc

      const logWarning = (msg) =>
        console.warn(`${msg} (${doc.getAttribute('docfile') || 'unknown file'})`)

      const lines = []
      if (doc.hasAttribute('server')) {
        // Server build: plans and VCS providers are Cloud concepts, so show
        // the minimum Server version instead.
        const serverText = getServerVersionAvailability(doc.getAttribute('page-server-min-version'))
        if (serverText) lines.push(`*${LABELS.server}:* ${serverText}`)
      } else {
        const plan = getPlanAvailability(doc.getAttribute('page-plan'), logWarning)
        const vcs = getVcsAvailability(doc.getAttribute('page-vcs'), logWarning)
        if (plan && plan.restricted) lines.push(`*${LABELS.plan}:* ${plan.text}`)
        if (vcs && vcs.restricted) lines.push(`*${LABELS.vcs}:* ${vcs.text}`)
      }
      if (lines.length === 0) return doc

      const firstBlock = doc.getBlocks()[0]
      const container = firstBlock && firstBlock.getContext() === 'preamble' ? firstBlock : doc

      const sidebar = Block.create(container, 'sidebar', {
        content_model: 'compound',
        attributes: { role: 'page-availability' },
      })
      lines.forEach((line) => {
        const paragraph = Block.create(sidebar, 'paragraph', {
          source: line,
          content_model: 'simple',
          subs: 'normal',
        })
        sidebar.append(paragraph)
      })
      container.blocks.unshift(sidebar)

      return doc
    })
  })
}
