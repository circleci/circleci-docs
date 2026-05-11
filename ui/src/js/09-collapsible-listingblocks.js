; (function () {
  'use strict'

  document.addEventListener('DOMContentLoaded', function () {
    const listingBlocks = document.querySelectorAll('.listingblock > .title')

    // Add collapsible functionality to each listing block with title
    listingBlocks.forEach(function (titleElement) {
      const contentElement = titleElement.nextElementSibling

      // Add collapsible class for styling
      titleElement.classList.add('collapsible')

      // Set aria attributes for accessibility
      titleElement.setAttribute('role', 'button')
      titleElement.setAttribute('aria-expanded', 'true')
      titleElement.setAttribute('tabindex', '0')

      // Store the original height of the content element for smooth transitions
      const contentHeight = contentElement.offsetHeight
      contentElement.style.height = contentHeight + 'px'
      contentElement.style.overflow = 'hidden'
      contentElement.style.transition = 'height 0.3s ease'

      // Add click listener to toggle collapse/expand
      titleElement.addEventListener('click', function () {
        const isExpanded = titleElement.getAttribute('aria-expanded') === 'true'

        if (isExpanded) {
          // Collapse
          titleElement.setAttribute('aria-expanded', 'false')
          contentElement.style.height = '0px'
          titleElement.classList.add('collapsed')
        } else {
          // Expand
          titleElement.setAttribute('aria-expanded', 'true')
          contentElement.style.height = contentHeight + 'px'
          titleElement.classList.remove('collapsed')
        }
      })

      // Add keyboard accessibility
      titleElement.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          titleElement.click()
        }
      })
    })
  })
})()
