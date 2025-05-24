/*
 * Image Modal
 * Implementation of click-to-expand functionality for images
 */
;(function () {
  'use strict'

  document.addEventListener('DOMContentLoaded', function () {
    // Create modal elements
    const modalOverlay = document.createElement('div')
    modalOverlay.className = 'image-modal-overlay'

    const modalContainer = document.createElement('div')
    modalContainer.className = 'image-modal-container'

    const modalImage = document.createElement('img')
    const modalTitle = document.createElement('div')
    modalTitle.className = 'image-modal-title'

    const closeButton = document.createElement('button')
    closeButton.className = 'image-modal-close'
    closeButton.setAttribute('aria-label', 'Close image modal')

    // Append elements to DOM
    modalContainer.appendChild(modalImage)
    modalContainer.appendChild(modalTitle)
    modalContainer.appendChild(closeButton)
    modalOverlay.appendChild(modalContainer)
    document.body.appendChild(modalOverlay)

    // Find all image blocks in the document
    const imageBlocks = document.querySelectorAll('.doc .imageblock .content')

    // Add click event to each image block
    imageBlocks.forEach(function (imageBlock) {
      imageBlock.addEventListener('click', function (event) {
        // Find the image and title within this imageblock
        const img = imageBlock.querySelector('img')
        const titleElement = imageBlock.closest('.imageblock').querySelector('.title')

        if (img) {
          // Set the modal image source
          modalImage.src = img.src

          // Set the title text if available
          if (titleElement) {
            modalTitle.textContent = titleElement.textContent
            modalTitle.style.display = 'block'
          } else {
            modalTitle.style.display = 'none'
          }

          // Show the modal
          modalOverlay.classList.add('show')

          // Prevent scrolling of the body when modal is open
          document.body.style.overflow = 'hidden'
        }
      })
    })

    // Close modal when clicking overlay
    modalOverlay.addEventListener('click', function (event) {
      if (event.target === modalOverlay) {
        closeModal()
      }
    })

    // Close modal when clicking close button
    closeButton.addEventListener('click', closeModal)

    // Close modal when pressing ESC key
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && modalOverlay.classList.contains('show')) {
        closeModal()
      }
    })

    // Function to close modal
    function closeModal () {
      modalOverlay.classList.remove('show')
      document.body.style.overflow = '' // Restore scrolling
    }
  })
})()
