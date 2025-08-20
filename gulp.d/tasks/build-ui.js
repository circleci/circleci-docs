'use strict'
const { exec } = require('child_process')
const fs = require('fs')
const path = require('path')

function execPromise(cmd, opts = {}) {
  return new Promise((res, rej) => {
    exec(cmd, opts, (err, out, errout) => {
      console.log(out)
      if (errout) console.error(errout)
      err ? rej(err) : res()
    })
  })
}

module.exports = function buildUI(cb) {
  const UI_DIR = path.join(process.cwd(), 'ui')
  const UI_BUNDLE = path.join(process.cwd(), 'ui-bundle.zip')
  const BUILD_DIR = path.join(UI_DIR, 'build')
  const MODULES_DIR = path.join(UI_DIR, 'node_modules')
  const FORCE_INSTALL = process.env.FORCE_NPM_INSTALL === 'true'

  console.log('Building UI bundle...')
  // clean previous artifacts
  if (fs.existsSync(UI_BUNDLE)) fs.unlinkSync(UI_BUNDLE)
  if (fs.existsSync(BUILD_DIR)) fs.rmSync(BUILD_DIR, { recursive: true, force: true })

  // install dependencies unless already present or forced
  let installStep = (!FORCE_INSTALL && fs.existsSync(MODULES_DIR))
    ? Promise.resolve()
    : execPromise('npm install --no-save', { cwd: UI_DIR })
  installStep
    .then(() => execPromise('npx gulp bundle', { cwd: UI_DIR }))
    .then(() => {
      const src = path.join(UI_DIR, 'build', 'ui-bundle.zip')
      if (!fs.existsSync(src)) throw new Error(`no bundle at ${src}`)
      fs.copyFileSync(src, UI_BUNDLE)
    })
    .then(() => cb())
    .catch(err => cb(err))
}
