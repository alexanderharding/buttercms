import type { Observer, Subscriber } from 'subscriber';
import type { TeardownLogic, Unsubscribable } from 'subscription';
import { Observable } from './observable';

export const subscribable = Symbol('subscribable');

export interface Subscribable<T = unknown> {
	[subscribable](observer: Subscriber<T>): TeardownLogic;
}

export function isSubscribable<T>(value: unknown): value is Subscribable<T> {
	return typeof value === 'object' && value !== null && subscribable in value;
}

export function from<T>(value: Subscribable<T>): Observable<T> {
	return new Observable((subscriber) => value[subscribable](subscriber));
}

export function fromPromise<T>(promise: PromiseLike<T>): Observable<T> {
	return new Observable((subscriber) => {
		promise.then(
			(value) => {
				// A side-effect may have closed our subscriber,
				// check before the resolved value is emitted.
				if (subscriber.closed) return;
				subscriber.next(value);
				subscriber.complete();
			},
			(err) => subscriber.error(err),
		);
	});
}

export function fromIterable<T>(iterable: Iterable<T>): Observable<T> {
	return from({
		[subscribable](subscriber) {
			for (const value of iterable) {
				if (subscriber.closed) return;
				subscriber.next(value);
			}
			subscriber.complete();
		},
	});
}
