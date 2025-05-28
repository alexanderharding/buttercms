import { type InteropObservable, observable } from '../interop';
import { ObservableInput } from './observable-input';
import { ObservedValueOf } from './observed-value-of';
import type { Observer } from './observer';
import type { Subscribable } from './subscribable';
import { SubscriptionObserver } from './subscription-observer';

/**
 * At it's highest level, an observable represents a template for connecting an observer, as a consumer, to a producer, via a
 * {@linkcode Subscribable.subscribe|subscribe} action, resulting in a subscription.
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
 */
export type Observable<Value = unknown> = Subscribable<Value> &
	InteropObservable<Value>;

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

interface Deferred<Value = unknown> {
	resolve(value: IteratorResult<Value>): void;
	reject(reason: unknown): void;
}

/**
 * @class
 */
export const Observable: ObservableConstructor = class {
	readonly [Symbol.toStringTag] = 'Observable';
	readonly #subscribe?:
		| ((observer: Omit<Observer, 'finally'>) => unknown)
		| null;

	constructor(
		subscribe?: ((observer: Omit<Observer, 'finally'>) => unknown) | null,
	) {
		this.#subscribe = subscribe;
	}

	static from<Input extends ObservableInput>(
		input: Input,
	): Observable<ObservedValueOf<Input>> {
		if (input instanceof Observable) return input;

		if (typeof input !== 'object' || input === null) {
			const error = new TypeError('Observable.from called on non-object');
			return new Observable((observer) => observer.error(error));
		}

		if (observable in input) {
			try {
				const interop = input[observable]();
				if (interop instanceof Observable) return interop;
				return new Observable((observer) => interop.subscribe(observer));
			} catch (error) {
				return new Observable((observer) => observer.error(error));
			}
		}

		return new Observable((observer) => input.subscribe(observer));
	}

	[observable](): this {
		return this;
	}

	[Symbol.asyncIterator](): AsyncIterableIterator<never, void, void> {
		let controller: AbortController | null;
		const noError = Symbol('noError');
		let thrownError: unknown = noError;
		const values: Array<never> = [];
		const deferreds: Array<Deferred<never>> = [];

		return {
			next: () => {
				if (!controller) {
					// We only want to start the subscription when the user starts iterating.
					this.subscribe({
						signal: (controller = new AbortController()).signal,
						next,
						error,
						complete,
					});
				}

				// If we already have some values in our buffer, we'll return the next one.
				if (values.length) {
					return Promise.resolve({ value: values.shift()!, done: false });
				}

				// There was an error, so we're going to return an error result.
				if (thrownError !== noError) return Promise.reject(thrownError);

				// This was already aborted, so we're just going to return a done result.
				if (controller?.signal.aborted) {
					return Promise.resolve({ value: undefined, done: true });
				}

				// Otherwise, we need to make them wait for a value.
				return new Promise((resolve, reject) =>
					deferreds.push({ resolve, reject }),
				);
			},
			throw(error) {
				controller?.abort();
				error(error);
				return Promise.reject(error);
			},
			return() {
				controller?.abort();
				complete();
				return Promise.resolve({ value: undefined, done: true });
			},
			[Symbol.asyncIterator]() {
				return this;
			},
		};

		function next(value: never): void {
			if (deferreds.length) {
				const { resolve } = deferreds.shift()!;
				resolve({ value, done: false });
			} else {
				values.push(value);
			}
		}

		function error(error: unknown): void {
			thrownError = error;
			while (deferreds.length) {
				const { reject } = deferreds.shift()!;
				reject(error);
			}
		}

		function complete(): void {
			while (deferreds.length) {
				const { resolve } = deferreds.shift()!;
				resolve({ value: undefined, done: true });
			}
		}
	}

	subscribe(
		observerOrNext?: Partial<Observer> | ((value: unknown) => unknown) | null,
	): void {
		// Always ensure a proper observer even if this.#subscribe is not defined.
		// This allows unhandled errors to be reported if they occur.
		const observer = ensureSubscriptionObserver(observerOrNext);
		try {
			this.#subscribe?.(observer);
		} catch (error) {
			observer.error(error);
		}
	}
};

function ensureSubscriptionObserver(
	observerOrNext?: Partial<Observer> | ((value: unknown) => unknown) | null,
): SubscriptionObserver {
	return observerOrNext instanceof SubscriptionObserver
		? observerOrNext
		: new SubscriptionObserver(observerOrNext);
}
