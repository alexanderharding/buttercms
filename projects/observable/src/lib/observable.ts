import { type InteropObservable, observable } from './interop';
import type { ObservableConstructor } from './observable-constructor';
import type { ObservableInput } from './observable-input';
import type { ObservedValueOf } from './observed-value-of';
import type { Observer } from './observer';
import { type Subscribable, SubscriptionObserver } from './subscription';

/**
 * At it's highest level, an {@linkcode Observable|observable} represents a template for connecting an {@linkcode Observer}, as a consumer, to a producer, via a
 * {@linkcode Observable.subscribe|subscribe} action, resulting in a subscription.
 *
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

// Note: the main reason this JSDoc exists, is to satisfy the JSR score. In reality,
// the JSDoc on the above type is enough for the DX on both symbols.
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
