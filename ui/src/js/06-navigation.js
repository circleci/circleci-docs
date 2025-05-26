;(function () {
  'use strict'

  const navigation = document.querySelector('[data-page-navigation]')
  document.querySelectorAll('[data-page-navigation-toggle]').forEach((toggleButton) => {
    if (toggleButton && navigation) {
      toggleButton.addEventListener('click', () => {
        const isHidden = navigation.classList.contains('-translate-x-full')
        navigation.classList.toggle('-translate-x-full', !isHidden)
        navigation.classList.toggle('translate-x-0', isHidden)

        // When navigation is opened, show the current level
        if (navigation.classList.contains('translate-x-0')) {
          // Reset to current page's depth when opening navigation
          const currentLi = document.querySelector('li[data-current]')
          if (currentLi) {
            // Check if the current page has children
            const hasChildren = currentLi.nextElementSibling &&
              currentLi.nextElementSibling.querySelector('li[data-navigation-tree-content]')

            if (hasChildren) {
              // If current page has children, show them (level + 1)
              mobileDepth = parseInt(currentLi.getAttribute('data-depth'), 10) + 1
              showMobileDepth(mobileDepth, currentLi)
            } else {
              // If no children, show the current level
              mobileDepth = parseInt(currentLi.getAttribute('data-depth'), 10)
              showMobileDepth(mobileDepth)
            }
          } else {
            // No active page in the navigation
            // Default to showing depth 1 (top-level navigation items)
            mobileDepth = 1
            showMobileDepth(mobileDepth)

            // If there's nothing in the navigation, show component explorer
            if (treeContents.filter((el) => parseInt(el.getAttribute('data-depth'), 10) === 1).length === 0) {
              if (mobileComponentExplorerNav) mobileComponentExplorerNav.classList.remove('hidden')
              if (leftSideNav) leftSideNav.classList.add('hidden')
              // Hide back button at top level
              if (backButton) backButton.classList.add('hidden')
            }
          }
        }
      })
    }
  })
  console.log('Navigation toggle initialized')

  // ---- mobile drill‐down navigation logic ----
  const treeContents = Array.from(navigation.querySelectorAll('[data-navigation-tree-content]'))
  const mobileComponentExplorerNav = navigation.querySelector('[data-component-explorer-nav]')
  const leftSideNav = navigation.querySelector('[data-left-side-nav-container]')

  let mobileDepth = -1
  let parentDepths = [] // Track parent depth levels for navigation history

  // Track window width for responsive behavior
  let prevWindowWidth = window.innerWidth

  const currentLi = document.querySelector('li[data-current]')
  if (currentLi) {
    mobileDepth = parseInt(currentLi.getAttribute('data-depth'), 10)

    // Store parent depths and parent elements for back navigation
    let parentLi = currentLi
    const parentMap = new Map() // Map depth to parent element

    while (parentLi) {
      const depth = parseInt(parentLi.getAttribute('data-depth') || '-1', 10)
      if (!isNaN(depth)) {
        parentDepths.push(depth)
        parentMap.set(depth, parentLi)
      }
      // Find parent by going up in the DOM
      parentLi = parentLi.parentElement?.closest('li[data-navigation-tree-content]')
    }
    // Remove duplicates and sort
    parentDepths = [...new Set(parentDepths)].sort((a, b) => a - b)

    // If the current page has children, set the starting depth to show children
    const hasChildren = currentLi.nextElementSibling &&
      currentLi.nextElementSibling.querySelectorAll('[data-navigation-tree-content]').length > 0

    if (hasChildren) {
      mobileDepth = parseInt(currentLi.getAttribute('data-depth'), 10) + 1
    }
  } else {
    // If there's no active page in the navigation, default to showing depth 1
    mobileDepth = 1
  }

  // Show elements at a specific depth, optionally from a specific parent
  function showMobileDepth (depth, fromParent) {
    console.log('showMobileDepth', depth, fromParent)
    // Check if we're at the top level or beyond
    if (depth <= 0) {
      // Show component explorer nav and hide regular navigation
      if (mobileComponentExplorerNav) {
        mobileComponentExplorerNav.classList.remove('hidden')
      }
      if (leftSideNav) {
        leftSideNav.classList.add('hidden')
      }

      // Make sure all tree content items are hidden
      treeContents.forEach((el) => el.classList.add('hidden'))

      // Hide back button at top level
      const backButton = document.querySelector('[data-page-navigation-back-button]')
      if (backButton) {
        backButton.classList.add('hidden')
      }

      return
    } else {
      // Below top level - hide component explorer and show regular navigation
      if (mobileComponentExplorerNav) {
        mobileComponentExplorerNav.classList.add('hidden')
      }
      if (leftSideNav) {
        leftSideNav.classList.remove('hidden')
      }

      // Show back button when not at top level
      const backButton = document.querySelector('[data-page-navigation-back-button]')
      if (backButton) {
        backButton.classList.remove('hidden')
      }
    }

    // If we have a parent element, only show its children
    if (fromParent) {
      // Find the direct children container for this parent
      const nextSibling = fromParent.nextElementSibling
      const childItems = nextSibling?.querySelectorAll('[data-navigation-tree-content]')

      if (childItems && childItems.length) {
        // Hide all navigation items first
        treeContents.forEach((el) => el.classList.add('hidden'))

        // Show only the child items at the correct depth
        childItems.forEach((el) => {
          const elDepth = parseInt(el.getAttribute('data-depth'), 10)
          if (elDepth === depth) {
            el.classList.remove('hidden')
          }
        })
        return
      }
    }

    // Default case: show all items at this depth
    treeContents.forEach((el) => {
      const d = parseInt(el.getAttribute('data-depth'), 10)
      if (d === depth) {
        el.classList.remove('hidden')
      } else {
        el.classList.add('hidden')
      }
    })
  }

  // Back button navigation
  const backButton = document.querySelector('[data-page-navigation-back-button]')
  if (backButton) {
    backButton.addEventListener('click', () => {
      if (mobileDepth > -1) {
        mobileDepth -= 1

        // When going back to a previous level, check if we need to show a specific parent's children
        if (mobileDepth >= 0) {
          // Find the parent element for the current navigation level
          const parentLi = treeContents.find((el) => {
            // Find parent items that contain the current level as children
            const elDepth = parseInt(el.getAttribute('data-depth'), 10)
            if (elDepth === mobileDepth) {
              const hasCurrentAsChild = el.nextElementSibling &&
                el.nextElementSibling.querySelectorAll(`[data-navigation-tree-content][data-depth="${mobileDepth + 1}"]`).length > 0
              return hasCurrentAsChild
            }
            return false
          })

          if (parentLi) {
            // If we found a parent, show all items at this level
            showMobileDepth(mobileDepth)
          } else {
            // Default fallback to show all items at this depth level
            showMobileDepth(mobileDepth)
          }
        } else {
          // At top level (-1), explicitly show component explorer nav and hide left side nav
          if (mobileComponentExplorerNav) {
            mobileComponentExplorerNav.classList.remove('hidden')
          }
          if (leftSideNav) {
            leftSideNav.classList.add('hidden')
          }
          // Make sure navigation items are hidden
          treeContents.forEach((el) => el.classList.add('hidden'))

          // Hide back button at top level
          if (backButton) {
            backButton.classList.add('hidden')
          }
        }
      }
    })
  }

  // override nav‐tree toggle to handle mobile vs desktop
  document.querySelectorAll('[data-navigation-tree-toggle]').forEach((toggleButton) => {
    toggleButton.addEventListener('click', () => {
      if (window.innerWidth < 768) {
        // mobile: drill down into this depth
        const li = toggleButton.closest('li')

        // Check if this item has a link or it's just a toggle
        const link = toggleButton.querySelector('a')
        if (link && link.getAttribute('href')) {
          // It's a link, let it navigate normally
          return
        }

        // Check if this item has children
        const hasChildren = li.nextElementSibling &&
          li.nextElementSibling.querySelectorAll('[data-navigation-tree-content]').length > 0

        if (hasChildren) {
          // If it has children, drill down to show them
          mobileDepth = parseInt(li.getAttribute('data-depth'), 10) + 1
          showMobileDepth(mobileDepth, li)
        } else {
          // If no children, just remain at current level

        }
      } else {
        // desktop: original expand/collapse
        const current = toggleButton.closest('li')
        const content = current.nextElementSibling
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
  }

  // Handle window resize events for responsive navigation
  window.addEventListener('resize', () => {
    const currentWidth = window.innerWidth
    const wasInMobileView = prevWindowWidth < 768
    const isInDesktopView = currentWidth >= 768

    // If transitioning from mobile to desktop view
    if (wasInMobileView && isInDesktopView) {
      // Reset navigation to desktop state
      if (navigation.classList.contains('translate-x-0')) {
        // Close the mobile navigation if it's open
        navigation.classList.remove('translate-x-0')
        navigation.classList.add('-translate-x-full')
      }

      // Reset visibility of navigation components for desktop view
      treeContents.forEach((el) => {
        // Remove the hidden class that was added for mobile navigation
        el.classList.remove('hidden')

        // If this is a submenu, check if it should be hidden based on expanded state
        // (Keep submenus collapsed as they were before)
        const parentLi = el.previousElementSibling
        if (parentLi && parentLi.querySelector('img.-rotate-90')) {
          // If the toggle is collapsed (not rotated), keep this submenu hidden
          el.classList.add('hidden')
        }
      })

      // In desktop view, make both navigation components available
      if (mobileComponentExplorerNav) mobileComponentExplorerNav.classList.add('hidden')
      if (leftSideNav) leftSideNav.classList.remove('hidden')

      // Reset mobile depth
      mobileDepth = -1
    } else if (!wasInMobileView && currentWidth < 768) {
      // Transitioning from desktop to mobile view
      showMobileDepth(mobileDepth > 0 ? mobileDepth : 1)
    }

    // Update previous width for next comparison
    prevWindowWidth = currentWidth
  })

  console.log('Navigation tree toggle initialized')
})()
