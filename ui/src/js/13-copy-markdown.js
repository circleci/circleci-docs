;(function () {
  'use strict'

  // Early return if clipboard API is not supported
  if (!window.navigator.clipboard) {
    console.warn('Clipboard API not supported')
    return
  }

  var copyButtons = document.querySelectorAll('.copy-markdown-link')

  // Helper function to update button text
  function setButtonText(button, textSpan, text) {
    if (textSpan) {
      textSpan.textContent = text
    } else {
      button.innerHTML = text
    }
  }

  copyButtons.forEach(function (button) {
    button.addEventListener('click', function (e) {
      e.preventDefault()

      var button = this
      var textSpan = button.querySelector('span')
      var originalText = textSpan ? textSpan.textContent : button.innerHTML

      // Show loading state
      setButtonText(button, textSpan, 'Loading...')
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
          setButtonText(button, textSpan, 'Copied!')
          button.classList.add('clicked')

          // Reset after 2 seconds
          setTimeout(function () {
            setButtonText(button, textSpan, originalText)
            button.disabled = false
            button.classList.remove('clicked')
          }, 2000)
        })
        .catch(function (error) {
          console.error('Error copying markdown:', error)
          setButtonText(button, textSpan, 'Error - Try Again')

          // Reset after 3 seconds
          setTimeout(function () {
            setButtonText(button, textSpan, originalText)
            button.disabled = false
          }, 3000)
        })
    })
  })
})()
