module.exports = {
  root: true,
  env: { browser: true, es2020: true, jest: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['react', 'react-hooks'],
  rules: {
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'no-useless-catch': 'error',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  globals: {
    global: 'readonly',
  },
};
