'use strict'

/**
 * Returns descriptive tooltip text for plan badges
 * @param {string} plan - Plan identifier (e.g., "Free", "Performance", "Scale")
 * @returns {string} Human-readable description of plan availability
 */
module.exports = (plan) => {
  const planKey = plan.trim()

  if (planKey === 'Free') {
    return 'The features and processes described on this page are available on the CircleCI Free plan'
  }

  if (planKey === 'Performance') {
    return 'The features and processes described on this page are available on the CircleCI Performance plan'
  }

  if (planKey === 'Scale') {
    return 'The features and processes described on this page are available on the CircleCI Scale plan'
  }

  // Fallback for any other plan values
  return `Available on the CircleCI ${planKey} plan`
}
