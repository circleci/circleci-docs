;(function () {
  'use strict'

  var supportsCopy = window.navigator.clipboard

  if (!supportsCopy) {
    console.warn('Clipboard API not supported')
  }

  // Handle "Copy markdown" button clicks (only if clipboard is supported)
  if (!supportsCopy) {
    return
  }

  var copyButtons = document.querySelectorAll('.copy-markdown-link')

  copyButtons.forEach(function (button) {
    button.addEventListener('click', function (e) {
      e.preventDefault()

      // Use relative path to the markdown file in the same directory
      var markdownUrl = 'index.md'

      var button = this
      var originalContent = button.innerHTML

      // Show loading state
      button.innerHTML = 'Loading...'
      button.disabled = true

      // Fetch the markdown file
      fetch(markdownUrl)
        .then(function (response) {
          if (!response.ok) {
            throw new Error('Failed to fetch markdown file')
          }
          return response.text()
        })
        .then(function (markdown) {
          // Copy to clipboard
          return window.navigator.clipboard.writeText(markdown)
        })
        .then(function () {
          // Show success state
          button.innerHTML = 'Copied!'
          button.classList.add('clicked')

          // Reset after 2 seconds
          setTimeout(function () {
            button.innerHTML = originalContent
            button.disabled = false
            button.classList.remove('clicked')
          }, 2000)
        })
        .catch(function (error) {
          console.error('Error copying markdown:', error)
          button.innerHTML = 'Error - Try Again'

          // Reset after 3 seconds
          setTimeout(function () {
            button.innerHTML = originalContent
            button.disabled = false
          }, 3000)
        })
    })
  })
})()
