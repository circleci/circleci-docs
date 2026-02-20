;(function () {
  'use strict'

  // Early return if clipboard API is not supported
  if (!window.navigator.clipboard) {
    console.warn('Clipboard API not supported')
    return
  }

  var copyButtons = document.querySelectorAll('.copy-markdown-link')

  copyButtons.forEach(function (button) {
    button.addEventListener('click', function (e) {
      e.preventDefault()
      e.stopPropagation()

      var button = this
      var originalText = button.textContent

      // Show loading state
      button.textContent = 'Loading...'
      button.disabled = true

      // Fetch and copy markdown file
      fetch('index.md')
        .then(function (response) {
          if (!response.ok) {
            throw new Error('Failed to fetch markdown file')
          }
          return response.text()
        })
        .then(function (markdown) {
          return window.navigator.clipboard.writeText(markdown)
        })
        .then(function () {
          // Show success state
          button.textContent = 'Copied!'

          // Reset after 2 seconds
          setTimeout(function () {
            button.textContent = originalText
            button.disabled = false
          }, 2000)
        })
        .catch(function (error) {
          console.error('Error copying markdown:', error)
          button.textContent = 'Error - Try Again'

          // Reset after 3 seconds
          setTimeout(function () {
            button.textContent = originalText
            button.disabled = false
          }, 3000)
        })
    })
  })
})()
