import { Observable, type Observer } from '../observable';
import { Subject } from './subject';
import { Pipeline, type UnaryFunction } from '../pipe';
import { subscribe } from '../operators';

/**
 * A variant of {@linkcode Subject} that only multicasts it's latest value, if any, on completion.
 * Late subscribers will receive the latest value from the subject and then complete.
 *
 * @example
 * import { AsyncSubject } from "observable";
 *
 * const subject = new AsyncSubject<number>();
 *
 * subject.next(1);
 * subject.next(2);
 *
 * subject.subscribe((value) => console.log(value));
 *
 * subject.next(3);
 *
 * subject.complete();
 *
 * // Console output:
 * // 3
 *
 * subject.subscribe((value) => console.log(value));
 *
 * // Console output:
 * // 3
 *
 */
export type AsyncSubject<Value = unknown> = Omit<Subject<Value>, 'pipe'> &
	Pipeline<AsyncSubject<Value>>;

export interface AsyncSubjectConstructor {
	new <Value>(): AsyncSubject<Value>;
	readonly prototype: AsyncSubject;
}

/**
 * @usage Flag indicating that a value is not set.
 * @internal
 */
const noValue = Symbol('noValue');

/**
 * @usage Flag indicating that an error is not set.
 * @internal
 */
const noError = Symbol('noError');

export const AsyncSubject: AsyncSubjectConstructor = class {
	/** @internal */
	readonly [Symbol.toStringTag] = this.constructor.name;

	/** @internal */
	readonly #delegate = new Subject<unknown>();

	/** @internal */
	readonly signal = this.#delegate.signal;

	/** @internal */
	readonly #pipeline = new Pipeline(this);

	/** @internal */
	#value: unknown = noValue;

	/** @internal */
	#error: unknown = noError;

	/** @internal */
	readonly #output = new Observable((subscriber) => {
		// Check if this subject has finalized so we can notify the subscriber immediately.
		if (this.#error !== noError) subscriber.error(this.#error);
		else if (this.signal.aborted) this.#complete(subscriber);

		// Always subscribe to the delegate subject.
		this.#delegate.subscribe(subscriber);
	});

	/** @internal */
	pipe(...operations: []): this {
		return this.#pipeline.pipe(...operations);
	}

	/** @internal */
	[subscribe](observerOrNext?: UnaryFunction | Partial<Observer> | null): void {
		this.subscribe(observerOrNext);
	}

	/** @internal */
	subscribe(observerOrNext?: UnaryFunction | Partial<Observer> | null): void {
		this.#output.subscribe(observerOrNext);
	}

	/** @internal */
	next(value: unknown): void {
		// If this subject has been aborted there is nothing to do.
		if (this.signal.aborted) return;

		// Set the value state so it is available to the complete method.
		this.#value = value;
	}

	/** @internal */
	complete(): void {
		this.#complete();
	}

	/** @internal */
	error(error: unknown): void {
		// If this subject has been aborted there is nothing to do.
		if (this.signal.aborted) return;

		// We have entered the error flow so we need to reset the value state
		// since it is no longer relevant and should be garbage collected.
		this.#value = noValue;

		// Set the error state before pushing the error notification in-case of reentrant code.
		this.#error = error;

		// Push the error notification to all subscribers via the delegate subject.
		this.#delegate.error(error);
	}

	/** @internal */
	asObservable(): Observable {
		return this.#output;
	}

	/** @internal */
	#complete(
		observer: Pick<Observer, 'next' | 'complete'> = this.#delegate,
	): void {
		// If this subject has a value then we need to push it to the observer before
		// pushing the complete notification.
		if (this.#value !== noValue) observer.next(this.#value);

		// Push the completion notification to the observer.
		observer.complete();
	}
};
