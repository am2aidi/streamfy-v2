import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const nextCoreWebVitals = require('eslint-config-next/core-web-vitals')

export default [
  ...nextCoreWebVitals,
  {
    ignores: ['.next/**', 'out/**', 'node_modules/**'],
  },
  {
    rules: {
      // This repo uses effects for state hydration/initialization in a few places.
      // The rule is useful but currently too noisy for our patterns.
      'react-hooks/set-state-in-effect': 'off',
      // React Compiler guidance; safe to disable until we intentionally adopt it.
      'react-hooks/preserve-manual-memoization': 'off',
      // Style-only: fine for config files.
      'import/no-anonymous-default-export': 'off',
    },
  },
]
