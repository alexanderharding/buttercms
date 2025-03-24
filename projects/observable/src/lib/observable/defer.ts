import { type ObservableInput, from, type ObservedValueOf } from './from';
import { Observable } from './observable';

/**
 * Creates an {@linkcode Observable} that lazily (on subscribe) calls a {@linkcode factory|ObservableInput factory}
 * to make an {@linkcode Observable} for each new Observer.
 *
 * The {@linkcode factory|ObservableInput factory} function is called each time the Observable is subscribed to,
 *  allowing for deferred execution and fresh values for each subscriber.
 *
 * @example
 * import { defer } from 'observable';
 *
 * // Convert a function that returns a Promise (eager) into an Observable (lazy)
 * const observable = defer(async () => fetch('https://example.com/api/data'));
 *
 * // First subscription - makes a new request
 * observable.subscribe((data) => console.log('First subscriber:', data));
 *
 * // Second subscription - makes another fresh request
 * observable.subscribe((data) => console.log('Second subscriber:', data));
 *
 * @param factory A function that returns an {@linkcode ObservableInput} when called.
 * @returns An {@linkcode Observable} that creates a new subscription to the factory result for each subscriber.
 * @function
 * @public
 */
export function defer<Input extends ObservableInput>(
	factory: () => Input,
): Observable<ObservedValueOf<Input>> {
	return new Observable((subscriber) => from(factory()).subscribe(subscriber));
}
