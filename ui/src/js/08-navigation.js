;(function () {
  'use strict'

  const navigation = document.querySelector('[data-page-navigation]')
  document.querySelectorAll('[data-page-navigation-toggle]').forEach((toggleButton) => {
    if (toggleButton && navigation) {
      toggleButton.addEventListener('click', () => {
        const isHidden = navigation.classList.contains('-translate-x-full')
        navigation.classList.toggle('-translate-x-full', !isHidden)
        navigation.classList.toggle('translate-x-0', isHidden)
        // when nav is closed, reset mobile view to current level
        if (!navigation.classList.contains('translate-x-0')) {
          const currentLi = document.querySelector('li[data-current]')
          if (currentLi) {
            mobileDepth = parseInt(currentLi.getAttribute('data-depth'), 10)
          }
          showMobileDepth(mobileDepth)
        }
      })
    }
  })
  console.log('Navigation toggle initialized')

  // ---- mobile drill‐down navigation logic ----
  const treeContents = Array.from(document.querySelectorAll('[data-navigation-tree-content]'))
  const mobileBase = document.querySelector('[data-navigation-tree-mobile-base]')
  let mobileDepth = -1
  const currentLi = document.querySelector('li[data-current]')
  if (currentLi) {
    mobileDepth = parseInt(currentLi.getAttribute('data-depth'), 10)
  }
  function showMobileDepth (depth, fromCurrent) {
    const navToShow = fromCurrent?.nextElementSibling?.querySelector('[data-navigation-tree-content]')

    treeContents.forEach((el) => {
      const d = parseInt(el.getAttribute('data-depth'), 10)
      if (d === depth && (!navToShow || el === navToShow)) el.classList.remove('hidden')
      else el.classList.add('hidden')
    })
    if (mobileBase) {
      if (depth === -1) mobileBase.classList.remove('hidden')
      else mobileBase.classList.add('hidden')
    }
  }
  const backButton = document.querySelector('[data-page-navigation-back-button]')
  if (backButton) {
    backButton.addEventListener('click', () => {
      if (mobileDepth > -1) {
        mobileDepth -= 1
        showMobileDepth(mobileDepth)
      }
    })
  }

  // override nav‐tree toggle to handle mobile vs desktop
  document.querySelectorAll('[data-navigation-tree-toggle]').forEach((toggleButton) => {
    toggleButton.addEventListener('click', () => {
      if (window.innerWidth < 768) {
        // mobile: drill down into this depth
        const li = toggleButton.closest('li')
        mobileDepth = parseInt(li.getAttribute('data-depth'), 10) + 1
        showMobileDepth(mobileDepth, li)
      } else {
        // desktop: original expand/collapse
        const current = toggleButton.closest('li')
        // const currentDepth = parseInt(current.getAttribute('data-depth'), 10)
        // correctly target the next-level tree-content inside this <li>
        const content = current
          .nextElementSibling
        if (content) {
          content.classList.toggle('hidden')
          const img = toggleButton.querySelector('img')
          if (img) img.classList.toggle('-rotate-90')
        }
      }
    })
  })

  if (window.innerWidth < 768) {
    showMobileDepth(mobileDepth)
  };

  console.log('Navigation tree toggle initialized')
})()
