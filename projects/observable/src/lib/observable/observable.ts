import { InteropObservable, observable, Subscribable } from '../operators';
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
		observerOrNext?: Partial<Observer<Value>> | UnaryFunction<Value> | null,
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
}

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
