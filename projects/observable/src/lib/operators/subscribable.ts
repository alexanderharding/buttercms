import type { Observer } from '../observable';
import type { UnaryFunction } from '../pipe';

export interface Subscribable<Value = unknown> {
	subscribe(
		observerOrNext?: Partial<Observer<Value>> | UnaryFunction<Value> | null,
	): void;
}
