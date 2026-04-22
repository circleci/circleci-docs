;(function () {
  'use strict'

  /**
   * Adjusts tooltip position to prevent viewport overflow.
   * Detects if badge is near left/right edge and adjusts tooltip alignment accordingly.
   */
  function calculateTooltipPosition(badge) {
    const badgeRect = badge.getBoundingClientRect()
    const viewportWidth = window.innerWidth

    // Read tooltip max-width from CSS custom property (fallback to 300)
    const tooltipWidth = parseInt(
      getComputedStyle(document.documentElement)
        .getPropertyValue('--tooltip-max-width') || '300'
    )

    const tooltipLeft = badgeRect.left + (badgeRect.width / 2) - (tooltipWidth / 2)

    if (tooltipLeft < 10) {
      // Too close to left edge - align tooltip to left of badge
      badge.style.setProperty('--tooltip-align', 'left')
    } else if (badgeRect.left + (badgeRect.width / 2) + (tooltipWidth / 2) > viewportWidth - 10) {
      // Too close to right edge - align tooltip to right of badge
      badge.style.setProperty('--tooltip-align', 'right')
    } else {
      // Enough space - center normally
      badge.style.setProperty('--tooltip-align', 'center')
    }
  }

  /**
   * Shows tooltip and adjusts position.
   * Triggered by both mouse and keyboard events.
   */
  function showTooltip(badge) {
    requestAnimationFrame(() => {
      calculateTooltipPosition(badge)
      // Add class to show tooltip after position is calculated
      badge.classList.add('tooltip-visible')
    })
  }

  /**
   * Hides tooltip by removing alignment style and visibility class.
   */
  function hideTooltip(badge) {
    badge.classList.remove('tooltip-visible')
    badge.style.removeProperty('--tooltip-align')
  }

  /**
   * Initialize tooltip behavior on a badge.
   */
  function initializeBadge(badge) {
    // Mouse events
    badge.addEventListener('mouseenter', () => showTooltip(badge))
    badge.addEventListener('mouseleave', () => hideTooltip(badge))

    // Keyboard events for accessibility
    badge.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        showTooltip(badge)
      } else if (e.key === 'Escape') {
        hideTooltip(badge)
        badge.blur() // Remove focus
      }
    })

    badge.addEventListener('blur', () => hideTooltip(badge))
  }

  // Initialize all platform badges
  const badges = document.querySelectorAll('.platform-badge')
  badges.forEach(initializeBadge)

  // Re-calculate positions on window resize (debounced)
  let resizeTimer
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => {
      badges.forEach(badge => {
        // Only recalculate if tooltip is currently visible
        if (badge.matches(':hover, :focus')) {
          calculateTooltipPosition(badge)
        }
      })
    }, 250)
  })
})()
