// eslint.config.mjs
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import next from '@next/eslint-plugin-next'
import prettierConfig from 'eslint-config-prettier'
import prettierPlugin from 'eslint-plugin-prettier'
import reactHooks from 'eslint-plugin-react-hooks'

export default tseslint.config(
  // 1) ignores globais (equivalente ao "ignorePatterns")
  {
    ignores: [
      '**/temp.js',
      'config/*',
      '.next/*',
      'public/*',
      'node_modules/*',
      'data/*',
      '.next',
    ],
  },

  // 2) Regras base JS
  js.configs.recommended,

  // 3) Regras TS (sem type-check — mais rápido no Vercel)
  ...tseslint.configs.recommended,

  // 4) Regras Next (equivalente a "next/core-web-vitals" + recommended)
  next.configs['recommended'],
  next.configs['core-web-vitals'],

  // 5) Prettier: desliga conflitos
  prettierConfig,

  // 6) Seu bloco de projeto (plugins/rules extras)
  {
    plugins: {
      '@next/next': next,
      prettier: prettierPlugin,
      'react-hooks': reactHooks,
    },
    languageOptions: {
      // se quiser type-checked, troque para project:true + tsconfigRootDir
      parserOptions: {
        // project: true,
        // tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // mantém suas regras
      'prettier/prettier': [
        'error',
        { singleQuote: true, parser: 'flow' },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_|^err',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      '@next/next/no-img-element': 'error',
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-duplicate-enum-values': 'warn',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-asserted-optional-chain': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',

      // opcional porque o Next já aplica via core-web-vitals, mas você queria como warn:
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/rules-of-hooks': 'warn',
    },
  },
)
