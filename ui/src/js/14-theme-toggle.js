;(function () {
  'use strict'

  // Get user's theme preference (light, dark, or auto)
  function getThemePreference() {
    try {
      const stored = localStorage.getItem('theme')
      if (stored === 'light' || stored === 'dark' || stored === 'auto') return stored
    } catch (e) {
      // localStorage may be unavailable
    }
    return 'auto' // Default to auto (follow system)
  }

  // Get the actual theme to apply (light or dark)
  function getResolvedTheme(preference) {
    if (preference === 'light') return 'light'
    if (preference === 'dark') return 'dark'

    // Auto: check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
    return 'light'
  }

  // Apply theme to document
  function applyTheme(preference) {
    const resolvedTheme = getResolvedTheme(preference)
    document.documentElement.setAttribute('data-theme', resolvedTheme)
    document.documentElement.style.colorScheme = resolvedTheme

    try {
      localStorage.setItem('theme', preference)
    } catch (e) {
      // localStorage may be unavailable in private browsing
    }

    updateUI(preference, resolvedTheme)
  }

  // Update button icon and menu checkmarks
  function updateUI(preference, resolvedTheme) {
    const button = document.getElementById('theme-toggle-button')
    const buttonIcon = document.getElementById('theme-toggle-icon')
    const menu = document.getElementById('theme-toggle-menu')

    if (!button || !buttonIcon || !menu) return

    // Update button icon based on current preference
    const iconMap = {
      'light': 'theme-light-icon.svg',
      'dark': 'theme-dark-icon.svg',
      'auto': 'theme-toggle-icon.svg'
    }
    buttonIcon.src = buttonIcon.src.replace(/theme-[^/]+\.svg$/, iconMap[preference])
    button.setAttribute('aria-label', `Theme: ${preference}. Click to change theme`)

    // Update checkmarks in menu
    menu.querySelectorAll('[role="menuitemradio"]').forEach(function(item) {
      const itemTheme = item.getAttribute('data-theme-option')
      const isSelected = itemTheme === preference
      item.setAttribute('aria-checked', isSelected ? 'true' : 'false')
      const checkmark = item.querySelector('.theme-checkmark')
      if (checkmark) {
        checkmark.style.display = isSelected ? 'block' : 'none'
      }
    })
  }

  // Toggle dropdown menu
  function toggleMenu() {
    const menu = document.getElementById('theme-toggle-menu')
    const button = document.getElementById('theme-toggle-button')
    if (!menu || !button) return

    const isOpen = menu.classList.contains('show')

    if (isOpen) {
      closeMenu()
    } else {
      openMenu()
    }
  }

  function openMenu() {
    const menu = document.getElementById('theme-toggle-menu')
    const button = document.getElementById('theme-toggle-button')
    if (!menu || !button) return

    menu.classList.add('show')
    button.setAttribute('aria-expanded', 'true')

    // Focus first menu item
    const firstItem = menu.querySelector('[role="menuitemradio"]')
    if (firstItem) firstItem.focus()
  }

  function closeMenu() {
    const menu = document.getElementById('theme-toggle-menu')
    const button = document.getElementById('theme-toggle-button')
    if (!menu || !button) return

    menu.classList.remove('show')
    button.setAttribute('aria-expanded', 'false')
    button.focus()
  }

  // Select theme from menu
  function selectTheme(preference) {
    applyTheme(preference)
    closeMenu()
  }

  // Listen for system theme changes when in auto mode
  function watchSystemTheme() {
    if (!window.matchMedia) return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', function(e) {
      const preference = getThemePreference()
      // Only react to system changes if user is in auto mode
      if (preference === 'auto') {
        const resolvedTheme = e.matches ? 'dark' : 'light'
        document.documentElement.setAttribute('data-theme', resolvedTheme)
        document.documentElement.style.colorScheme = resolvedTheme
        updateUI(preference, resolvedTheme)
      }
    })
  }

  // Close menu when clicking outside
  function handleClickOutside(event) {
    const menu = document.getElementById('theme-toggle-menu')
    const button = document.getElementById('theme-toggle-button')

    if (!menu || !button) return
    if (!menu.classList.contains('show')) return

    if (!menu.contains(event.target) && !button.contains(event.target)) {
      closeMenu()
    }
  }

  // Close menu on Escape key
  function handleEscape(event) {
    if (event.key === 'Escape') {
      const menu = document.getElementById('theme-toggle-menu')
      if (menu && menu.classList.contains('show')) {
        closeMenu()
      }
    }
  }

  // Initialize
  document.addEventListener('DOMContentLoaded', function() {
    const button = document.getElementById('theme-toggle-button')
    const menu = document.getElementById('theme-toggle-menu')

    if (button && menu) {
      const preference = getThemePreference()
      const resolvedTheme = getResolvedTheme(preference)
      updateUI(preference, resolvedTheme)

      // Button click toggles menu
      button.addEventListener('click', toggleMenu)

      // Menu item clicks
      menu.querySelectorAll('[role="menuitemradio"]').forEach(function(item) {
        item.addEventListener('click', function() {
          const theme = this.getAttribute('data-theme-option')
          selectTheme(theme)
        })
      })

      // Close menu on outside click
      document.addEventListener('click', handleClickOutside)

      // Close menu on Escape key
      document.addEventListener('keydown', handleEscape)
    }

    watchSystemTheme()
  })
})()
