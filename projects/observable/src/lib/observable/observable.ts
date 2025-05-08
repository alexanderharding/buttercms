import { InteropObservable, observable, Subscribable } from '../operators';
import { Pipeline } from '../pipe';
import { Observer, Dispatcher } from './observer';

/**
 * A representation of any set of values over any amount of time.
 */
export interface Observable<Value = unknown>
	extends Pipeline<Observable<Value>>,
		InteropObservable<Value> {
	/** @internal */
	readonly [Symbol.toStringTag]: string;
	/**
	 * Invokes an execution of an {@linkcode Observable} and registers {@linkcode Observer} handlers for notifications it can but is not required to emit.
	 * @param observerOrNext If provided, either an {@linkcode Observer} with some or all callback methods, or the `next` handler that is called for each value emitted from the subscribed {@linkcode Observable}.
	 * @public
	 */
	subscribe(
		observerOrNext?:
			| Partial<Observer<Value>>
			| ((value: Value) => unknown)
			| null,
	): void;
	/**
	 * A method that returns the default async iterator for an object. Called by the semantics of the for-await-of statement.
	 * @public
	 */
	[Symbol.asyncIterator](): AsyncIterableIterator<Value, void, void>;
}

export interface ObservableConstructor {
	new (): Observable<never>;
	new (subscribe: undefined | null): Observable<never>;
	/**
	 * @param subscribe The function that is called when the Observable is initially subscribed to. This function is given a Dispatcher, to which new values can be `next`ed, or an `error` method can be called to raise an error, or `complete` can be called to notify of a successful completion.
	 */
	new <Value>(
		subscribe: (dispatcher: Dispatcher<Value>) => unknown,
	): Observable<Value>;
	readonly prototype: Observable;
	/**
	 * Converting custom observables, probably exported by libraries, to proper observables.
	 * @returns If input is an interop observable, it's `[observable]()` method is called to obtain the subscribable. Otherwise, input is assumed to be a subscribable. If the input is already instanceof Observable (which means it has Observable.prototype in it's prototype chain), it is returned directly. Otherwise, a new Observable object is created that wraps the original input.
	 * @throws If input is not an object or is null.
	 */
	from<Input extends ObservableInput>(
		input: Input,
	): Observable<ObservedValueOf<Input>>;
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
	/** @internal */
	readonly [Symbol.toStringTag] = 'Observable';

	/** @internal */
	readonly #subscribe?: ((dispatcher: Dispatcher) => unknown) | null;

	/** @internal */
	readonly #pipeline = new Pipeline(this);

	/** @internal */
	constructor(subscribe?: ((dispatcher: Dispatcher) => unknown) | null) {
		this.#subscribe = subscribe;
	}

	/** @internal */
	static from<Input extends ObservableInput>(
		input: Input,
	): Observable<ObservedValueOf<Input>>;
	static from(input: ObservableInput): Observable {
		if (input instanceof Observable) return input;

		if (typeof input !== 'object' || input === null) {
			throw new TypeError('Observable.from called on non-object');
		}

		return new Observable((dispatcher) =>
			observable in input
				? input[observable]().subscribe(dispatcher)
				: input.subscribe(dispatcher),
		);
	}

	/** @internal */
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

	/** @internal */
	[observable](): Subscribable {
		return this;
	}

	/** @internal */
	subscribe(
		observerOrNext?: Partial<Observer> | ((value: unknown) => unknown) | null,
	): void {
		const dispatcher = ensureDispatcher(observerOrNext);
		try {
			this.#subscribe?.(dispatcher);
		} catch (error) {
			dispatcher.error(error);
		}
	}

	/** @internal */
	pipe(...operations: []): this {
		return this.#pipeline.pipe(...operations);
	}
};

/** @internal */
function ensureDispatcher(
	observerOrNext?: Partial<Observer> | ((value: unknown) => unknown) | null,
): Dispatcher {
	return observerOrNext instanceof Dispatcher
		? observerOrNext
		: new Dispatcher(observerOrNext);
}
