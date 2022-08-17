const DOCS_GLOBALS = {
  AnalyticsClient: 'readonly',
  algoliasearch: 'readonly',
  amplitude: 'readonly',
  analytics: 'readonly',
  analyticsTrackProps: 'readonly',
  getSessionId: 'writable', // TODO: remove when legacy analytics is removed
  forceAll: 'writable',
  instantsearch: 'readonly',
  tooltip: 'readonly',
  trackEvent: 'readonly',
  userData: 'readonly',
};

const API_DOCS_GLOBALS = {
  activateLanguage: 'writable',
  click: 'writable',
  closest: 'writable',
  define: 'writable',
  getLanguageFromQueryString: 'writable',
  isThresholdReached: 'writable',
  loadToc: 'writable',
  lunr: 'writable',
  setupLanguages: 'writable',
  touchend: 'writable',
  touchmove: 'writable',
  touchstart: 'writable',
};

module.exports = {
  plugins: 'prettier',
  extends: [
    'eslint:recommended',
    'plugin:prettier/recommended',
    'prettier',
  ],
  globals: {
    ...DOCS_GLOBALS,
    ...API_DOCS_GLOBALS,
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    curly: [2, 'multi-line'],
    'eol-last': ['error', 'always'],
    'no-restricted-globals': [
      'warn',
      ...['name', 'event'].map((global) => ({
        name: global,
        message: `Did you mean to declare a local \`${global}\`? If not, use \`window.${global}\` instead.`,
      })),
    ],
    'arrow-body-style': ['warn', 'as-needed'],
    'no-console': 'error',
    'prefer-object-spread': 'warn',
    'prettier/prettier': 'error',
  },
  env: {
    browser: true,
    node: true,
    es6: true,
    es2021: true,
    jquery: true,
  },
  ignorePatterns: [
    '*.min.js',
    '*vendor*',
    'src-api/source/javascripts/lib/*.js',
  ],
};
