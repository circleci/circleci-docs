'use strict'
const { exec } = require('child_process')
const fs = require('fs')
const path = require('path')
require('@dotenvx/dotenvx').config()
const antoraPlaybook = 'antora-playbook.yml'
const buildApiDocs = require('./build-api-docs')

const resolvedPath =  require.resolve('../../extensions/page-metadata-extension');
const resolvedPathExportExtension = require.resolve('../../extensions/export-content-extension');
const resolvedPathMarkdownExtension = require.resolve('../../extensions/markdown-export-extension');
console.log('Resolved path:', resolvedPath);

function copyMarkdownFiles() {
  const metaPath = path.join(__dirname, '../../extensions/.temp/markdown-meta.json')
  if (!fs.existsSync(metaPath)) {
    console.log('No markdown metadata found, skipping markdown copy')
    return
  }

  const metadata = JSON.parse(fs.readFileSync(metaPath, 'utf8'))
  const { tempDir, outputDir } = metadata

  if (!fs.existsSync(tempDir)) {
    console.log('Markdown temp directory not found, skipping')
    return
  }

  console.log(`Copying ${metadata.fileCount} markdown files to build directory...`)

  // Recursively copy all files from tempDir to outputDir
  function copyRecursive(src, dest) {
    if (fs.statSync(src).isDirectory()) {
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true })
      }
      fs.readdirSync(src).forEach(item => {
        copyRecursive(path.join(src, item), path.join(dest, item))
      })
    } else {
      fs.copyFileSync(src, dest)
    }
  }

  copyRecursive(tempDir, outputDir)
  console.log(`✅ Copied ${metadata.fileCount} markdown files to ${outputDir}`)
}

module.exports = function buildSite(cb) {
  console.log('Starting Antora build...')

  // Enable markdown generation in CI environments by default, but allow explicit override
  const isCI = process.env.CI === 'true'
  const explicitSetting = process.env.ENABLE_MARKDOWN_EXPORT
  const enableMarkdown = explicitSetting !== undefined
    ? explicitSetting === 'true'
    : isCI

  const markdownExtension = enableMarkdown ? `--extension ${resolvedPathMarkdownExtension}` : ''

  if (enableMarkdown) {
    console.log('Markdown export enabled' + (isCI ? ' (CI environment)' : ''))
  } else {
    console.log('Skipping markdown export for faster local builds (set ENABLE_MARKDOWN_EXPORT=true to enable)')
  }

  exec(`npx antora ${antoraPlaybook} --log-failure-level=warn --extension ${resolvedPath} --extension ${resolvedPathExportExtension} ${markdownExtension} --key segment_write=${process.env.SEGMENT_WRITE_KEY || null} ${process.env.COOKIEBOT ? `--key cookiebot=${process.env.COOKIEBOT}` : ''}`, (err, stdout, stderr) => {
    console.log(stdout)
    if (stderr) console.error(stderr)
    if (err) return cb(err)

    // Copy markdown files from temp to build directory (only if enabled)
    if (enableMarkdown) {
      copyMarkdownFiles()
    }

    // After Antora build succeeds, build API docs
    console.log('Antora build completed, now building API docs...')
    buildApiDocs((apiErr) => {
      if (apiErr) {
        console.error('API docs build failed, but continuing...')
        console.error(apiErr)
      }
      cb()
    })
  })
}
