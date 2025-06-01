import { InteropObservable } from './interop';
import { Subscribable } from './subscription';

/**
 * A type that can be converted to an `Observable`.
 */
export type ObservableInput<Value = unknown> =
	| InteropObservable<Value>
	| Subscribable<Value>;
