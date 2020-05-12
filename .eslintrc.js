module.exports = {
  root: true,
  env: {
    node: true,
  },
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
    'jest',
  ],
  extends: [
    'airbnb-typescript/base',
    'plugin:jest/recommended',
  ],
  parserOptions: {
    project: './tsconfig.json',
  },
}