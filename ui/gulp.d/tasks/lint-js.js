'use strict'

const { ESLint } = require('eslint')
const { glob } = require('glob')

module.exports = (files) => async (done) => {
  try {
    // Convert glob patterns to file paths
    const filePaths = typeof files === 'string'
      ? await glob(files, { cwd: process.cwd() })
      : files

    // Create ESLint instance
    const eslint = new ESLint()

    // Lint files
    const results = await eslint.lintFiles(filePaths)

    // Format results
    const formatter = await eslint.loadFormatter('stylish')
    const resultText = formatter.format(results)

    // Output results
    if (resultText) {
      console.log(resultText)
    }

    // Check for errors
    const hasErrors = results.some((result) => result.errorCount > 0)
    if (hasErrors) {
      done(new Error('ESLint found errors'))
    } else {
      done()
    }
  } catch (error) {
    done(error)
  }
}
