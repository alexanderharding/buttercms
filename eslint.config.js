// @ts-check
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');
const customPlugin = require('./linter/plugin');

module.exports = tseslint.config(
	{
		files: ['**/*.ts'],
		extends: [
			eslint.configs.recommended,
			...tseslint.configs.recommended,
			...tseslint.configs.stylistic,
			...angular.configs.tsRecommended,
			eslintPluginPrettierRecommended,
		],
		processor: angular.processInlineTemplates,
		languageOptions: {
			parserOptions: { project: true, tsconfigRootDir: __dirname },
		},
		plugins: { '@typescript-eslint': tsPlugin },
		rules: {
			'@typescript-eslint/array-type': ['error', { default: 'generic' }],
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					args: 'all',
					argsIgnorePattern: '^_',
					caughtErrors: 'all',
					caughtErrorsIgnorePattern: '^_',
					destructuredArrayIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					ignoreRestSiblings: true,
				},
			],
			'@typescript-eslint/naming-convention': [
				'error',
				{
					selector: [
						'variable',
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
					selector: ['classProperty'],
					format: ['camelCase', 'snake_case'],
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
			'no-restricted-imports': [
				'error',
				{
					paths: [
						{
							name: '@angular/core',
							importNames: ['NgModule'],
							message: 'Use the standalone API instead.',
						},
						{
							name: '@angular/common',
							importNames: ['CommonModule'],
							message: 'Import the standalone classes instead.',
						},
						{
							name: '@angular/common',
							importNames: [
								'NgIf',
								'NgForOf',
								'NgFor',
								'NgSwitch',
								'NgSwitchCase',
								'NgSwitchDefault',
							],
							message: 'Use built-in control flow syntax instead.',
						},
						{
							name: '@angular/common/http',
							importNames: ['HttpClientModule'],
							message: "Use 'provideHttpClient()' instead.",
						},
						{
							name: '@angular/common/http',
							importNames: ['HttpInterceptor'],
							message: "Use 'HttpInterceptorFn' instead.",
						},
						{
							name: '@angular/router',
							importNames: ['RouterModule'],
							message: "Use 'provideRouter()' instead.",
						},
						{
							name: '@angular/router',
							importNames: ['CanActivate'],
							message: "Use 'CanActivateFn' instead.",
						},
						{
							name: '@angular/router',
							importNames: ['CanLoadFn', 'CanMatch', 'CanLoad'],
							message: "Use 'CanMatchFn' instead.",
						},
						{
							name: '@angular/router',
							importNames: ['CanActivateChild'],
							message: "Use 'CanActivateChildFn' instead.",
						},
						{
							name: '@angular/router',
							importNames: ['CanDeactivate'],
							message: "Use 'CanDeactivateFn' instead.",
						},
						{
							name: '@angular/router',
							importNames: ['Resolve'],
							message: "Use 'ResolveFn' instead.",
						},
						{
							name: '@angular/core/testing',
							importNames: ['TestBed'],
						},
					],
					patterns: [
						{
							group: ['rxjs/internal/*', 'rxjs/operators/*', 'rxjs/operators'],
							message: "Import from 'rxjs' instead.",
						},
					],
				},
			],
			// Decide if we want this:
			'no-restricted-syntax': [
				'off',
				{
					selector:
						':matches(PropertyDefinition, MethodDefinition)[accessibility="private"]',
					message: 'Use #private instead',
				},
			],
			'@typescript-eslint/explicit-member-accessibility': [
				'error',
				{ accessibility: 'no-public' },
			],
			'@typescript-eslint/ban-tslint-comment': 'error',
			'@typescript-eslint/consistent-generic-constructors': 'error',
			'@typescript-eslint/consistent-indexed-object-style': 'error',
			'@typescript-eslint/consistent-type-assertions': [
				'error',
				{ assertionStyle: 'as', objectLiteralTypeAssertions: 'never' },
			],
			'@typescript-eslint/consistent-type-exports': [
				'error',
				{ fixMixedExportsWithInlineTypeSpecifier: true },
			],
			'default-param-last': 'off', // The base rule must be disabled as it can report incorrect errors
			'@typescript-eslint/default-param-last': 'error',
			'dot-notation': 'off', // The base rule must be disabled as it can report incorrect errors
			'@typescript-eslint/dot-notation': 'error',
			'@typescript-eslint/member-ordering': 'off', // @alexander
			'@typescript-eslint/no-array-delete': 'error',
			'@typescript-eslint/no-base-to-string': 'error',
			'@typescript-eslint/no-confusing-non-null-assertion': 'error',
			'@typescript-eslint/no-duplicate-type-constituents': 'error',
			'@typescript-eslint/no-dynamic-delete': 'error',
			'no-empty-function': 'off', // The base rule must be disabled as it can report incorrect errors
			'@typescript-eslint/no-empty-function': 'error',
			'@typescript-eslint/no-empty-interface': 'error',
			'@typescript-eslint/no-extraneous-class': 'off',
			'@typescript-eslint/no-floating-promises': 'error',
			'@typescript-eslint/no-for-in-array': 'error',
			'no-implied-eval': 'off', // The base rule must be disabled as it can report incorrect errors
			'@typescript-eslint/no-implied-eval': 'error',
			'@typescript-eslint/no-import-type-side-effects': 'error',
			'@typescript-eslint/no-inferrable-types': 'error',
			'@typescript-eslint/no-invalid-void-type': [
				'error',
				{ allowInGenericTypeArguments: true, allowAsThisParameter: true },
			],
			'no-loop-func': 'off', // The base rule must be disabled as it can report incorrect errors
			'@typescript-eslint/no-loop-func': 'error',
			'@typescript-eslint/no-meaningless-void-operator': 'error',
			'@typescript-eslint/no-misused-promises': 'error',
			'@typescript-eslint/no-non-null-asserted-nullish-coalescing': 'error',
			'@typescript-eslint/no-non-null-assertion': 'off',
			'@typescript-eslint/no-redundant-type-constituents': 'error',
			'@typescript-eslint/no-require-imports': 'error',
			'no-shadow': 'off', // The base rule must be disabled as it can report incorrect errors
			'@typescript-eslint/no-shadow': 'off',
			'no-throw-literal': 'off', // The base rule must be disabled as it can report incorrect errors
			'@typescript-eslint/only-throw-error': 'error',
			'@typescript-eslint/no-unnecessary-boolean-literal-compare': 'error',
			'@typescript-eslint/no-unnecessary-condition': 'off', // Maybe enable later, for now it's too strict
			'@typescript-eslint/no-unnecessary-qualifier': 'error',
			'@typescript-eslint/no-unnecessary-type-arguments': 'error',
			'@typescript-eslint/no-unnecessary-type-assertion': 'error',
			'@typescript-eslint/no-unsafe-argument': 'error',
			'@typescript-eslint/no-unsafe-assignment': 'error',
			'@typescript-eslint/no-unsafe-call': 'error',
			'@typescript-eslint/no-unsafe-enum-comparison': 'error',
			'@typescript-eslint/no-unsafe-member-access': 'error',
			'@typescript-eslint/no-unsafe-return': 'error',
			'no-use-before-define': 'off', // The base rule must be disabled as it can report incorrect errors
			'no-unused-expressions': 'off', // The base rule must be disabled as it can report incorrect errors
			'@typescript-eslint/no-unused-expressions': [
				'error',
				{
					allowShortCircuit: false,
					allowTernary: true,
					allowTaggedTemplates: false,
				},
			],
			'@typescript-eslint/no-use-before-define': [
				'error',
				{
					functions: false,
					classes: true,
					variables: true,
					allowNamedExports: false,
				},
			],
			'no-useless-constructor': 'off', // The base rule must be disabled as it can report incorrect errors
			'@typescript-eslint/no-useless-constructor': 'error',
			'@typescript-eslint/no-useless-empty-export': 'error',
			'@typescript-eslint/non-nullable-type-assertion-style': 'error',
			'@typescript-eslint/prefer-find': 'error',
			'@typescript-eslint/prefer-for-of': 'error',
			'@typescript-eslint/prefer-function-type': 'error',
			'@typescript-eslint/prefer-includes': 'error',
			'@typescript-eslint/prefer-literal-enum-member': 'error',
			'@typescript-eslint/prefer-nullish-coalescing': 'error',
			'@typescript-eslint/prefer-optional-chain': 'error',
			'prefer-promise-reject-errors': 'off', // The base rule must be disabled as it can report incorrect errors
			'@typescript-eslint/prefer-promise-reject-errors': 'error',
			'@typescript-eslint/prefer-readonly': 'error',
			'@typescript-eslint/prefer-readonly-parameter-types': 'off',
			'@typescript-eslint/prefer-reduce-type-parameter': 'error',
			'@typescript-eslint/prefer-regexp-exec': 'error',
			'@typescript-eslint/prefer-return-this-type': 'error',
			'@typescript-eslint/prefer-string-starts-ends-with': 'error',
			'@typescript-eslint/promise-function-async': 'error',
			'@typescript-eslint/require-array-sort-compare': 'error',
			'require-await': 'off', // The base rule must be disabled as it can report incorrect errors
			'@typescript-eslint/require-await': 'error',
			'@typescript-eslint/restrict-plus-operands': 'error',
			'@typescript-eslint/restrict-template-expressions': 'error',
			'no-return-await': 'off', // The base rule must be disabled as it can report incorrect errors
			'@typescript-eslint/return-await': 'error',
			'@typescript-eslint/unified-signatures': 'off', // Maybe enable later, for now it's too strict
			'@typescript-eslint/no-explicit-any': 'error',
			'@angular-eslint/prefer-on-push-component-change-detection': 'error',
			'@angular-eslint/directive-class-suffix': 'error',
			'@angular-eslint/no-pipe-impure': 'error',
			'@angular-eslint/use-pipe-transform-interface': 'error',
			'@angular-eslint/component-class-suffix': 'error',
			'@angular-eslint/no-empty-lifecycle-method': 'error',
			'@angular-eslint/no-lifecycle-call': 'error',
			'@angular-eslint/no-inputs-metadata-property': 'error',
			'@angular-eslint/no-outputs-metadata-property': 'error',
			'@angular-eslint/no-queries-metadata-property': 'error',
			'@angular-eslint/no-attribute-decorator': 'error',
			'@angular-eslint/use-lifecycle-interface': 'error',
			'@angular-eslint/use-component-view-encapsulation': 'error',
			'@angular-eslint/no-host-metadata-property': [
				'error',
				{ allowStatic: true },
			],
			'@angular-eslint/prefer-output-readonly': 'error',
			'@angular-eslint/prefer-standalone-component': 'error',
		},
	},
	{
		files: ['**/*.ts'],
		ignores: ['**/*spec.ts', '**/mock-factories/*.ts'],
		rules: { '@typescript-eslint/unbound-method': 'error' },
	},
	{
		files: ['**/projects/ngx-buttercms/src/lib/types/with-fields-prefix.ts'],
		rules: { '@typescript-eslint/no-explicit-any': 'off' },
	},
	{
		files: ['**/*.ts'],
		ignores: ['**/*component.ts'],
		rules: { '@typescript-eslint/no-extraneous-class': 'error' },
	},
	{
		files: ['**/*.html'],
		extends: [
			...angular.configs.templateRecommended,
			...angular.configs.templateAccessibility,
			// eslintPluginPrettierRecommended,
		],
		rules: {},
	},
	{
		files: ['**/*.ts'],
		ignores: [
			'**/projects/ngx-dependency-injection-interop/src/lib/functions/provide.spec.ts',
		],
		plugins: { custom: customPlugin },
		rules: { 'custom/no-untyped-provider': 'error' },
	},
);
