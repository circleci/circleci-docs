/**
 * Width Toggle
 * Handles toggling between fixed and fluid article width
 */

;(function () {
  'use strict'

  const STORAGE_KEY = 'article-width-mode'
  const FLUID_CLASS = 'doc--fluid'
  const ACTIVE_CLASS = 'bg-gray-200'

  document.addEventListener('DOMContentLoaded', function () {
    const toggleButton = document.getElementById('width-toggle')
    const articleElement = document.querySelector('article.doc')

    if (!toggleButton || !articleElement) {
      return
    }

    // Check for saved preference
    const savedMode = localStorage.getItem(STORAGE_KEY)
    if (savedMode === 'fluid') {
      articleElement.classList.add(FLUID_CLASS)
      toggleButton.classList.add(ACTIVE_CLASS)
    }

    // Handle toggle click
    toggleButton.addEventListener('click', function () {
      const isFluid = articleElement.classList.toggle(FLUID_CLASS)
      toggleButton.classList.toggle(ACTIVE_CLASS, isFluid)

      // Save preference
      localStorage.setItem(STORAGE_KEY, isFluid ? 'fluid' : 'fixed')
    })
  })
})()
