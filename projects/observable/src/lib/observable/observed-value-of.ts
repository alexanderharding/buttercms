import { InteropObservable } from '../interop';
import { ObservableInput } from './observable-input';
import { Subscribable } from './subscribable';

/**
 * The value type of an {@linkcode ObservableInput}.
 */
export type ObservedValueOf<Input extends ObservableInput> =
	Input extends InteropObservable<infer Value>
		? Value
		: Input extends Subscribable<infer Value>
			? Value
			: never;
