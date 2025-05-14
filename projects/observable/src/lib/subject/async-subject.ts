import {
	Observable,
	type ProducerObserver,
	type ConsumerObserver,
} from '../observable';
import { Subject } from './subject';
import { Pipeline } from '../pipe';
import { InteropObservable, observable, Subscribable } from '../operators';

/**
 * A variant of {@linkcode Subject}. When values are produced, the latest value is buffered. If/when the {@linkcode AsyncSubject} completes
 * all `consumers` will receive the latest value, if any, and then `complete`. Late `consumers` of the `complete` notification will receive
 * the latest value, if any, and then `complete`.
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
export interface AsyncSubject<Value = unknown>
	extends InteropObservable<Value>,
		Pipeline<AsyncSubject<Value>> {
	/**
	 * A `String` value that is used in the creation of the string description of this {@linkcode AsyncSubject}. Called by the built-in method
	 * `Object.prototype.toString`.
	 */
	readonly [Symbol.toStringTag]: string;
	/**
	 * Indicates that the `producer` cannot push any more notifications through this {@linkcode AsyncSubject}.
	 */
	readonly signal: AbortSignal;
	/**
	 * Store a {@linkcode value} to and notify all `consumers` of this {@linkcode AsyncSubject} that a {@linkcode value} has been produced on completion.
	 * This has no-operation if this {@linkcode AsyncSubject} is already {@linkcode signal|aborted}.
	 * @param value The {@linkcode value} that has been produced.
	 */
	next(value: Value): void;
	/**
	 * Abort this {@linkcode AsyncSubject} and notify all `consumers` of that the `producer` has finished successfully.
	 * If a value was previously produced, the consumers will be notified before completing. This is mutually exclusive
	 * with {@linkcode error} and has no-operation if this {@linkcode AsyncSubject} is already {@linkcode signal|aborted}.
	 */
	complete(): void;
	/**
	 * Abort this {@linkcode AsyncSubject} and notify all `consumers` of that the `producer` has finished because an {@linkcode error} occurred.
	 * This is mutually exclusive with {@linkcode complete} and has no-operation if this {@linkcode AsyncSubject} is already {@linkcode signal|aborted}.
	 * @param error The {@linkcode error} that occurred.
	 */
	error(error: unknown): void;
	/**
	 * Access an {@linkcode Observable} with this {@linkcode AsyncSubject} as the source. You can do this to create custom `producer`-side logic of this
	 * {@linkcode AsyncSubject} and conceal it from code that uses the {@linkcode Observable}.
	 * @returns An {@linkcode Observable} that this {@linkcode AsyncSubject} casts to.
	 */
	asObservable(): Observable<Value>;
	/**
	 * Observing notifications from this {@linkcode AsyncSubject}.
	 * @param observerOrNext Either an {@linkcode ConsumerObserver} with some or all options, or the `next` handler that is called for each value emitted from the subscribed {@linkcode AsyncSubject}.
	 */
	subscribe(
		observerOrNext?:
			| Partial<ConsumerObserver<Value>>
			| ((value: Value) => unknown)
			| null,
	): void;
	/**
	 * A method that returns the default async iterator for an object. Called by the semantics of the for-await-of statement.
	 */
	[Symbol.asyncIterator](): AsyncIterableIterator<Value, void, void>;
}
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
	readonly [Symbol.toStringTag] = this.constructor.name;
	readonly #delegate = new Subject<unknown>();
	readonly signal = this.#delegate.signal;
	readonly #pipeline = new Pipeline(this);
	#value: unknown = noValue;
	#error: unknown = noError;
	readonly #output = new Observable((observer) => {
		// Check if this subject has finalized so we can notify the observer immediately.
		if (this.#error !== noError) observer.error(this.#error);
		else if (this.signal.aborted) this.#complete(observer);

		// Always subscribe to the delegate subject.
		this.#delegate.subscribe(observer);
	});

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

	asObservable(): Observable {
		return this.#output;
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
