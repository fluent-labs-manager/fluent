import tseslint from 'typescript-eslint'
import eslintPluginPrettier from 'eslint-plugin-prettier'
import eslintConfigPrettier from 'eslint-config-prettier'
import pluginVue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'

export default [
  // Vue recommended rules
  ...pluginVue.configs['flat/recommended'],

  // TypeScript strict + stylistic (type-checked)
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  {
    files: ['**/*.ts', '**/*.tsx', '**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        projectService: true,
        extraFileExtensions: ['.vue'],
        sourceType: 'module',
      },
    },
  },

  // Disable Prettier-conflicting rules
  { rules: eslintConfigPrettier.rules },

  // Prettier plugin
  {
    plugins: {
      prettier: eslintPluginPrettier,
    },
    rules: {
      'prettier/prettier': 'error',
    },
  },

  // Custom TypeScript rules (inherited from base config)
  {
    rules: {
      '@typescript-eslint/prefer-promise-reject-errors': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/strict-boolean-expressions': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/prefer-readonly': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/prefer-for-of': 'error',
      '@typescript-eslint/restrict-template-expressions': 'error',
      eqeqeq: ['error', 'always'],
      'no-console': 'warn',
      curly: ['error', 'all'],
      'no-throw-literal': 'error',
    },
  },

  // Vue-specific rules
  {
    files: ['**/*.vue'],
    rules: {
      // Component naming
      'vue/component-name-in-template-casing': ['error', 'PascalCase'],
      'vue/component-definition-name-casing': ['error', 'PascalCase'],

      // Script setup preferred
      'vue/prefer-import-from-vue': 'error',

      // Composition API
      'vue/define-macros-order': [
        'error',
        {
          order: ['defineOptions', 'defineProps', 'defineEmits', 'defineSlots'],
        },
      ],

      // Accessibility & template quality
      'vue/no-unused-vars': 'error',
      'vue/no-template-shadow': 'error',
      'vue/require-v-for-key': 'error',
      'vue/no-use-v-if-with-v-for': 'error',
      'vue/no-v-html': 'warn',
      'vue/eqeqeq': ['error', 'always'],

      // Disabled: handled by Prettier
      'vue/html-indent': 'off',
      'vue/max-attributes-per-line': 'off',
      'vue/html-self-closing': 'off',
    },
  },

  // Ignores
  {
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**', 'node_modules/', '*.config.*', 'scripts/', 'public/']
  },
]
