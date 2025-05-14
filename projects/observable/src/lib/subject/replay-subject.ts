import { Observable, type ConsumerObserver } from '../observable';
import { Subject } from './subject';
import { Pipeline } from '../pipe';
import { InteropObservable, observable, Subscribable } from '../operators';

/**
 * A variant of {@linkcode Subject} that emits a buffer of the last N values,
 * or all values if less than N. If N is not specified, an infinite amount of
 * values will be replayed. The minimum N is 1, so if 0 or less is specified,
 * 1 will be used instead.
 *
 * @example
 * ```ts
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
 * ```
 */
export interface ReplaySubject<Value = unknown>
	extends InteropObservable<Value>,
		Pipeline<ReplaySubject<Value>> {
	/**
	 * A `String` value that is used in the creation of the string description of this {@linkcode ReplaySubject}. Called by the built-in method `Object.prototype.toString`.
	 */
	readonly [Symbol.toStringTag]: string;
	/**
	 * Indicates that the `producer` cannot push any more notifications through this {@linkcode Subject}.
	 */
	readonly signal: AbortSignal;
	/**
	 * Update the replay buffer and notify all `consumers` of this {@linkcode ReplaySubject} that a {@linkcode value} has been produced.
	 * This has no-operation if this {@linkcode ReplaySubject} is already {@linkcode signal|aborted}.
	 * @param value The {@linkcode value} that has been produced and stored in the buffer.
	 */
	next(value: Value): void;
	/**
	 * Abort this {@linkcode ReplaySubject} and notify all `consumers` of this {@linkcode ReplaySubject} that the `producer` has finished successfully. This is mutually exclusive
	 * with {@linkcode error} and has no-operation if this {@linkcode ReplaySubject} is already {@linkcode signal|aborted}.
	 */
	complete(): void;
	/**
	 * Abort this {@linkcode ReplaySubject} and notify all `consumers` of this {@linkcode ReplaySubject} that the `producer` has finished because an {@linkcode error} occurred. This is
	 * mutually exclusive with {@linkcode complete} and has no-operation if this {@linkcode ReplaySubject} is already {@linkcode signal|aborted}.
	 * @param error The {@linkcode error} that occurred.
	 */
	error(error: unknown): void;
	/**
	 * Access an {@linkcode Observable} with this {@linkcode ReplaySubject} as the source. You can do this to create custom `producer`-side logic of
	 * this {@linkcode ReplaySubject} and conceal it from code that uses the {@linkcode Observable}.
	 * @returns An {@linkcode Observable} that this {@linkcode ReplaySubject} casts to.
	 */
	asObservable(): Observable<Value>;
	/**
	 * Observe notifications from this {@linkcode ReplaySubject}.
	 * @param observerOrNext If provided, either a {@linkcode ConsumerObserver} with some or all callback methods, or the `next` handler that is called for each produced value.
	 */
	subscribe(
		observerOrNext?:
			| Partial<ConsumerObserver<Value>>
			| ((value: Value) => unknown)
			| null,
	): void;
	/**
	 * A method that returns the async iterator for this {@linkcode ReplaySubject}. Called by the semantics of the for-await-of statement.
	 */
	[Symbol.asyncIterator](): AsyncIterableIterator<Value, void, void>;
}

export interface ReplaySubjectConstructor {
	new (bufferSize?: number): ReplaySubject;
	new <Value>(bufferSize?: number): ReplaySubject<Value>;
	readonly prototype: ReplaySubject;
}

export const ReplaySubject: ReplaySubjectConstructor = class {
	readonly [Symbol.toStringTag] = 'ReplaySubject';
	readonly #bufferSize: number;
	readonly #buffer: Array<unknown> = [];
	readonly #delegate = new Subject<unknown>();
	readonly signal = this.#delegate.signal;
	readonly #pipeline = new Pipeline(this);
	readonly #output = new Observable((observer) => {
		// We use a copy here, so reentrant code does not mutate our array while we're
		// emitting it to a new observer.
		const copy = this.#buffer.slice();

		// 'forEach' and 'every' are generally considered faster than traditional 'for' loops.
		// We use 'every' here so we can exit early if the observer is aborted.
		copy.every((value) => {
			if (observer.signal.aborted) return false;
			observer.next(value);
			return true;
		});

		// After all buffered values, if any, are emitted, subscribe to the delegate.
		// This allows the delegate Subject to handle from here on out.
		this.#delegate.subscribe(observer);
	});

	constructor(bufferSize = Infinity) {
		this.#bufferSize = Math.max(1, bufferSize);
	}

	pipe(...operations: []): this {
		return this.#pipeline.pipe(...operations);
	}

	[observable](): Subscribable {
		return this;
	}

	[Symbol.asyncIterator](): AsyncIterableIterator<unknown, void, void> {
		return this.#output[Symbol.asyncIterator]();
	}

	subscribe(
		observerOrNext?:
			| Partial<ConsumerObserver>
			| ((value: unknown) => unknown)
			| null,
	): void {
		this.#output.subscribe(observerOrNext);
	}

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

	complete(): void {
		this.#delegate.complete();
	}

	error(error: unknown): void {
		this.#delegate.error(error);
	}

	asObservable(): Observable {
		return this.#output;
	}
};
