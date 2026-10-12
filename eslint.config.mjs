import js from '@eslint/js'
import ts from 'typescript-eslint'
export default ts.config({ ignores: ['out/**', 'release/**', 'node_modules/**', '.cache/**', 'scripts/**'] }, js.configs.recommended, ...ts.configs.recommended, {
  files: ['**/*.ts', '**/*.tsx'], rules: { '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }] }
})
