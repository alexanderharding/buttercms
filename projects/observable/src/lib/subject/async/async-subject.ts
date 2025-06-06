import type { Observer } from '../../observer';
import { observable } from '../../interop';
import { Observable } from '../../observable';
import { Subject } from '../../subject';
import type { AsyncSubjectConstructor } from './async-subject-constructor';

/**
 * A variant of {@linkcode Subject} that buffers only the latest value. When the {@linkcode AsyncSubject|subject} {@linkcode AsyncSubject.complete|completes},
 * it pushes the latest value (if any) followed by a {@linkcode AsyncSubject.complete|complete} notification to all consumers. Any new consumers that
 * {@linkcode AsyncSubject.subscribe|subscribe} after {@linkcode AsyncSubject.complete|completion} will also receive the latest value followed by the
 * {@linkcode AsyncSubject.complete|complete} notification. If no values were {@linkcode AsyncSubject.next|nexted} before {@linkcode AsyncSubject.complete|completion},
 * neither existing nor late subscribers will receive any values. If the {@linkcode AsyncSubject|subject} terminates with an {@linkcode AsyncSubject.error|error},
 * the buffered value is discarded and only the {@linkcode AsyncSubject.error|error} notification is sent to both existing and late subscribers.
 *
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
 * Flag indicating that a value is not set.
 */
const noValue = Symbol('Flag indicating that a value is not set.');

// Note: the main reason this JSDoc exists, is to satisfy the JSR score. In reality,
// the JSDoc on the above type is enough for the DX on both symbols.
/**
 * @class
 */
export const AsyncSubject: AsyncSubjectConstructor = class {
	readonly [Symbol.toStringTag] = 'AsyncSubject';
	readonly #delegate = new Subject<unknown>();
	readonly signal = this.#delegate.signal;
	#value: unknown = noValue;
	readonly #output = new Observable((observer) =>
		this.#delegate.subscribe({
			signal: observer.signal,
			error: (error) => observer.error(error),
			complete: () => {
				// If this subject has a value then we need to push it to the observer before
				// pushing the complete notification.
				if (this.#value !== noValue) observer.next(this.#value);

				// Push the complete notification to the observer.
				observer.complete();
			},
		}),
	);

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
		// Push the error notification to all observers via the delegate subject.
		this.#delegate.complete();
	}

	error(error: unknown): void {
		// If this subject has been aborted there is nothing to do.
		if (this.signal.aborted) return;

		// We have entered the error flow so we need to reset the value state
		// since it is no longer relevant and should be garbage collected.
		this.#value = noValue;

		// Push the error notification to all observers via the delegate subject.
		this.#delegate.error(error);
	}

	subscribe(
		observerOrNext?: Partial<Observer> | ((value: unknown) => unknown) | null,
	): void {
		this.#output.subscribe(observerOrNext);
	}
};
