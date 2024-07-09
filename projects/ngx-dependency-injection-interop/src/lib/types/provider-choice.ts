import {
	ValueProvider,
	FactoryProvider,
	Type,
	ClassProvider,
	ProviderToken,
	ExistingProvider,
} from '@angular/core';

/**
 * @description Describes how the `Injector` should return a value for the provided {@linkcode ProviderToken|token}. `TypeProvider` is excluded because it is already type-safe with a simpler API. `ConstructorProvider` is excluded because other options can support this behavior in a type-safe way.
 * @see {@linkcode ProviderChoice.useValue|useValue}
 * @see {@linkcode ProviderChoice.useFactory|useFactory}
 * @see {@linkcode ProviderChoice.useClass|useClass}
 * @see {@linkcode ProviderChoice.useExisting|useExisting}
 */
export type ProviderChoice<Value = unknown> = Readonly<{
	/**
	 * @description Configures the `Injector` to return a `value` for the provided {@linkcode ProviderToken|token}.
	 * @param {void} this Implicit and indicates to the TS compiler that this method will never reference the `this` keyword allowing it to be safely passed as an argument without a `this` binding.
	 * @param {Value} value The value to inject for the provided {@linkcode ProviderToken|token}.
	 * @returns {ValueProvider} The {@linkcode ValueProvider|value provider} for the provided {@linkcode ProviderToken|token}.
	 * @see {@linkcode ValueProvider}
	 * @see {@linkcode ProviderChoice}
	 * @example
	 * _.useValue("example");
	 */
	useValue(this: void, value: Value): ValueProvider;
	/**
	 * @description Configures the `Injector` to return a value by invoking a `factory` function.
	 * @param {void} this Implicit and indicates to the TS compiler that this method will never reference the `this` keyword allowing it to be safely passed as an argument without a `this` binding.
	 * @param {Function} factory A function to invoke to create a value for the provided {@linkcode ProviderToken|token}.
	 * @returns {Omit<FactoryProvider, "deps">} The {@linkcode FactoryProvider|factory provider} for the provided {@linkcode ProviderToken|token} omitting the optional untyped {@linkcode FactoryProvider.deps|deps} property.
	 * @see {@linkcode FactoryProvider}
	 * @see {@linkcode ProviderChoice}
	 * @example
	 * _.useFactory(() => new Example(inject(EXAMPLE_TOKEN)));
	 */
	useFactory(this: void, factory: () => Value): Omit<FactoryProvider, 'deps'>;
	/**
	 * @description Configures the `Injector` to return an instance of {@linkcode Type|type} for the provided {@linkcode ProviderToken|token}.
	 * @param {void} this Implicit and indicates to the TS compiler that this method will never reference the `this` keyword allowing it to be safely passed as an argument without a `this` binding.
	 * @param {Type<Value>} type The class to instantiate for the provided {@linkcode ProviderToken|token}.
	 * @returns {ClassProvider} The {@linkcode ClassProvider|class provider} for the provided {@linkcode ProviderToken|token}.
	 * @see {@linkcode ProviderChoice}
	 * @example
	 * _.useClass(Example);
	 */
	useClass(this: void, type: Type<Value>): ClassProvider;
	/**
	 * @description Configures the `Injector` to return a value of another {@linkcode ProviderToken|token}.
	 * @param {void} this Implicit and indicates to the TS compiler that this method will never reference the `this` keyword allowing it to be safely passed as an argument without a `this` binding.
	 * @param {ProviderToken<Value>} token The {@linkcode ProviderToken|token} to inject for the provided {@linkcode ProviderToken|token} (Equivalent to `injector.get(token)`).
	 * @returns {ExistingProvider} The {@linkcode ExistingProvider|existing provider} for the provided {@linkcode ProviderToken|token}.
	 * @see {@linkcode ExistingProvider}
	 * @see {@linkcode ProviderChoice}
	 * @example
	 * _.useExisting(EXAMPLE_TOKEN);
	 */
	useExisting(this: void, token: ProviderToken<Value>): ExistingProvider;
}>;
