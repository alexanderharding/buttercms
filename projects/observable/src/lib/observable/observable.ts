import { InteropObservable, observable, Subscribable } from '../operators';
import { Pipeline } from '../pipe';
import { ConsumerObserver } from './consumer-observer';
import { ProducerObserver } from './producer-observer';

/**
 * An object interface that defines a `producer`/`consumer` pair factory within the semantics of the [Observer pattern](https://en.wikipedia.org/wiki/Observer_pattern).
 * @example
 * Creating an observable with a synchronous producer.
 * ```ts
 * import { Observable } from '@xander/observable';
 *
 * const observable = new Observable<number>((producerObserver) => {
 *   // Note that this logic is invoked for every new call to Observable.prototype.subscribe.
 *   const producer = [1, 2, 3];
 *   for (const value of producer) {
 *     // If the observer has been aborted, there's no more work to do.
 *     if (producerObserver.signal.aborted) return;
 *     // A value has been produced, notify the observer.
 *     producerObserver.next(value);
 *   }
 *   // The producer done, notify the observer.
 *   producerObserver.complete();
 * });
 *
 * // Optionally create a controller to unsubscribe from the observable if needed.
 * const controller = new AbortController();
 *
 * // The remaining logic encapsulates the consumer.
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
 * const observable = new Observable<0>((producerObserver) => {
 *   // Note that this logic is invoked for every new call to Observable.prototype.subscribe.
 *
 *   // If the observer is already aborted, there's no work to do.
 *   if (producerObserver.signal.aborted) return;
 *
 *   // Create a timeout to produce a value after 1 second.
 *   const producer = setTimeout(() => {
 *     // A value has been produced, notify the observer.
 *     producerObserver.next(0);
 *     // The producer is done, notify the observer.
 *     producerObserver.complete();
 *   }, 1000);
 *
 *   // Add an abort listener to the observer's signal to cancel the producer if necessary.
 *   producerObserver.signal.addEventListener(
 *     'abort',
 *     () => clearTimeout(producer),
 *     { once: true },
 *   );
 * });
 *
 * // The remaining logic encapsulates the consumer.
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
export interface Observable<Value = unknown>
	extends Pipeline<Observable<Value>>,
		InteropObservable<Value> {
	/** @internal */
	readonly [Symbol.toStringTag]: string;
	/**
	 * Invokes an execution of an {@linkcode Observable} and optionally registers {@linkcode ConsumerObserver} handlers for notifications it can but is not required to emit.
	 * @param observerOrNext If provided, either an {@linkcode ConsumerObserver} with some or all callback methods, or the `next` handler that is called for each value emitted from the subscribed {@linkcode Observable}.
	 */
	subscribe(
		observerOrNext?:
			| Partial<ConsumerObserver<Value>>
			| ((value: Value) => unknown)
			| null,
	): void;
	/**
	 * A method that returns the default async iterator for an object. Called by the semantics of the for-await-of statement.
	 * @internal
	 */
	[Symbol.asyncIterator](): AsyncIterableIterator<Value, void, void>;
}

export interface ObservableConstructor {
	new (): Observable<never>;
	new (subscribe: undefined | null): Observable<never>;
	/**
	 * An object interface that defines a `producer`/`consumer` pair factory within the semantics of the [Observer pattern](https://en.wikipedia.org/wiki/Observer_pattern).
	 * @param subscribe The function that is called for every new call to `Observable.prototype.subscribe`. This function is given a {@linkcode ProducerObserver} that can be used to push notifications from the `producer` to the `consumer`.
	 * @example
	 * Creating an observable with a synchronous producer.
	 * ```ts
	 * import { Observable } from '@xander/observable';
	 *
	 * const observable = new Observable<number>((observer) => {
	 *   // Note that this logic is invoked for every new call to Observable.prototype.subscribe.
	 *   const producer = [1, 2, 3];
	 *   for (const value of producer) {
	 *     // If the observer has been aborted, there's no more work to do.
	 *     if (observer.signal.aborted) return;
	 *     // A value has been produced, notify the observer.
	 *     observer.next(value);
	 *   }
	 *   // The producer done, notify the observer.
	 *   observer.complete();
	 * });
	 *
	 * // Optionally create a controller to unsubscribe from the observable if needed.
	 * const controller = new AbortController();
	 *
	 * // The remaining logic encapsulates the consumer.
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
	 * const observable = new Observable<0>((producerObserver) => {
	 *   // Note that this logic is invoked for every new call to Observable.prototype.subscribe.
	 *
	 *   // If the observer is already aborted, there's no work to do.
	 *   if (producerObserver.signal.aborted) return;
	 *
	 *   // Create a timeout to produce a value after 1 second.
	 *   const producer = setTimeout(() => {
	 *     // A value has been produced, notify the observer.
	 *     producerObserver.next(0);
	 *     // The producer is done, notify the observer.
	 *     producerObserver.complete();
	 *   }, 1000);
	 *
	 *   // Add an abort listener to the observer's signal to cancel the producer if necessary.
	 *   producerObserver.signal.addEventListener(
	 *     'abort',
	 *     () => clearTimeout(producer),
	 *     { once: true },
	 *   );
	 * });
	 *
	 * // The remaining logic encapsulates the consumer.
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
	 * Creating an observable that does nothing.
	 * ```ts
	 * import { Observable } from '@xander/observable';
	 *
	 * const observable = new Observable<never>();
	 *
	 * // The remaining logic encapsulates the consumer.
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
		subscribe: (observer: ProducerObserver<Value>) => unknown,
	): Observable<Value>;
	readonly prototype: Observable;
	// /**
	//  * Converting custom observables, probably exported by libraries, to proper observables.
	//  * @returns If input is an interop observable, it's `[observable]()` method is called to obtain the subscribable. Otherwise, input is assumed to be a subscribable. If the input is already instanceof Observable (which means it has Observable.prototype in it's prototype chain), it is returned directly. Otherwise, a new Observable object is created that wraps the original input.
	//  * @throws If input is not an object or is null.
	//  */
	// from<Input extends ObservableInput>(
	// 	input: Input,
	// ): Observable<ObservedValueOf<Input>>;
}

export type ObservableInput<Value = unknown> =
	| InteropObservable<Value>
	| Subscribable<Value>;

export type ObservedValueOf<Input extends ObservableInput> =
	Input extends InteropObservable<infer Value>
		? Value
		: Input extends Subscribable<infer Value>
			? Value
			: never;

interface Deferred<Value = unknown> {
	resolve(value: IteratorResult<Value>): void;
	reject(reason: unknown): void;
}

export const Observable: ObservableConstructor = class {
	readonly [Symbol.toStringTag] = 'Observable';
	readonly #subscribe?: ((observer: ProducerObserver) => unknown) | null;
	readonly #pipeline = new Pipeline(this);

	constructor(subscribe?: ((observer: ProducerObserver) => unknown) | null) {
		this.#subscribe = subscribe;
	}

	// static from<Input extends ObservableInput>(
	// 	input: Input,
	// ): Observable<ObservedValueOf<Input>>;
	// static from(input: ObservableInput): Observable {
	// 	if (input instanceof Observable) return input;

	// 	if (typeof input !== 'object' || input === null) {
	// 		throw new TypeError('Observable.from called on non-object');
	// 	}

	// 	return new Observable((observer) =>
	// 		observable in input
	// 			? input[observable]().subscribe(observer)
	// 			: input.subscribe(observer),
	// 	);
	// }

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

	[observable](): Subscribable {
		return this;
	}

	subscribe(
		observerOrNext?:
			| Partial<ConsumerObserver>
			| ((value: unknown) => unknown)
			| null,
	): void {
		const observer = ensureProducerObserver(observerOrNext);
		try {
			this.#subscribe?.(observer);
		} catch (error) {
			observer.error(error);
		}
	}

	pipe(...operations: []): this {
		return this.#pipeline.pipe(...operations);
	}
};

/** @internal */
function ensureProducerObserver(
	observerOrNext?:
		| Partial<ConsumerObserver>
		| ((value: unknown) => unknown)
		| null,
): ProducerObserver {
	return observerOrNext instanceof ProducerObserver
		? observerOrNext
		: new ProducerObserver(observerOrNext);
}
