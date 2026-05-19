const js = require('@eslint/js')
const globals = require('globals')

module.exports = [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: {
        ...globals.browser,
        ...globals.node,
        // Vendor libraries
        algoliasearch: 'readonly',
        simpleDatatables: 'readonly',
      },
    },
    rules: {
      // Custom rules from original .eslintrc
      'arrow-parens': ['error', 'always'],
      'comma-dangle': ['error', {
        arrays: 'always-multiline',
        objects: 'always-multiline',
        imports: 'always-multiline',
        exports: 'always-multiline',
      }],
      'no-restricted-properties': ['error', {
        property: 'substr',
        message: 'Use String#slice instead.',
      }],
      'max-len': ['warn', 120, 2],
      'spaced-comment': 'off',
      radix: ['error', 'always'],

      // Standard-style rules (common conventions)
      semi: ['error', 'never'],
      quotes: ['error', 'single', { avoidEscape: true }],
      'space-before-function-paren': ['error', 'always'],
      'keyword-spacing': ['error', { before: true, after: true }],
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      'comma-spacing': ['error', { before: false, after: true }],
      'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0 }],
      'no-trailing-spaces': 'error',
      indent: ['error', 2, { SwitchCase: 1 }],
      'eol-last': ['error', 'always'],
    },
  },
  {
    // Ignore patterns
    ignores: [
      'node_modules/**',
      'build/**',
      'public/**',
      '**/*.min.js',
      '**/vendor/**',
    ],
  },
]
