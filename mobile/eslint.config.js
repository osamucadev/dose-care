// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

const VIEW_MODEL_HINT = 'Screens are Views: get data and commands from a hook in view-models/.';

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', '.expo/*', 'android/*', 'ios/*'],
  },
  {
    // MVVM boundary: screens only render what their ViewModel exposes.
    files: ['app/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'expo-router',
              importNames: ['useRouter', 'router'],
              message: `Navigation is a ViewModel command. ${VIEW_MODEL_HINT}`,
            },
          ],
          patterns: [
            { group: ['@/services/*', '@/database/*', '@/domain/*'], message: VIEW_MODEL_HINT },
            {
              group: [
                '@/hooks/*',
                '!@/hooks/use-theme-color',
                '!@/hooks/use-color-scheme',
                '!@/hooks/use-dose-reminders',
                '!@/hooks/pending-dose-action-provider',
              ],
              message: `Data hooks belong to the ViewModel. ${VIEW_MODEL_HINT}`,
            },
          ],
        },
      ],
    },
  },
]);
