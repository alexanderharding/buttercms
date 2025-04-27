import { Observable, type Observer } from '../observable';
import { Subject } from './subject';
import { Pipeline, UnaryFunction } from '../pipe';
import { observable, Subscribable } from '../operators';

/**
 * A variant of {@linkcode Subject} that emits a buffer of the last N values,
 * or all values if less than N. If N is not specified, an infinite amount of
 * values will be replayed. The minimum N is 1, so if 0 or less is specified,
 * 1 will be used instead.
 *
 * @example
 * import { ReplaySubject } from "observable";
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
export type ReplaySubject<Value = unknown> = Omit<Subject<Value>, 'pipe'> &
	Pipeline<ReplaySubject<Value>>;

export interface ReplaySubjectConstructor {
	new <Value>(bufferSize?: number): ReplaySubject<Value>;
	readonly prototype: ReplaySubject;
}

export const ReplaySubject: ReplaySubjectConstructor = class<Value> {
	/** @internal */
	readonly [Symbol.toStringTag] = this.constructor.name;

	/** @internal */
	readonly #bufferSize: number;

	/** @internal */
	readonly #buffer: Array<Value> = [];

	/** @internal */
	readonly #delegate = new Subject<Value>();

	/** @internal */
	readonly signal = this.#delegate.signal;

	/** @internal */
	readonly #pipeline = new Pipeline(this);

	/** @internal */
	readonly #output = new Observable((subscriber) => {
		// We use a copy here, so reentrant code does not mutate our array while we're
		// emitting it to a new subscriber.
		const copy = this.#buffer.slice();
		for (let i = 0; i < copy.length && !subscriber.signal.aborted; i++) {
			subscriber.next(copy[i]);
		}
		this.#delegate.subscribe(subscriber);
	});

	/** @internal */
	constructor(bufferSize = Infinity) {
		this.#bufferSize = Math.max(1, bufferSize);

		// Remove all references to the buffer values on finalization
		// of this subject so they can be garbage collected.
		this.signal.addEventListener('abort', () => (this.#buffer.length = 0), {
			signal: this.signal,
		});
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
	next(value: Value): void {
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
