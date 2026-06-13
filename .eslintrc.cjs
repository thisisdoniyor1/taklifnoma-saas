module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  plugins: ['react-refresh'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  ignorePatterns: [
    'dist/',
    'node_modules/',
    '.next/',
    'coverage/',
    'vite.config.js.timestamp-*.mjs',
  ],
  rules: {
    'no-empty': ['error', { allowEmptyCatch: true }],
    'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^React$' }],
    'react/no-unescaped-entities': 'off',
    'react/prop-types': 'off',
    'react-refresh/only-export-components': 'off',
  },
};
