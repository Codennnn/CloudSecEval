import nestPreset from 'prefer-code-style/eslint/preset/nest'

export default [
  {
    ignores: ['generated/**/*'],
  },

  ...nestPreset,

  {
    rules: {
      '@typescript-eslint/no-extraneous-class': [
        1,
        {
          allowEmpty: true,
          allowStaticOnly: true,
        },
      ],
    },
  },
]
