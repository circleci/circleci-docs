'use strict'

const fs = require('fs-extra')
const ospath = require('path')
const zip = (() => {
  try {
    return require('@vscode/gulp-vinyl-zip')
  } catch {
    return require('gulp-vinyl-zip')
  }
})()

module.exports = (src, dest, bundleName, onFinish) => () => {
  // Ensure the source directory exists before attempting to pack
  if (!fs.existsSync(src)) {
    return Promise.reject(new Error(`Source directory does not exist: ${src}`))
  }

  const vfs = require('vinyl-fs')
  return vfs
    .src('**/*', { base: src, cwd: src, dot: true })
    .pipe(zip.dest(ospath.join(dest, `${bundleName}-bundle.zip`)))
    .on('finish', () => onFinish && onFinish(ospath.resolve(dest, `${bundleName}-bundle.zip`)))
}
