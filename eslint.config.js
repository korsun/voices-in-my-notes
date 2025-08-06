import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { globalIgnores } from 'eslint/config';

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/consistent-type-imports': 'warn',
      'no-console': 'warn',
      'no-debugger': 'error',
      semi: ['error', 'always'],
      'newline-after-var': 'error',
      'newline-before-return': 'error',
      'comma-dangle': ['error', 'always-multiline'],
      curly: 'error',
      'padding-line-between-statements': [
        'error',
        {
          blankLine: 'always',
          prev: '*',
          next: 'return',
        },
        {
          blankLine: 'always',
          prev: '*',
          next: 'block-like',
        },
        {
          blankLine: 'always',
          prev: 'block-like',
          next: '*',
        },
        {
          blankLine: 'never',
          prev: 'case',
          next: 'default',
        },
        {
          blankLine: 'never',
          prev: 'case',
          next: 'case',
        },
        {
          blankLine: 'any',
          prev: '*',
          next: 'break',
        },
        {
          blankLine: 'always',
          prev: '*',
          next: ['const', 'let', 'var'],
        },
        {
          blankLine: 'always',
          prev: ['const', 'let', 'var'],
          next: '*',
        },
        {
          blankLine: 'any',
          prev: ['const'],
          next: ['const'],
        },
        {
          blankLine: 'any',
          prev: ['let'],
          next: ['let'],
        },
      ],
      quotes: [
        'error',
        'single',
        {
          avoidEscape: true,
        },
      ],
      'sort-imports': [
        'error',
        {
          ignoreDeclarationSort: true,
        },
      ],
    },
  },
]);
