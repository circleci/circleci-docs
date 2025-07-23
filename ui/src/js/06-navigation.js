;(function () {
  'use strict'

  const navigation = document.querySelector('[data-page-navigation]')
  let prevWindowWidth = window.innerWidth

  // opens and closes the left nav menu (typically on mobile)
  document.querySelectorAll('[data-page-navigation-toggle]').forEach((toggleButton) => {
    if (!toggleButton || !navigation) return

    toggleButton.addEventListener('click', () => {
      const isHidden = navigation.classList.contains('-translate-x-full')
      navigation.classList.toggle('-translate-x-full', !isHidden)
      navigation.classList.toggle('translate-x-0', isHidden)
    })
  })

  // opens and closes individual nav submenus inside the nav treed
  document.querySelectorAll('[data-navigation-tree-toggle]').forEach((toggleButton) => {
    toggleButton?.addEventListener('click', () => {
      const current = toggleButton.closest('li')
      const content = current?.nextElementSibling
      if (content) {
        content.classList.toggle('hidden')
        const img = toggleButton.querySelector('img')
        if (img) img.classList.toggle('-rotate-90')
      }
    })
  })

  window.addEventListener('resize', () => {
    const currentWidth = window.innerWidth
    const wasInMobileView = prevWindowWidth < 768
    const isInDesktopView = currentWidth >= 768

    if (wasInMobileView && isInDesktopView) {
      if (navigation.classList.contains('translate-x-0')) {
        navigation.classList.remove('translate-x-0')
        navigation.classList.add('-translate-x-full')
      }
    }

    prevWindowWidth = currentWidth
  })
})()
