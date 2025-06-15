import globals from 'globals';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';

export default tseslint.config(
	eslint.configs.recommended,
	...tseslint.configs.strictTypeChecked,
	reactHooks.configs['recommended-latest'],
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
			},
			parserOptions: {
				project: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
	},
	{
		ignores: [
			'**/coverage/**',
			'**/dist/**',
			'**/node_modules/**',
			'**/__snapshots__/**',
		],
	},
	{
		rules: {
			'no-console': 'error',

			// The default is set to 'warn', but we want to enforce it strictly.
			'react-hooks/exhaustive-deps': 'error',
		},
	},
);
