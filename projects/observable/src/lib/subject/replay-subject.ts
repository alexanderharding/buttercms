import { Observable, type ConsumerObserver } from '../observable';
import { Subject } from './subject';

/**
 * [Glossary](https://jsr.io/@xander/observable#replaysubject)
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
export type ReplaySubject<Value = unknown> = Subject<Value>;

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

	subscribe(
		observerOrNext?:
			| Partial<ConsumerObserver>
			| ((value: unknown) => unknown)
			| null,
	): void {
		this.#output.subscribe(observerOrNext);
	}

	asObservable(): Observable {
		return this.#output;
	}
};
