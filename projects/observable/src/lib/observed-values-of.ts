import type { ObservableInput } from './observable-input';
import type { ObservedValueOf } from './observed-value-of';

/**
 * Similar to {@linkcode ObservedValueOf} except that it can be used to extract the
 * {@linkcode ObservedValueOf} of each element in a record or array of {@linkcode ObservableInput}'s.
 */
export type ObservedValuesOf<
	Inputs extends
		| Readonly<Record<PropertyKey, ObservableInput>>
		| ReadonlyArray<ObservableInput>,
> = Readonly<{
	[Key in keyof Inputs]: Inputs[Key] extends ObservableInput
		? ObservedValueOf<Inputs[Key]>
		: unknown;
}>;
