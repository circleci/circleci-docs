const js = require('@eslint/js')

module.exports = [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        fetch: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        FormData: 'readonly',
        HTMLElement: 'readonly',
        Element: 'readonly',
        Node: 'readonly',
        NodeList: 'readonly',
        Event: 'readonly',
        CustomEvent: 'readonly',
        getComputedStyle: 'readonly',
        location: 'readonly',
        history: 'readonly',
        Image: 'readonly',
        alert: 'readonly',
        confirm: 'readonly',
        prompt: 'readonly',
        // Node globals
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        Buffer: 'readonly',
        global: 'readonly',
        module: 'writable',
        require: 'readonly',
        exports: 'writable',
        // Vendor libraries (if needed)
        algoliasearch: 'readonly',
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
