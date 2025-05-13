'use strict'

module.exports = (...args) => {
  args.pop()
  return args.join(' ')
}
