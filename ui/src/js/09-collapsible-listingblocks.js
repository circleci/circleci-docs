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

      // Leave the height unset while expanded. Measuring it on load gives 0 for
      // blocks that start hidden, such as those in an inactive tab.
      contentElement.style.overflow = 'hidden'
      contentElement.style.transition = 'height 0.3s ease'

      // Release the fixed height once an expand transition finishes
      contentElement.addEventListener('transitionend', function () {
        if (titleElement.getAttribute('aria-expanded') === 'true') {
          contentElement.style.height = ''
        }
      })

      // Add click listener to toggle collapse/expand
      titleElement.addEventListener('click', function () {
        const isExpanded = titleElement.getAttribute('aria-expanded') === 'true'

        if (isExpanded) {
          // Collapse: fix the current height first so the transition has a start value
          titleElement.setAttribute('aria-expanded', 'false')
          contentElement.style.height = contentElement.scrollHeight + 'px'
          void contentElement.offsetHeight
          contentElement.style.height = '0px'
          titleElement.classList.add('collapsed')
        } else {
          // Expand
          titleElement.setAttribute('aria-expanded', 'true')
          contentElement.style.height = contentElement.scrollHeight + 'px'
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
