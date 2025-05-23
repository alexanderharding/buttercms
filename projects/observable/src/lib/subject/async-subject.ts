import {
	Observable,
	type ProducerObserver,
	type ConsumerObserver,
} from '../observable';
import { observable } from '../interop';
import { Subject } from './subject';

/**
 * [Glossary](https://jsr.io/@xander/observable#asyncsubject)
 * @example
 * ```ts
 * import { AsyncSubject } from "@xander/observable";
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
 * subject.complete(); // Console output: 3
 *
 * subject.subscribe((value) => console.log(value)); // Console output: 3
 * ```
 */
export type AsyncSubject<Value = unknown> = Subject<Value>;

/**
 * Object interface for an {@linkcode AsyncSubject} factory.
 */
export interface AsyncSubjectConstructor {
	new (): AsyncSubject;
	new <Value>(): AsyncSubject<Value>;
	readonly prototype: AsyncSubject;
}

/**
 * Flag indicating that a value is not set.
 */
const noValue = Symbol('noValue');

/**
 * Flag indicating that an error is not set.
 */
const noError = Symbol('noError');

export const AsyncSubject: AsyncSubjectConstructor = class {
	readonly [Symbol.toStringTag] = 'AsyncSubject';
	readonly #delegate = new Subject<unknown>();
	readonly signal = this.#delegate.signal;
	#value: unknown = noValue;
	#error: unknown = noError;
	readonly #output = new Observable((observer) => {
		// Check if this subject has finalized so we can notify the observer immediately.
		if (this.#error !== noError) observer.error(this.#error);
		else if (this.signal.aborted) this.#complete(observer);

		// Always subscribe to the delegate subject.
		this.#delegate.subscribe(observer);
	});

	[observable](): Observable {
		return this.#output;
	}

	next(value: unknown): void {
		// If this subject has been aborted there is nothing to do.
		if (this.signal.aborted) return;

		// Set the value state so it is available to the complete method.
		this.#value = value;
	}

	complete(): void {
		this.#complete();
	}

	error(error: unknown): void {
		// If this subject has been aborted there is nothing to do.
		if (this.signal.aborted) return;

		// We have entered the error flow so we need to reset the value state
		// since it is no longer relevant and should be garbage collected.
		this.#value = noValue;

		// Set the error state before pushing the error notification in-case of reentrant code.
		this.#error = error;

		// Push the error notification to all observers via the delegate subject.
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

	#complete(
		observer: Pick<ProducerObserver, 'next' | 'complete'> = this.#delegate,
	): void {
		// If this subject has a value then we need to push it to the observer before
		// pushing the complete notification.
		if (this.#value !== noValue) observer.next(this.#value);

		// Push the completion notification to the observer.
		observer.complete();
	}
};
