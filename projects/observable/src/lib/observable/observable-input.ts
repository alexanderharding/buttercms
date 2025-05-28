import { InteropObservable } from './interop';
import { Subscribable } from './subscription/subscribable';

/**
 * A type that can be converted to an {@linkcode Observable}.
 */
export type ObservableInput<Value = unknown> =
	| InteropObservable<Value>
	| Subscribable<Value>;
