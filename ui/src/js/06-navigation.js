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
      // reopen on the starting view; wait for the slide-out so the swap isn't visible
      if (!isHidden && navigation.hasAttribute('data-mobile-nav-ready')) setTimeout(resetView, 300)
    })
  })

  // ===== MOBILE DRILL-DOWN (below lg) =====
  // The drawer shows one level at a time: top (all components) > component
  // (its sections) > section (its pages, grouped under their subsection).
  // The current component's views are built from the desktop tree on this
  // page. Another component's tree isn't in this page, so tapping it fetches
  // that component's start page and reads the tree from there.
  const mobileNav = navigation?.querySelector('[data-mobile-nav]')
  const navTitle = navigation?.querySelector('[data-nav-title]')
  const backButton = navigation?.querySelector('[data-mobile-nav-back]')
  const backLabel = navigation?.querySelector('[data-mobile-nav-back-label]')
  const arrowRightTemplate = navigation?.querySelector('[data-mobile-nav-icon-right]')
  const tree = childMatching(navigation?.querySelector('[data-left-side-nav]'), 'ul')
  const pageComponent = {
    name: navigation?.dataset.tcomponent,
    title: navigation?.dataset.componentTitle || '',
    sections: tree ? parseTree(tree, window.location.href, true) : [],
  }
  const fetchedComponents = new Map()
  let activeComponent = pageComponent
  // the component most recently tapped, so a slower earlier fetch can't override it
  let pendingComponent = null
  let currentView = { view: navigation?.dataset.navView, section: -1 }

  function childMatching (el, selector) {
    return el ? Array.from(el.children).find((child) => child.matches(selector)) : undefined
  }

  // turns a rendered nav tree back into [{ label, url, current, badge, children }].
  // baseUrl is the page the tree came from; links in it are relative to that page.
  function parseTree (ul, baseUrl, isThisPage) {
    const items = []
    Array.from(ul.children).filter((li) => li.matches('[data-navigation-tree-content]')).forEach((li) => {
      const childList = childMatching(li.nextElementSibling, 'ul')
      const children = childList ? parseTree(childList, baseUrl, isThisPage) : []
      const row = childMatching(li, '[data-navigation-tree-toggle]')
      // the component nav starts with an empty wrapper item; lift its children
      if (!row) return items.push(...children)
      const link = childMatching(row, 'a.nav-link')
      // the page a tree came from is listed without a link, so link it back to that page
      const isSourcePage = li.hasAttribute('data-current')
      items.push({
        label: row.querySelector('.nav-link-text')?.textContent.trim() || '',
        url: link ? new URL(link.getAttribute('href').trim(), baseUrl).href : (isSourcePage ? baseUrl : null),
        current: isThisPage && isSourcePage,
        badge: row.querySelector('.nav-badge'),
        children,
      })
    })
    return items
  }

  async function fetchComponentSections (url) {
    if (!fetchedComponents.has(url)) {
      const request = fetch(url)
        .then((response) => {
          if (!response.ok) throw new Error(`${response.status} fetching ${url}`)
          return response.text()
        })
        .then((html) => {
          const doc = new window.DOMParser().parseFromString(html, 'text/html')
          const startTree = childMatching(doc.querySelector('[data-left-side-nav]'), 'ul')
          return startTree ? parseTree(startTree, url, false) : []
        })
      // forget failures so a later tap can try again
      request.catch(() => fetchedComponents.delete(url))
      fetchedComponents.set(url, request)
    }
    return fetchedComponents.get(url)
  }

  function containsCurrent (item) {
    return item.current || item.children.some(containsCurrent)
  }

  function flatten (items) {
    return items.flatMap((item) => (item.children.length ? flatten(item.children) : [item]))
  }

  function pageLink (item) {
    const el = document.createElement(item.url ? 'a' : 'span')
    el.className = 'mobile-nav-row'
    if (item.url) el.href = item.url
    if (item.current) el.setAttribute('aria-current', 'page')
    const label = document.createElement('span')
    label.textContent = item.label
    el.append(label)
    if (item.badge) el.append(item.badge.cloneNode(true))
    return el
  }

  function pageList (items) {
    const ul = document.createElement('ul')
    items.forEach((item) => {
      const li = document.createElement('li')
      li.append(pageLink(item))
      ul.append(li)
    })
    return ul
  }

  function renderComponentView () {
    const ul = document.createElement('ul')
    activeComponent.sections.forEach((section, index) => {
      const li = document.createElement('li')
      if (section.children.length) {
        const button = document.createElement('button')
        button.type = 'button'
        button.className = 'mobile-nav-row'
        if (containsCurrent(section)) button.dataset.active = ''
        const label = document.createElement('span')
        label.textContent = section.label
        button.append(label, arrowRightTemplate.content.cloneNode(true))
        button.addEventListener('click', (event) => showView('section', index, isKeyboard(event)))
        li.append(button)
      } else {
        li.append(pageLink(section))
      }
      ul.append(li)
    })
    mobileNav.replaceChildren(ul)
  }

  // Pages that sit directly under the section come first, without a heading;
  // each subsection then gets a heading with its pages listed underneath.
  function renderSectionView (section) {
    const loose = section.children.filter((item) => !item.children.length)
    const groups = section.children.filter((item) => item.children.length)
    const parts = []
    if (loose.length) parts.push(pageList(loose))
    groups.forEach((group) => {
      const wrapper = document.createElement('div')
      wrapper.className = 'mobile-nav-group'
      const heading = document.createElement('p')
      heading.className = 'mobile-nav-heading'
      heading.textContent = group.label
      wrapper.append(heading, pageList(flatten(group.children)))
      parts.push(wrapper)
    })
    mobileNav.replaceChildren(...parts)
  }

  function showView (view, sectionIndex = -1, moveFocus = false) {
    if (!navigation || !view) return
    const { title, sections } = activeComponent
    const section = sections[sectionIndex]
    if (view === 'section' && section) {
      renderSectionView(section)
      navTitle.textContent = section.label
      backLabel.textContent = title
    } else if (view === 'component' && sections.length) {
      renderComponentView()
      navTitle.textContent = title
      backLabel.textContent = 'Docs'
    } else {
      view = 'top'
      navTitle.textContent = 'Docs'
    }
    currentView = { view, section: sectionIndex }
    navigation.dataset.navView = view
    const aside = navigation.querySelector('aside')
    const current = view === 'top' ? null : mobileNav?.querySelector('[aria-current="page"], [data-active]')
    aside.scrollTop = current ? Math.max(0, current.offsetTop - aside.clientHeight / 3) : 0
    if (moveFocus) {
      // keep keyboard focus inside the view that is now showing (keyboard use only,
      // so a tap doesn't leave a focus outline on the back row)
      const focusTarget = view === 'top' ? navigation.querySelector('[data-mobile-component-list] a') : backButton
      focusTarget?.focus()
    }
  }

  // the drawer opens on the section that holds the current page
  function resetView () {
    activeComponent = pageComponent
    const { sections } = pageComponent
    const index = sections.findIndex((section) => section.children.length && containsCurrent(section))
    if (index !== -1) showView('section', index)
    else showView(sections.length ? 'component' : 'top')
  }

  // tapping a component in the top view drills into its sections. The link
  // still points at the component's start page, which is where it goes if
  // the tree can't be loaded (and without JavaScript).
  async function openComponent (link, moveFocus) {
    const { navComponent: name, navComponentTitle: title } = link.dataset
    pendingComponent = name
    if (name === pageComponent.name && pageComponent.sections.length) {
      activeComponent = pageComponent
      return showView('component', -1, moveFocus)
    }
    link.setAttribute('aria-busy', 'true')
    try {
      const sections = await fetchComponentSections(link.href)
      if (!sections.length) throw new Error(`no nav tree on ${link.href}`)
      if (pendingComponent !== name) return
      activeComponent = { name, title, sections }
      showView('component', -1, moveFocus)
    } catch {
      if (pendingComponent === name) window.location.href = link.href
    } finally {
      link.removeAttribute('aria-busy')
    }
  }

  // Enter or Space on a focused control fires a click with no pointer detail
  function isKeyboard (event) {
    return event.detail === 0
  }

  if (mobileNav && arrowRightTemplate) {
    mobileNav.classList.remove('hidden')
    navigation.dataset.mobileNavReady = ''
    resetView()

    navigation.querySelectorAll('[data-nav-component]').forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault()
        openComponent(link, isKeyboard(event))
      })
    })
  }

  backButton?.addEventListener('click', (event) => {
    if (currentView.view === 'section') showView('component', -1, isKeyboard(event))
    else showView('top', -1, isKeyboard(event))
  })

  // opens and closes individual nav submenus inside the nav treed
  document.querySelectorAll('[data-navigation-tree-toggle]').forEach((toggleButton) => {
    toggleButton?.addEventListener('click', () => {
      const current = toggleButton.closest('li')
      const content = current?.nextElementSibling
      if (content) {
        content.classList.toggle('hidden')
        const svg = toggleButton.querySelector('svg')
        if (svg) svg.classList.toggle('-rotate-90')
        const button = toggleButton.querySelector('button')
        if (button) button.setAttribute('aria-expanded', !content.classList.contains('hidden'))
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

  // Scroll current page into view within the navigation aside (not the whole page)
  function scrollToCurrentPage () {
    const currentPageItem = navigation?.querySelector('[data-current]')
    const aside = navigation?.querySelector('aside')
    // skip when the tree is hidden (below lg, where the drill-down replaces it)
    if (!currentPageItem || !aside || !currentPageItem.offsetParent) return
    // Manually scroll the aside container, not the page
    const itemOffsetTop = currentPageItem.offsetTop
    const asideHeight = aside.clientHeight
    // Scroll so item is near the top of the aside
    aside.scrollTop = Math.max(0, itemOffsetTop - asideHeight / 3)
  }
  // Use setTimeout to ensure DOM is fully rendered
  setTimeout(scrollToCurrentPage, 100)
})()
