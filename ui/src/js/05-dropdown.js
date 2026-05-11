;(function () {
  'use strict'
  document.querySelectorAll('[data-dropdown]').forEach((dropdown) => {
    const button = dropdown.querySelector('[data-dropdown-button]')
    const menu = dropdown.querySelector('[data-dropdown-menu]')
    const selected = dropdown.querySelector('[data-dropdown-selected]')

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
        selected.textContent = option.dataset.label
        button.setAttribute('aria-expanded', 'false')
        menu.classList.add('hidden')
      }
    })
  })

  console.log('Dropdown initialized')
})()
