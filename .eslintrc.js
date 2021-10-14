module.exports = {
    plugins: [
        "jest",
        "prettier",
    ],
    extends: [
        "eslint:recommended",
        "plugin:jest/recommended",
        "plugin:prettier/recommended",
        "prettier",
    ],
    globals: {
        algoliasearch: "readonly",
        amplitude: "readonly",
        analytics: "readonly",
        analyticsTrackProps: "readonly",
        getSessionId: "writable", // legacy
        forceAll: "writable",
        hljs: "readonly",
        instantsearch: 'readonly',
        tooltip: "readonly",
        trackEvent: "readonly",
        userData: "readonly",
    },
    parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
    },
    rules: {
        curly: [2, "multi-line"],
        'eol-last': ["error","always"],
        "no-restricted-globals": [
        "warn",
        ...["name", "event"].map((global) => ({
            name: global,
            message: `Did you mean to declare a local \`${global}\`? If not, use \`window.${global}\` instead.`,
        })),
        ],
        "arrow-body-style": ["warn", "as-needed"],
        "no-console": "error",
        "prefer-object-spread": "warn",
        "prettier/prettier": "error",
    },
    env: {
        "jest/globals": true,
        browser: true,
        node: true,
        es6: true,
        es2021: true,
        jquery: true,
    },
};
