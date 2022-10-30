/**
 * @type {import('eslint').Linter.Config}
 */
module.exports = {
	env: {
		es2022: true,
		node: true
	},
	extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
		project: './tsconfig.eslint.json'
	},
	plugins: ['@typescript-eslint', 'deprecation'],
	rules: {
		'no-return-await': 'off',
		'@typescript-eslint/no-empty-interface': 'off',
		'no-mixed-spaces-and-tabs': 'off',
		'no-duplicate-imports': 'warn',
		'no-empty-function': 'off',
		'@typescript-eslint/no-empty-function': 'off',
		'no-empty': 'off',
		'@typescript-eslint/ban-ts-comment': [
			'error',
			{
				'ts-expect-error': 'allow-with-description',
				'ts-ignore': 'allow-with-description',
				'ts-nocheck': 'allow-with-description',
				'ts-check': 'allow-with-description',
				'minimumDescriptionLength': 5
			}
		],
		'@typescript-eslint/no-floating-promises': 'warn',
		'prefer-promise-reject-errors': 'warn',
		'@typescript-eslint/no-misused-promises': 'error',
		'@typescript-eslint/no-base-to-string': 'error',
		'no-loss-of-precision': 'off',
		'@typescript-eslint/no-loss-of-precision': 'error',
		'no-throw-literal': 'off',
		'@typescript-eslint/no-throw-literal': 'warn',
		'@typescript-eslint/prefer-nullish-coalescing': 'warn',
		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/no-non-null-assertion': 'off',
		'@typescript-eslint/explicit-module-boundary-types': 'off',
		'prefer-template': 'warn',
		'@typescript-eslint/no-this-alias': ['error', { allowDestructuring: true, allowedNames: ['that'] }],
		'@typescript-eslint/no-unused-vars': 'off' /* ['warn', { argsIgnorePattern: '^_' }] */,
		'no-implied-eval': 'off',
		'@typescript-eslint/no-implied-eval': ['error'],
		'deprecation/deprecation': 'warn',
		'@typescript-eslint/explicit-member-accessibility': ['warn', { accessibility: 'explicit' }],
		'@typescript-eslint/switch-exhaustiveness-check': 'warn',
		'@typescript-eslint/no-restricted-imports': [
			'error',
			{ paths: [{ name: 'console', importNames: ['assert'], message: 'Import from the `assert` module instead.' }] }
		],
		'@typescript-eslint/no-namespace': 'off',
		'no-debugger': 'warn',
		'@typescript-eslint/prefer-as-const': 'warn',
		'@typescript-eslint/ban-types': 'off',
		'@typescript-eslint/no-inferrable-types': 'off'
	}
};
