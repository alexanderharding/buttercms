import { Observable } from './observable';
import { type InteropObservable } from './interop';
import { ObservableInput } from './observable-input';
import { ObservedValueOf } from './observed-value-of';
import type { Observer } from './observer';
import type { Subscribable } from './subscription';

/**
 * Object interface for an {@linkcode Observable} factory.
 */
export interface ObservableConstructor {
	new (): Observable<never>;
	new (subscribe: undefined | null): Observable<never>;
	/**
	 * Creates a template for connecting a producer to a consumer via a {@linkcode Subscribable.subscribe|subscribe} action.
	 * @param subscribe The function called for each {@linkcode Subscribable.subscribe|subscribe} action.
	 * @example
	 * Creating an observable with a synchronous producer.
	 * ```ts
	 * import { Observable } from '@xander/observable';
	 *
	 * const observable = new Observable<number>((observer) => {
	 *   // Note that this logic is invoked for every new subscribe action.
	 *   const producer = [1, 2, 3];
	 *   for (const value of producer) {
	 *     // If the observer has been aborted, there's no more work to do.
	 *     if (observer.signal.aborted) return;
	 *     // Next the value to the observer
	 *     observer.next(value);
	 *   }
	 *   // The producer is done, notify complete
	 *   observer.complete();
	 * });
	 *
	 * // Optionally create a controller to trigger unsubscription if needed.
	 * const controller = new AbortController();
	 *
	 * observable.subscribe({
	 *   signal: controller.signal,
	 *   next: (value) => console.log(value),
	 *   complete: () => console.log('complete'),
	 *   error: (error) => console.error(error),
	 *   finally: () => console.log('finally'),
	 * });
	 *
	 * // console output (synchronously):
	 * // 1
	 * // 2
	 * // 3
	 * // complete
	 * // finally
	 * ```
	 *
	 * @example
	 * Creating an observable with an asynchronous producer.
	 * ```ts
	 * import { Observable } from '@xander/observable';
	 *
	 * const observable = new Observable<0>((observer) => {
	 *   // Note that this logic is invoked for every new subscribe action.
	 *
	 *   // If the observer is already aborted, there's no work to do.
	 *   if (observer.signal.aborted) return;
	 *
	 *   // Create a timeout as our producer to next a value after 1 second.
	 *   const producer = setTimeout(() => {
	 *     // Next the value to the observer
	 *     observer.next(0);
	 *     // The producer is done, notify complete
	 *     observer.complete();
	 *   }, 1000);
	 *
	 *   // Add an abort listener to handle unsubscription by canceling the producer
	 *   observer.signal.addEventListener(
	 *     'abort',
	 *     () => clearTimeout(producer),
	 *     { once: true },
	 *   );
	 * });
	 *
	 * observable.subscribe({
	 *   next: (value) => console.log(value),
	 *   complete: () => console.log('complete'),
	 *   error: (error) => console.error(error),
	 *   finally: () => console.log('finally'),
	 * });
	 *
	 * // console output (asynchronously):
	 * // 0
	 * // complete
	 * // finally
	 * ```
	 *
	 * @example
	 * Creating an observable with no producer.
	 * ```ts
	 * import { Observable } from '@xander/observable';
	 *
	 * const observable = new Observable<never>();
	 *
	 * observable.subscribe({
	 *   next: (value) => console.log(value),
	 *   complete: () => console.log('Done'),
	 *   error: (error) => console.error(error),
	 *   finally: () => console.log('finally'),
	 * });
	 *
	 * // no console output
	 * ```
	 */
	new <Value>(
		subscribe: (observer: Omit<Observer<Value>, 'finally'>) => unknown,
	): Observable<Value>;
	readonly prototype: Observable;
	/**
	 * Converting custom observables, probably exported by libraries, to proper observables.
	 * @returns If {@linkcode input} is an {@linkcode InteropObservable|interop observable}, it's `[observable]()` method is called to obtain the {@linkcode Subscribable|subscribable}. Otherwise, {@linkcode input} is assumed to be a {@linkcode Subscribable|subscribable}. If the {@linkcode input} is already instanceof {@linkcode Observable} (which means it has Observable.prototype in it's prototype chain), it is returned directly. Otherwise, a new {@linkcode Observable} object is created that wraps the original {@linkcode input}.
	 */
	from<Input extends ObservableInput>(
		input: Input,
	): Observable<ObservedValueOf<Input>>;
}
