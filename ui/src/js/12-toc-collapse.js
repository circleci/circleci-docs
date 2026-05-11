;(function () {
  'use strict'

  document.addEventListener('DOMContentLoaded', function () {
    var sidebar = document.querySelector('aside.toc.sidebar')
    if (!sidebar) return
    if (window.innerWidth < 1200) return // Desktop only

    // Create button with arrow icon
    var btn = document.createElement('button')
    btn.className = 'toc-collapse-btn'
    btn.setAttribute('aria-label', 'Collapse table of contents')
    btn.setAttribute('aria-expanded', 'true')
    btn.setAttribute('type', 'button')
    btn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.34319 7.70711L5.10055 11.9497M5.10055 11.9497L9.34319 16.1924M5.10055 11.9497H15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M19 8V17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>'

    // Insert button inside the h3 title
    var tocMenu = sidebar.querySelector('.toc-menu')
    var tocTitle = tocMenu.querySelector('h3')
    if (tocTitle) {
      tocTitle.appendChild(btn)
    }

    // Click handler
    btn.addEventListener('click', function () {
      var collapsed = sidebar.classList.contains('collapsed')
      applyState(!collapsed)
    })

    // Keyboard support
    btn.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        btn.click()
      }
    })
  })

  function applyState(collapsed) {
    var sidebar = document.querySelector('aside.toc.sidebar')
    var btn = sidebar.querySelector('.toc-collapse-btn')

    sidebar.classList.toggle('collapsed', collapsed)
    document.body.classList.toggle('toc-collapsed', collapsed)
    btn.setAttribute('aria-expanded', (!collapsed).toString())
    btn.setAttribute('aria-label', collapsed ? 'Expand table of contents' : 'Collapse table of contents')
  }
})()
