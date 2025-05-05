import type { Observer } from '../observable';

/**
 * @public
 */
export interface Subscribable<Value = unknown> {
	subscribe(
		observerOrNext?:
			| Partial<Observer<Value>>
			| ((value: Value) => unknown)
			| null,
	): void;
}
