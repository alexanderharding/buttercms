import type { Observer } from '../observer';
import type { SubscriptionObserver } from './subscription-observer';

/**
 * Object interface for a {@linkcode SubscriptionObserver} factory.
 */
export interface SubscriptionObserverConstructor {
	new (
		observerOrNext?: Partial<Observer> | ((value: unknown) => unknown) | null,
	): SubscriptionObserver;
	new <Value>(
		observerOrNext?:
			| Partial<Observer<Value>>
			| ((value: Value) => unknown)
			| null,
	): SubscriptionObserver<Value>;
	readonly prototype: SubscriptionObserver;
}
