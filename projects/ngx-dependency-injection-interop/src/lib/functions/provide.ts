import { ProviderToken } from '@angular/core';
import { ProvideOptions, ProviderChoice } from '../types';

/**
 * @description A {@linkcode ProvideOptions.multi|single-provider} factory.
 * @usage Type-safe {@linkcode ProvideOptions.multi|single-provider} creation.
 * @param {ProviderToken<Value>} token The {@linkcode ProviderToken|token} to provide.
 * @returns {ProviderChoice<Value>} The {@linkcode ProviderChoice|provider choice} for the provided {@linkcode ProviderToken|token}.
 * @see {@linkcode ProviderToken}
 * @see {@linkcode ProviderChoice}
 */
export function provide<Value>(
	token: ProviderToken<Value>,
): ProviderChoice<Value>;
/**
 * @description A {@linkcode ProvideOptions.multi|multi-provider} factory.
 * @usage Type-safe {@linkcode ProvideOptions.multi|multi-provider} creation.
 * @param {ProviderToken<ReadonlyArray<Value>>} token The {@linkcode ProviderToken|token} to provide.
 * @param {ProvideOptions<true>} options The {@linkcode ProvideOptions|options} for the provided {@linkcode ProviderToken|token}.
 * @returns {ProviderChoice<Value>} The {@linkcode ProviderChoice|provider choice} for the provided {@linkcode ProviderToken|token}.
 * @see {@linkcode ProviderToken}
 * @see {@linkcode ProvideOptions}
 * @see {@linkcode ProviderChoice}
 */
export function provide<Value>(
	token: ProviderToken<ReadonlyArray<Value>>,
	options: ProvideOptions<true>,
): ProviderChoice<Value>;
/**
 * @description A {@linkcode ProvideOptions.multi|single-provider} factory.
 * @usage Type-safe {@linkcode ProvideOptions.multi|single-provider} creation.
 * @param {ProviderToken<Value>} token The {@link ProviderToken|token} to provide.
 * @param {ProvideOptions<false>} options The options for the provided {@link ProviderToken|token}.
 * @returns {ProviderChoice<Value>} The {@link ProviderChoice|provider choice} for the provided {@link ProviderToken|token}.
 * @see {@linkcode ProviderToken}
 * @see {@linkcode ProvideOptions}
 * @see {@linkcode ProviderChoice}
 */
export function provide<Value>(
	token: ProviderToken<Value>,
	options: ProvideOptions<false>,
): ProviderChoice<Value>;
export function provide(
	provide: ProviderToken<unknown>,
	{ multi = false }: ProvideOptions = {},
): ProviderChoice {
	const partial = { provide, multi } as const;
	return {
		useValue: (useValue) => ({ ...partial, useValue }),
		useFactory: (useFactory) => ({ ...partial, useFactory }),
		useClass: (useClass) => ({ ...partial, useClass }),
		useExisting: (useExisting) => ({ ...partial, useExisting }),
	};
}
