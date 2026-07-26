;(function () {
  'use strict'

  var sidebar = document.querySelector('aside.toc.sidebar')
  if (!sidebar) return
  if (document.querySelector('body.-toc')) return sidebar.parentNode.removeChild(sidebar)
  var levels = parseInt(sidebar.dataset.levels || 2, 10)
  if (levels < 0) return

  var articleSelector = 'article.doc'
  var article = document.querySelector(articleSelector)
  if (!article) return
  var headingsSelector = []
  for (var level = 0; level <= levels; level++) {
    var headingSelector = [articleSelector]
    if (level) {
      for (var l = 1; l <= level; l++) headingSelector.push((l === 2 ? '.sectionbody>' : '') + '.sect' + l)
      headingSelector.push('h' + (level + 1) + '[id]' + (level > 1 ? ':not(.discrete)' : ''))
    } else {
      headingSelector.push('h1[id].sect0')
    }
    headingsSelector.push(headingSelector.join('>'))
  }
  var headings = find(headingsSelector.join(','), article.parentNode)
  if (!headings.length) {
    var menu = sidebar.querySelector('.toc-menu')
    if (!menu) {
      menu = document.createElement('div')
      menu.className = 'toc-menu'
      sidebar.appendChild(menu)
    }
    menu.innerHTML = '' // No title, no placeholder, just empty
    return
  }

  var lastActiveFragment
  var links = {}
  var list = headings.reduce(function (accum, heading) {
    var link = document.createElement('a')
    // Clone heading and remove badge elements to get clean text for TOC
    var headingClone = heading.cloneNode(true)
    var badges = headingClone.querySelectorAll('.subsection-badge')
    badges.forEach(function (badge) { badge.remove() })
    link.textContent = headingClone.textContent
    links[(link.href = '#' + heading.id)] = link
    var listItem = document.createElement('li')
    listItem.dataset.level = parseInt(heading.nodeName.slice(1), 10) - 1
    listItem.appendChild(link)
    accum.appendChild(listItem)
    return accum
  }, document.createElement('ul'))

  var menu = sidebar.querySelector('.toc-menu')
  if (!menu) (menu = document.createElement('div')).className = 'toc-menu'

  var title = document.createElement('h3')
  title.textContent = sidebar.dataset.title || 'On This Page'
  menu.appendChild(title)
  menu.appendChild(list)

  // Below the 1200px sidebar reflow, surface the TOC through a floating
  // book button that toggles a dropdown panel (CSS shows this only < 1200px;
  // the sidebar above owns >= 1200px). Cloning happens before 12-toc-collapse
  // runs, so the panel copy has no collapse button.
  var tocTitle = sidebar.dataset.title || 'On This Page'
  var float = document.createElement('div')
  float.className = 'toc-float'

  var btn = document.createElement('button')
  btn.className = 'toc-float-btn'
  btn.setAttribute('type', 'button')
  btn.setAttribute('aria-haspopup', 'true')
  btn.setAttribute('aria-expanded', 'false')
  btn.setAttribute('aria-controls', 'toc-float-panel')
  btn.setAttribute('aria-label', tocTitle)
  btn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/><path d="M6 8h2"/><path d="M6 12h2"/><path d="M16 8h2"/><path d="M16 12h2"/></svg>'

  var panel = document.createElement('div')
  panel.className = 'toc toc-float-panel'
  panel.id = 'toc-float-panel'
  panel.setAttribute('hidden', '')
  panel.appendChild(menu.cloneNode(true))

  float.appendChild(btn)
  float.appendChild(panel)
  document.body.appendChild(float)

  function openPanel () {
    panel.removeAttribute('hidden')
    btn.setAttribute('aria-expanded', 'true')
    float.classList.add('open')
  }
  function closePanel () {
    panel.setAttribute('hidden', '')
    btn.setAttribute('aria-expanded', 'false')
    float.classList.remove('open')
  }

  btn.addEventListener('click', function (e) {
    e.stopPropagation()
    if (panel.hasAttribute('hidden')) openPanel(); else closePanel()
  })
  // Close after choosing a destination.
  panel.addEventListener('click', function (e) {
    if (e.target.closest('a')) closePanel()
  })
  // Close on outside click and on Escape.
  document.addEventListener('click', function (e) {
    if (!panel.hasAttribute('hidden') && !float.contains(e.target)) closePanel()
  })
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !panel.hasAttribute('hidden')) {
      closePanel()
      btn.focus()
    }
  })

  window.addEventListener('load', function () {
    onScroll()
    window.addEventListener('scroll', onScroll)
  })

  function onScroll () {
    var scrolledBy = window.pageYOffset
    var buffer = getNumericStyleVal(document.documentElement, 'fontSize') * 1.15
    var ceil = article.offsetTop
    if (scrolledBy && window.innerHeight + scrolledBy + 2 >= document.documentElement.scrollHeight) {
      lastActiveFragment = Array.isArray(lastActiveFragment) ? lastActiveFragment : Array(lastActiveFragment || 0)
      var activeFragments = []
      var lastIdx = headings.length - 1
      headings.forEach(function (heading, idx) {
        var fragment = '#' + heading.id
        if (idx === lastIdx || heading.getBoundingClientRect().top + getNumericStyleVal(heading, 'paddingTop') > ceil) {
          activeFragments.push(fragment)
          if (lastActiveFragment.indexOf(fragment) < 0) links[fragment].classList.add('is-active')
        } else if (~lastActiveFragment.indexOf(fragment)) {
          links[lastActiveFragment.shift()].classList.remove('is-active')
        }
      })
      list.scrollTop = list.scrollHeight - list.offsetHeight
      lastActiveFragment = activeFragments.length > 1 ? activeFragments : activeFragments[0]
      return
    }
    if (Array.isArray(lastActiveFragment)) {
      lastActiveFragment.forEach(function (fragment) {
        links[fragment].classList.remove('is-active')
      })
      lastActiveFragment = undefined
    }
    var activeFragment
    headings.some(function (heading) {
      if (heading.getBoundingClientRect().top + getNumericStyleVal(heading, 'paddingTop') - buffer > ceil) return true
      activeFragment = '#' + heading.id
    })
    if (activeFragment) {
      if (activeFragment === lastActiveFragment) return
      if (lastActiveFragment) links[lastActiveFragment].classList.remove('is-active')
      var activeLink = links[activeFragment]
      activeLink.classList.add('is-active')
      if (list.scrollHeight > list.offsetHeight) {
        list.scrollTop = Math.max(0, activeLink.offsetTop + activeLink.offsetHeight - list.offsetHeight)
      }
      lastActiveFragment = activeFragment
    } else if (lastActiveFragment) {
      links[lastActiveFragment].classList.remove('is-active')
      lastActiveFragment = undefined
    }
  }

  function find (selector, from) {
    return [].slice.call((from || document).querySelectorAll(selector))
  }

  function getNumericStyleVal (el, prop) {
    return parseFloat(window.getComputedStyle(el)[prop])
  }
})()
