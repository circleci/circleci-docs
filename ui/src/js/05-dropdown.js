;(function () {
  'use strict'
  document.querySelectorAll('[data-dropdown]').forEach((dropdown) => {
    const button = dropdown.querySelector('[data-dropdown-button]')
    const menu = dropdown.querySelector('[data-dropdown-menu]')
    const selected = dropdown.querySelector('[data-dropdown-selected]')
    const followLink = dropdown.hasAttribute('data-dropdown-follow-link')

    button.addEventListener('click', () => {
      const isExpanded = button.getAttribute('aria-expanded') === 'true'
      button.setAttribute('aria-expanded', !isExpanded)
      menu.classList.toggle('hidden')
    })

    document.addEventListener('click', (event) => {
      if (!dropdown.contains(event.target)) {
        button.setAttribute('aria-expanded', 'false')
        menu.classList.add('hidden')
      }
    })

    menu.addEventListener('click', (event) => {
      const option = event.target.closest('[data-dropdown-option]')
      if (option) {
        // On menus that ask for it, follow the option's link when the click lands
        // outside it, so the label never shows a choice that the page does not reflect.
        const link = followLink && option.querySelector('a')
        if (link && !event.target.closest('a')) link.click()
        selected.textContent = option.dataset.label
        button.setAttribute('aria-expanded', 'false')
        menu.classList.add('hidden')
      }
    })
  })

  // Remember the guides version picked in the version switcher, so
  // head-version-redirect.hbs can bring the reader back to it.
  document.querySelectorAll('[data-version-switcher] [data-dropdown-option]').forEach((option) => {
    option.addEventListener('click', () => {
      try {
        localStorage.setItem('docs-guides-version', option.dataset.value === 'server' ? 'server' : 'cloud')
      } catch {
        // Storage can be blocked, so the choice is simply not remembered.
      }
    })
  })

  console.log('Dropdown initialized')
})()
