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
    btn.innerHTML = '<svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M0.292893 5.29289C-0.0976311 5.68342 -0.0976311 6.31658 0.292893 6.70711L5.29289 11.7071C5.68342 12.0976 6.31658 12.0976 6.70711 11.7071C7.09763 11.3166 7.09763 10.6834 6.70711 10.2929L3.41421 7H15C15.5523 7 16 6.55228 16 6C16 5.44772 15.5523 5 15 5H3.41421L6.70711 1.70711C7.09763 1.31658 7.09763 0.683417 6.70711 0.292894C6.31658 -0.0976312 5.68342 -0.0976312 5.29289 0.292894L0.292893 5.29289Z" fill="currentColor"/></svg>'

    // Insert button before toc-menu
    var tocMenu = sidebar.querySelector('.toc-menu')
    sidebar.insertBefore(btn, tocMenu)

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
