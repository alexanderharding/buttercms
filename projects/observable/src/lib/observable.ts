import { Observer, Subscriber } from 'subscriber';
import { Pipeline } from './pipeline';
import { InteropObservable } from './from';

export const subscribe = Symbol('subscribe');

/**
 * A representation of any set of values over any amount of time.
 */
export interface Observable<Value = unknown>
	extends Pipeline<Observable<Value>>,
		InteropObservable<Value> {
	/** @internal */
	readonly [Symbol.toStringTag]: string;
	/**
	 * Invokes an execution of an Observable and registers Observer handlers for notifications it will emit.
	 *
	 * <span class="informal">Use it when you have all these Observables, but still nothing is happening.</span>
	 *
	 * `subscribe` is not a regular operator, but a method that calls Observable's internal `subscribe` function. It
	 * might be for example a function that you passed to Observable's constructor, but most of the time it is
	 * a library implementation, which defines what will be emitted by an Observable, and when it be will emitted. This means
	 * that calling `subscribe` is actually the moment when Observable starts its work, not when it is created, as it is often
	 * the thought.
	 *
	 * Apart from starting the execution of an Observable, this method allows you to listen for values
	 * that an Observable emits, as well as for when it completes or errors. You can achieve this in two
	 * of the following ways.
	 *
	 * The first way is creating an object that implements {@link Observer} interface. It should have methods
	 * defined by that interface, but note that it should be just a regular JavaScript object, which you can create
	 * yourself in any way you want (ES6 class, classic function constructor, object literal etc.). In particular, do
	 * not attempt to use any RxJS implementation details to create Observers - you don't need them. Remember also
	 * that your object does not have to implement all methods. If you find yourself creating a method that doesn't
	 * do anything, you can simply omit it. Note however, if the `error` method is not provided and an error happens,
	 * it will be thrown asynchronously. Errors thrown asynchronously cannot be caught using `try`/`catch`. Instead,
	 * use the {@link onUnhandledError} configuration option or use a runtime handler (like `window.onerror` or
	 * `process.on('error)`) to be notified of unhandled errors. Because of this, it's recommended that you provide
	 * an `error` method to avoid missing thrown errors.
	 *
	 * The second way is to give up on Observer object altogether and simply provide callback functions in place of its methods.
	 * This means you can provide three functions as arguments to `subscribe`, where the first function is equivalent
	 * of a `next` method, the second of an `error` method and the third of a `complete` method. Just as in case of an Observer,
	 * if you do not need to listen for something, you can omit a function by passing `undefined` or `null`,
	 * since `subscribe` recognizes these functions by where they were placed in function call. When it comes
	 * to the `error` function, as with an Observer, if not provided, errors emitted by an Observable will be thrown asynchronously.
	 *
	 * You can, however, subscribe with no parameters at all. This may be the case where you're not interested in terminal events
	 * and you also handled emissions internally by using operators (e.g. using `tap`).
	 *
	 * Whichever style of calling `subscribe` you use, in both cases it returns a Subscription object.
	 * This object allows you to call `unsubscribe` on it, which in turn will stop the work that an Observable does and will clean
	 * up all resources that an Observable used. Note that cancelling a subscription will not call `complete` callback
	 * provided to `subscribe` function, which is reserved for a regular completion signal that comes from an Observable.
	 *
	 * Remember that callbacks provided to `subscribe` are not guaranteed to be called asynchronously.
	 * It is an Observable itself that decides when these functions will be called. For example {@link of}
	 * by default emits all its values synchronously. Always check documentation for how given Observable
	 * will behave when subscribed and if its default behavior can be modified with a `scheduler`.
	 *
	 * #### Examples
	 *
	 * Subscribe with an {@link guide/observer Observer}
	 *
	 * ```ts
	 * import { of } from 'rxjs';
	 *
	 * const sumObserver = {
	 *   sum: 0,
	 *   next(value) {
	 *     console.log('Adding: ' + value);
	 *     this.sum = this.sum + value;
	 *   },
	 *   error() {
	 *     // We actually could just remove this method,
	 *     // since we do not really care about errors right now.
	 *   },
	 *   complete() {
	 *     console.log('Sum equals: ' + this.sum);
	 *   }
	 * };
	 *
	 * of(1, 2, 3) // Synchronously emits 1, 2, 3 and then completes.
	 *   .subscribe(sumObserver);
	 *
	 * // Logs:
	 * // 'Adding: 1'
	 * // 'Adding: 2'
	 * // 'Adding: 3'
	 * // 'Sum equals: 6'
	 * ```
	 *
	 * Subscribe with functions ({@link deprecations/subscribe-arguments deprecated})
	 *
	 * ```ts
	 * import { of } from 'rxjs'
	 *
	 * let sum = 0;
	 *
	 * of(1, 2, 3).subscribe(
	 *   value => {
	 *     console.log('Adding: ' + value);
	 *     sum = sum + value;
	 *   },
	 *   undefined,
	 *   () => console.log('Sum equals: ' + sum)
	 * );
	 *
	 * // Logs:
	 * // 'Adding: 1'
	 * // 'Adding: 2'
	 * // 'Adding: 3'
	 * // 'Sum equals: 6'
	 * ```
	 *
	 * Cancel a subscription
	 *
	 * ```ts
	 * import { interval } from 'rxjs';
	 *
	 * const subscription = interval(1000).subscribe({
	 *   next(num) {
	 *     console.log(num)
	 *   },
	 *   complete() {
	 *     // Will not be called, even when cancelling subscription.
	 *     console.log('completed!');
	 *   }
	 * });
	 *
	 * setTimeout(() => {
	 *   subscription.unsubscribe();
	 *   console.log('unsubscribed!');
	 * }, 2500);
	 *
	 * // Logs:
	 * // 0 after 1s
	 * // 1 after 2s
	 * // 'unsubscribed!' after 2.5s
	 * ```
	 *
	 * @param observerOrNext Either an {@link Observer} with some or all callback methods,
	 * or the `next` handler that is called for each value emitted from the subscribed Observable.
	 * @return A subscription reference to the registered handlers.
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
	/**
	 * @param subscribe The function that is called when the Observable is
	 * initially subscribed to. This function is given a Subscriber, to which new values
	 * can be `next`ed, or an `error` method can be called to raise an error, or
	 * `complete` can be called to notify of a successful completion.
	 */
	new <Value>(
		subscribe?: (
			this: Observable<Value>,
			subscriber: Subscriber<Value>,
		) => unknown,
	): Observable<Value>;
	readonly prototype: Observable;
}

/**
 * @param subscribe The function that is called when the Observable is
 * initially subscribed to. This function is given a Subscriber, to which new values
 * can be `next`ed, or an `error` method can be called to raise an error, or
 * `complete` can be called to notify of a successful completion.
 */
export const Observable: ObservableConstructor = class {
	/** @internal */
	readonly [Symbol.toStringTag] = 'Observable';

	/** @internal */
	readonly #subscribe?: (this: this, subscriber: Subscriber) => unknown;

	/** @internal */
	readonly #pipeline = new Pipeline(this);

	/** @internal */
	constructor(
		subscribe?: (this: Observable, subscriber: Subscriber) => unknown,
	) {
		this.#subscribe = subscribe;
	}

	/** @internal */
	[subscribe](
		observerOrNext?: ((value: unknown) => void) | Partial<Observer> | null,
	): void {
		this.subscribe(observerOrNext);
	}

	/** @internal */
	subscribe(
		observerOrNext?: ((value: unknown) => unknown) | Partial<Observer> | null,
	): void {
		const subscriber = ensureSubscriber(observerOrNext);
		try {
			this.#subscribe?.call(this, subscriber);
		} catch (error) {
			subscriber.error(error);
		}
	}

	/** @internal */
	pipe(...operations: []): Observable {
		return this.#pipeline.pipe(...operations);
	}
};

/** @internal */
function ensureSubscriber(
	observerOrNext?: ((value: unknown) => void) | Partial<Observer> | null,
): Subscriber {
	return observerOrNext instanceof Subscriber
		? observerOrNext
		: new Subscriber(observerOrNext);
}
