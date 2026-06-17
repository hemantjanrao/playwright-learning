import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginPlaywright from 'eslint-plugin-playwright';
import eslintConfigPrettier from 'eslint-config-prettier';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    ignores: [
      'node_modules/**',
      'reports/**',
      'test-results/**',
      'playwright-report/**',
      'auth/.auth/**',
    ],
  },
  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
    },
  },
  {
    ...eslintPluginPlaywright.configs['flat/recommended'],
    files: ['tests/**/*.ts'],
  },
  {
    files: ['fixtures/**/*.ts'],
    rules: {
      'no-empty-pattern': 'off',
    },
  },
);
