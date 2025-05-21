'use strict'

module.exports = (str, delimiter) => {
  if (typeof str !== 'string') {
    throw new TypeError('Expected a string')
  }
  if (typeof delimiter !== 'string') {
    throw new TypeError('Expected a string')
  }
  const parts = str.split(delimiter).map((part) => part.trim()).filter((part) => part.length > 0)
  return parts.length > 1 ? parts : [str]
}
