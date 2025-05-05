import {
	InteropObservable,
	observable,
	Subscribable,
	throwError,
} from '../operators';
import { Pipeline, UnaryFunction } from '../pipe';
import { Observer, Subscriber } from './subscriber';

/**
 * A representation of any set of values over any amount of time.
 */
export interface Observable<Value = unknown>
	extends Pipeline<Observable<Value>>,
		InteropObservable<Value> {
	/** @internal */
	readonly [Symbol.toStringTag]: string;
	/**
	 * @usage Invoking an execution of an {@linkcode Observable} and registers {@linkcode Observer} handlers for notifications it can but is not required to emit.
	 * @param observerOrNext Either an {@linkcode Observer} with some or all callback methods, or the `next` handler that is called for each value emitted from the subscribed {@linkcode Observable}.
	 * @public
	 */
	subscribe(
		observerOrNext?:
			| Partial<Observer<Value>>
			| ((value: Value) => unknown)
			| null,
	): void;
}

export interface ObservableConstructor {
	new (): Observable<never>;
	new (subscribe: undefined | null): Observable<never>;
	/**
	 * @param subscribe The function that is called when the Observable is initially subscribed to. This function is given a Subscriber, to which new values can be `next`ed, or an `error` method can be called to raise an error, or `complete` can be called to notify of a successful completion.
	 */
	new <Value>(subscribe: UnaryFunction<Subscriber<Value>>): Observable<Value>;
	readonly prototype: Observable;
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

/**
 * @param subscribe The function that is called when the Observable is initially subscribed to. This function is given a Subscriber, to which new values can be `next`ed, or an `error` method can be called to raise an error, or `complete` can be called to notify of a successful completion.
 */
export const Observable: ObservableConstructor = class {
	/** @internal */
	readonly [Symbol.toStringTag] = 'Observable';

	/** @internal */
	readonly #subscribe?: UnaryFunction<Subscriber> | null;

	/** @internal */
	readonly #pipeline = new Pipeline(this);

	/** @internal */
	constructor(subscribe?: UnaryFunction<Subscriber> | null) {
		this.#subscribe = subscribe;
	}

	static from<Input extends ObservableInput>(
		input: Input,
	): Observable<ObservedValueOf<Input>> {
		if (input instanceof Observable) return input;

		if (typeof input !== 'object' || input === null) {
			try {
				throw new TypeError('Observable.from called on non-object');
			} catch (error) {
				return throwError(() => error);
			}
		}

		return new Observable((subscriber) =>
			observable in input
				? input[observable]().subscribe(subscriber)
				: input.subscribe(subscriber),
		);
	}

	/** @internal */
	[observable](): Subscribable {
		return this;
	}

	/** @internal */
	subscribe(observerOrNext?: Partial<Observer> | UnaryFunction | null): void {
		const subscriber = ensureSubscriber(observerOrNext);
		try {
			this.#subscribe?.(subscriber);
		} catch (error) {
			subscriber.error(error);
		}
	}

	/** @internal */
	pipe(...operations: []): this {
		return this.#pipeline.pipe(...operations);
	}
};

/** @internal */
function ensureSubscriber(
	observerOrNext?: Partial<Observer> | UnaryFunction | null,
): Subscriber {
	return observerOrNext instanceof Subscriber
		? observerOrNext
		: new Subscriber(observerOrNext);
}

/** @internal */
function fromInteropObservable(
	interopObservable: InteropObservable,
): Observable {
	// If an instance of one of our Observables, just return it.
	if (interopObservable instanceof Observable) return interopObservable;
	return new Observable((subscriber) => {
		if (typeof interopObservable[observable] === 'function') {
			return interopObservable[observable]().subscribe(subscriber);
		}
		// Should be caught by observable subscribe function error handling.
		throw new TypeError(
			"Provided object does not correctly implement the 'observable' Symbol",
		);
	});
}

function throwTypeError(message: string): Observable<never> {
	try {
		throw new TypeError(message);
	} catch (error) {
		return new Observable((subscriber) => {
			subscriber.error(error);
		});
	}
}

/** @internal */
function fromSubscribable(interopObservable: InteropObservable): Observable {
	// If an instance of one of our Observables, just return it.
	if (interopObservable instanceof Observable) return interopObservable;
	return new Observable((subscriber) => {
		if (typeof interopObservable[observable] === 'function') {
			return interopObservable[observable]().subscribe(subscriber);
		}
		// Should be caught by observable subscribe function error handling.
		throw new TypeError(
			"Provided object does not correctly implement the 'observable' Symbol",
		);
	});
}
