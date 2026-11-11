import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'server/dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          // `_next`: Express needs 4 parameters to recognise an error handler.
          argsIgnorePattern: '^_',
          // `const { boardGameId, ...play } = row` drops a field on purpose.
          ignoreRestSiblings: true,
        },
      ],
    },
  },
  {
    // React app
    files: ['src/**/*.{ts,tsx}', 'tests/**/*.ts'],
    extends: [reactHooks.configs.flat.recommended, reactRefresh.configs.vite],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    // Express API
    files: ['server/**/*.ts', 'vite.config.ts'],
    languageOptions: {
      globals: globals.node,
    },
  },
])
