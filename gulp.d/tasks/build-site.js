'use strict'
const { exec } = require('child_process')
const fs = require('fs')
const path = require('path')
require('@dotenvx/dotenvx').config()
const antoraPlaybook = 'antora-playbook.yml'
const buildApiDocs = require('./build-api-docs')

const resolvedPath =  require.resolve('../../extensions/page-metadata-extension');
const resolvedPathExportExtension = require.resolve('../../extensions/export-content-extension');
const { convertHtmlToMarkdown } = require('../../scripts/convert-html-to-markdown');
console.log('Resolved path:', resolvedPath);


function copyLlmsTxt() {
  const metaPath = path.join(__dirname, '../../extensions/.temp/llms-meta.json')
  if (!fs.existsSync(metaPath)) {
    console.log('No llms.txt metadata found, skipping copy')
    return
  }

  const metadata = JSON.parse(fs.readFileSync(metaPath, 'utf8'))
  const { sourceFile, outputDir } = metadata

  if (!fs.existsSync(sourceFile)) {
    console.log('llms.txt source file not found, skipping')
    return
  }

  const destPath = path.join(outputDir, 'llms.txt')
  fs.copyFileSync(sourceFile, destPath)
  console.log(`✅ Copied llms.txt to ${destPath}`)
}

module.exports = function buildSite(cb) {
  console.log('Starting Antora build...')

  const isCI = process.env.CI === 'true'
  const explicitSetting = process.env.ENABLE_MARKDOWN_EXPORT
  const enableMarkdown = explicitSetting !== undefined
    ? explicitSetting === 'true'
    : isCI

  if (enableMarkdown) {
    console.log('Markdown export enabled' + (isCI ? ' (CI environment)' : ''))
  } else {
    console.log('Skipping markdown export for faster local builds (set ENABLE_MARKDOWN_EXPORT=true to enable)')
  }

  exec(`npx antora ${antoraPlaybook} --log-failure-level=warn --extension ${resolvedPath} --extension ${resolvedPathExportExtension} --key segment_write=${process.env.SEGMENT_WRITE_KEY || null} ${process.env.COOKIEBOT ? `--key cookiebot=${process.env.COOKIEBOT}` : ''}`, async (err, stdout, stderr) => {
    console.log(stdout)
    if (stderr) console.error(stderr)
    if (err) return cb(err)

    // Convert HTML to markdown after Antora exits so its memory is fully freed first
    if (enableMarkdown) {
      const buildDir = path.resolve(path.join(__dirname, '../../build'))
      const siteUrl = 'https://circleci.com/docs'
      try {
        await convertHtmlToMarkdown(buildDir, siteUrl)
      } catch (mdErr) {
        console.error('Markdown conversion failed:', mdErr)
      }
    }

    // Copy llms.txt to build directory
    copyLlmsTxt()

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
