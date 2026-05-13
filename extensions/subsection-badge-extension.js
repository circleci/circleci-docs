/**
 * AsciiDoc extension to handle subsection badges
 * Allows adding status badges (Preview, Beta, Deprecated, etc.) to section headings (h2-h6)
 *
 * Usage in AsciiDoc:
 *   [badge="Preview"]
 *   == Slack notifications
 *
 *   [badge="Beta",badge-classes="text-white bg-blue-500"]
 *   === New feature
 *
 *   [badge="Deprecated",badge-bg="#ff0000",badge-border="#cc0000"]
 *   ==== Old approach
 *
 * Configuration in antora-playbook.yml:
 *   asciidoc:
 *     extensions:
 *     - ./extensions/subsection-badge-extension.js
 */

module.exports.register = function register(registry, context = {}) {
  // Default configuration - can be overridden via context
  const config = {
    // Default badge CSS classes (matches page-level badge styling)
    defaultClasses: context.defaultClasses || 'text-[10px] rounded-full py-1 px-1.5 text-terminal-black border',
  }

  // Register a tree processor that runs after the document is parsed
  registry.treeProcessor(function () {
    const self = this

    self.process((doc) => {
      // Find all sections (headings) in the document
      const sections = doc.findBy({ context: 'section' })

      sections.forEach((section) => {
        // Check if this section has a badge attribute
        const badgeText = section.getAttribute('badge')
        if (!badgeText) return // Skip sections without badges

        // Get optional badge styling attributes
        const badgeClasses = section.getAttribute('badge-classes') || config.defaultClasses
        const badgeBg = section.getAttribute('badge-bg')
        const badgeBorder = section.getAttribute('badge-border')

        // Build the badge HTML with subsection-badge class for CSS targeting
        let badgeHtml = `<span class="subsection-badge ${badgeClasses}"`

        // Add inline styles if background or border colors are specified
        if (badgeBg || badgeBorder) {
          const styles = []
          if (badgeBg) styles.push(`background-color: ${badgeBg}`)
          if (badgeBorder) styles.push(`border-color: ${badgeBorder}`)
          badgeHtml += ` style="${styles.join('; ')}"`
        }

        badgeHtml += `>${badgeText}</span>`

        // Get the original section title
        const originalTitle = section.getTitle()

        // Create a new title with the badge appended using passthrough
        // The +++...+++ syntax tells Asciidoctor to pass through the HTML without escaping
        const newTitle = `${originalTitle} +++${badgeHtml}+++`

        // Set the new title
        section.setTitle(newTitle)
      })

      return doc
    })
  })
}
