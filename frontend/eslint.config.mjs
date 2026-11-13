// @ts-check
import angular from 'angular-eslint';
import tseslint from 'typescript-eslint';

const unsafeHtmlSinks = [
  {
    selector: "MemberExpression[property.name=/^(innerHTML|outerHTML)$/]",
    message: 'No innerHTML or outerHTML (standard s.24). Bind text with interpolation instead.',
  },
  {
    selector: "CallExpression[callee.property.name='insertAdjacentHTML']",
    message: 'No HTML string insertion (standard s.24).',
  },
  {
    selector: 'MemberExpression[property.name=/^bypassSecurityTrust/]',
    message: 'No bypassSecurityTrust* calls (standard s.24).',
  },
];

const browserStorage = {
  selector: 'MemberExpression[property.name=/^(localStorage|sessionStorage)$/]',
  message:
    'Browser storage holds the theme preference only (DahcThemeService) and the authorization redirect state (AuthRedirectStorage); never tokens or personal data (standard s.24).',
};

export default tseslint.config(
  {
    ignores: ['dist/**', 'out-tsc/**', '.angular/**', 'node_modules/**', 'tests/playwright/test-results/**', 'tests/playwright/playwright-report/**'],
  },
  {
    files: ['**/*.ts'],
    extends: [...tseslint.configs.strict, ...tseslint.configs.stylistic, ...angular.configs.tsRecommended],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/component-selector': [
        'error',
        { type: ['element', 'attribute'], prefix: 'dahc', style: 'kebab-case' },
      ],
      '@angular-eslint/directive-selector': ['error', { type: 'attribute', prefix: 'dahc', style: 'camelCase' }],
      '@angular-eslint/prefer-on-push-component-change-detection': 'error',
      '@angular-eslint/prefer-signals': 'error',
      '@angular-eslint/prefer-standalone': 'error',
      '@angular-eslint/no-input-rename': 'error',
      '@angular-eslint/no-output-rename': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'error',
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      // Angular declares event-only outputs as output<void>(), a type argument of a call.
      '@typescript-eslint/no-invalid-void-type': 'off',
      'no-restricted-syntax': ['error', ...unsafeHtmlSinks, browserStorage],
    },
  },
  {
    files: [
      'projects/dahc-ui/src/lib/core/theme/theme.service.ts',
      'projects/dahc-portal/src/app/core/auth/auth-redirect-storage.ts',
    ],
    rules: {
      'no-restricted-syntax': ['error', ...unsafeHtmlSinks],
    },
  },
  {
    files: ['**/*.html'],
    extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility],
    rules: {
      '@angular-eslint/template/prefer-control-flow': 'error',
      '@angular-eslint/template/prefer-self-closing-tags': 'error',
      '@angular-eslint/template/no-any': 'error',
      'no-restricted-syntax': [
        'error',
        {
          selector: "BoundAttribute[name=/^(innerHTML|outerHTML)$/]",
          message: 'No innerHTML binding (standard s.24).',
        },
      ],
    },
  },
  {
    files: ['projects/dahc-portal/src/app/**/*.html'],
    rules: {
      // The same custom id is reused on purpose where the same text appears more than once.
      '@angular-eslint/template/i18n': [
        'error',
        { checkId: true, checkText: true, checkAttributes: false, checkDuplicateId: false, ignoreTags: ['dahc-tag'] },
      ],
    },
  },
);
