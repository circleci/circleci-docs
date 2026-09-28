'use strict'

const { Block } = require('@asciidoctor/core')()
const {
  LABELS,
  SCOPED_COMPONENTS,
  getPlanAvailability,
  getVcsAvailability,
} = require('./lib/page-availability')

/**
 * AsciiDoc extension that generates a sidebar summarizing which cloud plans
 * and version control providers a page applies to, from its `page-plan` and
 * `page-vcs` attributes.
 *
 * Scope: guides and reference only (checked via page-component-name).
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

      const plan = getPlanAvailability(doc.getAttribute('page-plan'), logWarning)
      const vcs = getVcsAvailability(doc.getAttribute('page-vcs'), logWarning)

      const lines = []
      if (plan && plan.restricted) lines.push(`*${LABELS.plan}:* ${plan.text}`)
      if (vcs && vcs.restricted) lines.push(`*${LABELS.vcs}:* ${vcs.text}`)
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
