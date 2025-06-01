import { InteropObservable } from './interop';
import { ObservableInput } from './observable-input';
import { Subscribable } from './subscription/subscribable';

/**
 * Extracts the value type of an {@linkcode ObservableInput}.
 */
export type ObservedValueOf<Input extends ObservableInput> =
	Input extends InteropObservable<infer Value>
		? Value
		: Input extends Subscribable<infer Value>
			? Value
			: never;
