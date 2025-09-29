import normal from 'prefer-code-style/eslint/preset/normal'
import typescriptStrict from 'prefer-code-style/eslint/typescript-strict'

export default [
  ...normal,
  ...typescriptStrict,
  {
    ignores: ['dist/**'],
  },
]
