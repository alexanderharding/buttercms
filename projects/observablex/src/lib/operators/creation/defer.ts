import { Observable } from '../../observable';
import { from, type ObservableInput, type ObservedValueOf } from './from';

/**
 * Creates an {@linkcode Observable} that lazily (on subscribe) calls a {@linkcode factory|ObservableInput factory}
 * to make an {@linkcode Observable} for each new {@linkcode ConsumerObserver|observer}.
 *
 * The {@linkcode factory|ObservableInput factory} function is called each time the Observable is subscribed to,
 *  allowing for deferred execution and fresh values for each observer.
 *
 * @example
 * import { defer } from '@xander/observable';
 *
 * // Convert a function that returns a Promise (eager) into an Observable (lazy)
 * const observable = defer(async () => fetch('https://example.com/api/data'));
 *
 * // First subscription - makes a new request
 * observable.subscribe((data) => console.log('First observer:', data));
 *
 * // Second subscription - makes another fresh request
 * observable.subscribe((data) => console.log('Second observer:', data));
 *
 * @param factory A function that returns an {@linkcode ObservableInput} when called.
 * @returns An {@linkcode Observable} that creates a new subscription to the factory result for each observer.
 * @function
 * @public
 */
export function defer<Input extends ObservableInput>(
	factory: () => Input,
): Observable<ObservedValueOf<Input>> {
	return new Observable((observer) => from(factory()).subscribe(observer));
}
