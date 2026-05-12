'use strict'

/**
 * Trims whitespace from a string
 * @param {string} str - String to trim
 * @returns {string} Trimmed string
 */
module.exports = (str) => {
  return typeof str === 'string' ? str.trim() : str
}
