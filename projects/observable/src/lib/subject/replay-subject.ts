import { Observable, type Observer } from '../observable';
import { Subject } from './subject';
import { Pipeline, UnaryFunction } from '../pipe';
import { InteropObservable, observable, Subscribable } from '../operators';

/**
 * A variant of {@linkcode Subject} that emits a buffer of the last N values,
 * or all values if less than N. If N is not specified, an infinite amount of
 * values will be replayed. The minimum N is 1, so if 0 or less is specified,
 * 1 will be used instead.
 *
 * @example
 * import { ReplaySubject } from "@xander/observable";
 *
 * const subject = new ReplaySubject<number>(3);
 *
 * subject.next(1); // Stored in buffer
 * subject.next(2); // Stored in buffer
 * subject.next(3); // Stored in buffer
 * subject.next(4); // Stored in buffer and 1 gets trimmed off
 *
 * subject.subscribe((value) => console.log(value));
 *
 * // Console output:
 * // 2
 * // 3
 * // 4
 *
 * // Values pushed after the subscribe will emit immediately
 * // unless the subject is already finalized.
 * subject.next(5); // Stored in buffer and 2 gets trimmed off
 *
 * // Console output:
 * // 5
 *
 * subject.subscribe((value) => console.log(value));
 *
 * // Console output:
 * // 3
 * // 4
 * // 5
 *
 * @class
 * @public
 */
export interface ReplaySubject<Value = unknown>
	extends InteropObservable<Value>,
		Pipeline<ReplaySubject<Value>> {
	/**
	 * A String value that is used in the creation of the default string description of an object. Called by the built-in method Object.prototype.toString.
	 * @readonly
	 * @public
	 */
	readonly [Symbol.toStringTag]: string;
	/**
	 * Determining if/when this {@linkcode ReplaySubject|subject} has been aborted and is no longer accepting new notifications.
	 * @readonly
	 * @property
	 * @public
	 */
	readonly signal: AbortSignal;
	/**
	 * Update the replay buffer and multicast a `next` notification with the attached {@linkcode value} to all {@linkcode Observer|observers} of this {@linkcode ReplaySubject|subject}. This has no operation (noop) if this {@linkcode ReplaySubject|subject} is already aborted.
	 * @param value The {@linkcode value} to store in the buffer and attach to the multicast `next` notification.
	 * @method
	 * @public
	 */
	next(value: Value): void;
	/**
	 * Abort this {@linkcode ReplaySubject|subject} and multicast a `complete` notification to all {@linkcode Observer|observers}. If a value was previously stored via `next()`, that value will be multicast to all {@linkcode Observer|observers} before completing. Any future {@linkcode Observer|observers} will receive replayed `next` notifications from the buffer, if any, and then immediately be notified of the `complete` (unless they are already aborted). This has no operation (noop) if this {@linkcode ReplaySubject|subject} is already aborted.
	 * @method
	 * @public
	 */
	complete(): void;
	/**
	 * Abort this {@linkcode ReplaySubject|subject} and multicast an `error` notification with an attached {@linkcode error} to all {@linkcode Observer|observers}. Any future {@linkcode Observer|observers} will receive replayed `next` notifications from the buffer, if any, and then be immediately notified of the `error` (unless they are already aborted). This has no operation (noop) if this {@linkcode ReplaySubject|subject} is already aborted.
	 * @param error The {@linkcode error} to multicast to all {@linkcode Observer|observers}.
	 * @method
	 * @public
	 */
	error(error: unknown): void;
	/**
	 * Create a new {@linkcode Observable} with this {@linkcode ReplaySubject|subject} as the source. You can do this to create custom Observer-side logic of this {@linkcode ReplaySubject|subject} and conceal it from code that uses the {@linkcode Observable}.
	 * @returns An {@linkcode Observable} that this {@linkcode ReplaySubject|subject} casts to.
	 * @method
	 * @public
	 */
	asObservable(): Observable<Value>;
	/**
	 * Observing notifications from this {@linkcode ReplaySubject|subject}.
	 * @param observerOrNext If provided, either an {@linkcode Observer} with some or all options, the `next` handler (equivalent to `subscribe({ next })`).
	 * @method
	 * @public
	 */
	subscribe(
		observerOrNext?:
			| Partial<Observer<Value>>
			| ((value: Value) => unknown)
			| null,
	): void;
}

export interface ReplaySubjectConstructor {
	new (bufferSize?: number): ReplaySubject;
	new <Value>(bufferSize?: number): ReplaySubject<Value>;
	readonly prototype: ReplaySubject;
}

export const ReplaySubject: ReplaySubjectConstructor = class {
	/** @internal */
	readonly [Symbol.toStringTag] = 'ReplaySubject';

	/** @internal */
	readonly #bufferSize: number;

	/** @internal */
	readonly #buffer: Array<unknown> = [];

	/** @internal */
	readonly #delegate = new Subject<unknown>();

	/** @internal */
	readonly signal = this.#delegate.signal;

	/** @internal */
	readonly #pipeline = new Pipeline(this);

	/** @internal */
	readonly #output = new Observable((subscriber) => {
		// We use a copy here, so reentrant code does not mutate our array while we're
		// emitting it to a new subscriber.
		const copy = this.#buffer.slice();

		// 'forEach' and 'every' are generally considered faster than traditional 'for' loops.
		// We use 'every' here so we can exit early if the subscriber is aborted.
		copy.every((value) => {
			if (subscriber.signal.aborted) return false;
			subscriber.next(value);
			return true;
		});

		// After all buffered values, if any, are emitted, subscribe to the delegate.
		// This allows the delegate Subject to handle from here on out.
		this.#delegate.subscribe(subscriber);
	});

	/** @internal */
	constructor(bufferSize = Infinity) {
		this.#bufferSize = Math.max(1, bufferSize);
	}

	/** @internal */
	pipe(...operations: []): this {
		return this.#pipeline.pipe(...operations);
	}

	/** @internal */
	[observable](): Subscribable {
		return this;
	}

	/** @internal */
	subscribe(observerOrNext: Partial<Observer> | UnaryFunction): void {
		this.#output.subscribe(observerOrNext);
	}

	/** @internal */
	next(value: unknown): void {
		// If this subject has been aborted, there is nothing to do.
		if (this.signal.aborted) return;

		// Store next value in the buffer.
		this.#buffer.push(value);

		// Trim the buffer before pushing it to the delegate so
		// reentrant code does not get pushed more values than it should.
		if (this.#buffer.length > this.#bufferSize) {
			this.#buffer.splice(0, this.#buffer.length - this.#bufferSize);
		}

		// Push the value to the delegate.
		this.#delegate.next(value);
	}

	/** @internal */
	complete(): void {
		this.#delegate.complete();
	}

	/** @internal */
	error(error: unknown): void {
		this.#delegate.error(error);
	}

	/** @internal */
	asObservable(): Observable {
		return this.#output;
	}
};
