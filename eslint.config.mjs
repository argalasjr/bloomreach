import ngrx from 'eslint-plugin-ngrx';
import _import from 'eslint-plugin-import';
import nx from '@nx/eslint-plugin';
import { fixupPluginRules } from '@eslint/compat';
import globals from 'globals';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import stylistic from '@stylistic/eslint-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  {
    ignores: [
      '**/node_modules',
      '**/dist',
      '**/coverage',
      '**/.angular',
      '**/.nyc_output',
      '**/documentation',
      '**/cypress',
      '.nx/cache',
      '**/index.html',
    ],
  },
  ...compat
    .extends(
      'plugin:@angular-eslint/recommended',
      'plugin:@angular-eslint/template/process-inline-templates',
      'plugin:@typescript-eslint/recommended',
      'plugin:prettier/recommended',
      'plugin:ngrx/recommended',
      'plugin:@nx/typescript',
    )
    .map((config) => ({
      ...config,
      files: ['**/*.ts'],
    })),
  {
    files: ['**/*.ts'],

    plugins: {
      ngrx,
      import: fixupPluginRules(_import),
      '@nx': nx,
      '@stylistic': stylistic,
    },

    languageOptions: {
      ecmaVersion: 5,
      sourceType: 'script',

      parserOptions: {
        project: ['tsconfig.eslint.json'],
        createDefaultProgram: true,
      },
    },

    rules: {
      'prefer-destructuring': 'off',

      'no-param-reassign': [
        'error',
        {
          props: false,
        },
      ],

      'no-iterator': 'off',
      'no-lonely-if': 'off',
      'no-console': 'off',
      'no-restricted-syntax': 'off',
      '@typescript-eslint/no-use-before-define': 'off',
      'no-plusplus': [
        'error',
        {
          allowForLoopAfterthoughts: true,
        },
      ],
      'class-methods-use-this': 'off',
      'no-underscore-dangle': 'off',
      'func-names': 'off',
      'prefer-arrow-callback': 'off',
      'prefer-arrow/prefer-arrow-functions': 'off',
      'import/prefer-default-export': 'off',
      'import/no-extraneous-dependencies': 'off',
      '@typescript-eslint/dot-notation': 'off',
      'no-useless-constructor': 0,
      '@typescript-eslint/no-useless-constructor': 'off',
      'no-empty-function': 0,
      '@typescript-eslint/no-empty-function': 'off',
      '@angular-eslint/no-empty-lifecycle-method': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      'no-prototype-builtins': 'off',
      '@stylistic/lines-between-class-members': [
        'error',
        'always',
        {
          exceptAfterSingleLine: true,
          exceptAfterOverload: true,
        },
      ],
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/no-input-rename': 'off'
    },
  },
  {
    files: ['**/*.spec.ts'],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
    rules: {},
  },
  ...compat
    .extends(
      'plugin:@angular-eslint/template/recommended',
      'plugin:prettier/recommended',
    )
    .map((config) => ({
      ...config,
      files: ['**/*.html'],
    })),
  {
    files: ['**/*.html'],
    languageOptions: {
      ecmaVersion: 5,
      sourceType: 'script',
      parserOptions: {
        project: ['tsconfig.eslint.json'],
      },
    },
    rules: {},
  },
];
