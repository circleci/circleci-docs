'use strict'

/**
 * Returns descriptive tooltip text for platform badges
 * @param {string} platform - Platform identifier (e.g., "Cloud", "Server v4+", "Server v4.2")
 * @returns {string} Human-readable description of platform availability
 */
module.exports = (platform) => {
  const platformKey = platform.trim()

  // Special handling for Cloud
  if (platformKey === 'Cloud') {
    return 'The features and processes described on this page are available for CircleCI Cloud'
  }

  // Special handling for Server Admin
  if (platformKey === 'Server Admin') {
    return 'This guide is for CircleCI Server administrators'
  }

  // Special handling for Server v4+ (with plus sign)
  if (platformKey === 'Server v4+') {
    return 'The features and processes described on this page are available for CircleCI Server v4.x+'
  }

  // Pattern match for specific Server versions (e.g., "Server v4.2", "Server 4.2", "Server v3.4", "Server 3")
  // Matches with or without the "v" prefix
  // Uses shorter format: "This guide is for CircleCI Server v4.2"
  if (platformKey.match(/^Server v?\d+(\.\d+)?$/)) {
    return `This guide is for CircleCI ${platformKey}`
  }

  // Fallback for any other platform values
  return `Available on ${platformKey}`
}
