//@ts-check
import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
//@ts-expect-error: no types
import importPlugin from 'eslint-plugin-import';
import tseslint from 'typescript-eslint';

export default tseslint.config(
	eslint.configs.recommended,
	tseslint.configs.recommendedTypeChecked,
	// tseslint.configs.strictTypeChecked,
	importPlugin.flatConfigs.recommended,
	importPlugin.flatConfigs.typescript,
	eslintConfigPrettier,
	{
		ignores: ['dist', '.yarn', 'node_modules', '*.nnb', 'tooltips*'],

		languageOptions: {
			parserOptions: {
				ecmaVersion: 'latest',
				sourceType: 'module',
				project: './tsconfig.eslint.json'
			}
		},

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
					'ts-check': false,
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
			'@typescript-eslint/only-throw-error': 'warn',
			'@typescript-eslint/prefer-nullish-coalescing': 'warn',
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-non-null-assertion': 'off',
			'@typescript-eslint/explicit-module-boundary-types': 'off',
			'prefer-template': 'warn',
			'@typescript-eslint/no-this-alias': ['error', { allowDestructuring: true, allowedNames: ['that'] }],
			'@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
			'no-implied-eval': 'off',
			'@typescript-eslint/no-implied-eval': ['error'],
			'@typescript-eslint/no-deprecated': 'warn',
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
			'@typescript-eslint/no-inferrable-types': 'off',
			'@typescript-eslint/no-unsafe-declaration-merging': 'off',
			'prefer-const': 'warn',
			'import/no-unresolved': 'off', // until it supports subpath imports
			'import/extensions': ['error', 'ignorePackages'],
			'import/no-cycle': 'error'
		}
	}
);
