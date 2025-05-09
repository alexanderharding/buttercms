import type { ConsumerObserver } from '../observable';

/**
 * @public
 */
export interface Subscribable<Value = unknown> {
	subscribe(
		observerOrNext?:
			| Partial<ConsumerObserver<Value>>
			| ((value: Value) => unknown)
			| null,
	): void;
}
