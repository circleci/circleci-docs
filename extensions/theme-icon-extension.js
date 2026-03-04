/**
 * AsciiDoc extension to handle theme-aware icons
 * Allows using icon:name[] syntax which expands to both light and dark versions
 *
 * Usage in AsciiDoc:
 *   icon:more[]
 *   icon:warning[Warning icon]
 *
 * Configuration in antora.yml or antora-playbook.yml:
 *   asciidoc:
 *     extensions:
 *     - ./extensions/theme-icon-extension.js
 */

module.exports.register = function register(registry, context = {}) {
  // Default configuration - can be overridden via context
  const config = {
    // Default icon directory path (Antora resource ID format)
    iconPath: context.iconPath || 'guides:ROOT:icons',
    // Default CSS classes
    lightClass: context.lightClass || 'no-border icon-light',
    darkClass: context.darkClass || 'no-border icon-dark',
    // Icon suffix for dark versions
    darkSuffix: context.darkSuffix || '-dark',
  }

  registry.inlineMacro('icon', function () {
    const self = this
    self.process((parent, target, attrs) => {
      const iconName = target
      const altText = attrs.$positional?.[0] || `${iconName} icon`

      // Build the image paths
      const lightIconPath = `${config.iconPath}/${iconName}.svg`
      const darkIconPath = `${config.iconPath}/${iconName}${config.darkSuffix}.svg`

      // Create the AsciiDoc markup for both icons
      const lightImage = `image:${lightIconPath}[${altText},role="${config.lightClass}"]`
      const darkImage = `image:${darkIconPath}[${altText},role="${config.darkClass}"]`

      // Return both images inline
      // Using createInlinePass to preserve the AsciiDoc markup for processing
      return self.createInlinePass(parent, `${lightImage}${darkImage}`)
    })
  })
}
