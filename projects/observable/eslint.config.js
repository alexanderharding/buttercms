// @ts-check
const tseslint = require('typescript-eslint');
const rootConfig = require('../../eslint.config.js');

module.exports = tseslint.config(
	...rootConfig,
	{
		files: ['**/*.ts'],
		rules: {
			'@angular-eslint/directive-selector': [
				'error',
				{
					type: 'attribute',
					prefix: 'lib',
					style: 'camelCase',
				},
			],
			'@angular-eslint/component-selector': [
				'error',
				{
					type: 'element',
					prefix: 'lib',
					style: 'kebab-case',
				},
			],
			'@typescript-eslint/naming-convention': [
				'error',
				{
					selector: [
						'accessor',
						'method',
						'function',
						'parameterProperty',
						'enumMember',
					],
					format: ['camelCase'],
					leadingUnderscore: 'forbid',
					trailingUnderscore: 'forbid',
				},
				{
					selector: ['variable'],
					format: ['camelCase', 'PascalCase'],
					leadingUnderscore: 'forbid',
					trailingUnderscore: 'forbid',
				},
				{
					selector: ['classProperty'],
					format: ['camelCase'],
					leadingUnderscore: 'forbid',
					trailingUnderscore: 'forbid',
				},
				{
					selector: ['parameter'],
					format: ['camelCase'],
					leadingUnderscore: 'allow',
					trailingUnderscore: 'forbid',
				},
				{
					selector: ['typeAlias', 'interface', 'class', 'enum'],
					format: ['PascalCase'],
					leadingUnderscore: 'forbid',
					trailingUnderscore: 'forbid',
				},
			],
		},
	},
	{
		files: ['**/*.html'],
		rules: {},
	},
);
