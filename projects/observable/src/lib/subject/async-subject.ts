import {
	Observable,
	subscribe,
	type Observer,
	type Subscriber,
} from '../observable';
import { Subject } from './subject';
import { Pipeline, type UnaryFunction } from '../pipe';

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
	#value: unknown;

	/** @internal */
	#hasValue = false;

	/** @internal */
	#hasError = false;

	/** @internal */
	#thrownError: unknown;

	/** @internal */
	readonly #output = new Observable((subscriber) => {
		// Check if this subject has finalized so we can notify the subscriber immediately.
		this.#checkFinalizers(subscriber);

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
		this.#hasValue = true;
		this.#value = value;
	}

	/** @internal */
	complete(): void {
		if (this.#hasValue) this.#delegate.next(this.#value);
		this.#delegate.complete();
	}

	/** @internal */
	error(error: unknown): void {
		// If this subject has been aborted there is nothing to do.
		if (this.signal.aborted) return;

		// We have entered the error flow so we need to reset the value state
		// since it is no longer relevant and should be garbage collected.
		this.#hasValue = false;
		this.#value = undefined;

		// Set the finalization state before pushing the error notification in-case of reentrant code.
		this.#hasError = true;
		this.#thrownError = error;

		// Push the error notification to all subscribers.
		this.#delegate.error(error);
	}

	/** @internal */
	asObservable(): Observable {
		return this.#output;
	}

	/** @internal */
	#checkFinalizers(subscriber: Subscriber): void {
		if (this.#hasError) {
			// This Subject has errored so we need to notify the subscriber.
			subscriber.error(this.#thrownError);
		} else if (this.signal.aborted) {
			if (this.#hasValue) subscriber.next(this.#value);
			subscriber.complete();
		}
	}
};
