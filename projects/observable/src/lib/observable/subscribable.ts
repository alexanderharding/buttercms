import type { Observer } from './observer';

/**
 * Object interface that implements a `subscribe` method for the purpose of setting up a subscription.
 */
export interface Subscribable<Value = unknown> {
	/**
	 * The act of a consumer requesting from an {@linkcode Subscribable|subscribable} to
	 * set up a subscription so that it may observe a producer.
	 */
	subscribe(
		observerOrNext?:
			| Partial<Observer<Value>>
			| ((value: Value) => unknown)
			| null,
	): void;
}
