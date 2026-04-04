const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const eslintPluginPrettier = require('eslint-plugin-prettier/recommended');
const globals = require('globals');

module.exports = tseslint.config(
  {
    ignores: ['eslint.config.js'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettier,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname, // replace import.meta.dirname
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-enum-comparison': 'off',
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
    },
  },
);
