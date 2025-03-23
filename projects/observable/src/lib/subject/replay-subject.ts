import { Observable, subscribe, type Observer } from '../observable';
import { Subject } from './subject';
import { Pipeline } from '../pipe';
/**
 * A variant of {@linkcode Subject} that emits a buffer of the last N values, or all values if less than N.
 */
export type ReplaySubject<Value = unknown> = Omit<Subject<Value>, 'pipe'> &
	Pipeline<ReplaySubject<Value>>;

export interface ReplaySubjectConstructor {
	new <Value>(count?: number): ReplaySubject<Value>;
	readonly prototype: ReplaySubject;
}

export const ReplaySubject: ReplaySubjectConstructor = class<Value> {
	/** @internal */
	readonly [Symbol.toStringTag] = this.constructor.name;

	/** @internal */
	readonly #count: number;

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
	constructor(count = Infinity) {
		this.#count = Math.max(1, count);

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
	[subscribe](
		observerOrNext?: ((value: Value) => void) | Partial<Observer<Value>> | null,
	): void {
		this.subscribe(observerOrNext);
	}

	/** @internal */
	subscribe(
		observerOrNext?: Partial<Observer> | ((value: unknown) => void) | null,
	): void {
		this.#output.subscribe(observerOrNext);
	}

	/** @internal */
	next(value: Value): void {
		if (!this.signal.aborted) {
			this.#buffer.push(value);
			// Trim the buffer before pushing it to the delegate so
			// reentrant code does not get pushed more values than it should.
			while (this.#buffer.length > this.#count) this.#buffer.shift();
		}

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
