import { Observable, type ConsumerObserver } from '../observable';
import { Subject } from './subject';
import { Pipeline, type UnaryFunction } from '../pipe';
import { InteropObservable, observable, Subscribable } from '../operators';

/**
 * A variant of {@linkcode Subject} that only multicast it's latest value, if any, on completion.
 * Late observers will receive the latest value, if any, from the subject and then complete.
 *
 * @example
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
export interface AsyncSubject<Value = unknown>
	extends InteropObservable<Value>,
		Pipeline<AsyncSubject<Value>> {
	/**
	 * A String value that is used in the creation of the default string description of an object. Called by the built-in method Object.prototype.toString.
	 * @readonly
	 * @public
	 */
	readonly [Symbol.toStringTag]: string;
	/**
	 * Determining if/when this {@linkcode AsyncSubject|subject} has been aborted and is no longer accepting new notifications.
	 * @readonly
	 * @property
	 * @public
	 */
	readonly signal: AbortSignal;
	/**
	 * Store a {@linkcode value} to be multicast to all observers of this {@linkcode AsyncSubject|subject} on complete. Has no operation (noop) if this {@linkcode AsyncSubject|subject} is already aborted.
	 * @param value The {@linkcode value} to multicast to all observers on complete.
	 * @method
	 * @public
	 */
	next(value: Value): void;
	/**
	 * Abort this {@linkcode AsyncSubject|subject} and multicast a complete notification to all observers. If a value was previously stored via `next()`, that value will be multicast to all observers before completing. Any future observers will receive the stored value (if any) and then complete (unless they are already aborted). Has no operation (noop) if this {@linkcode AsyncSubject|subject} is already aborted.
	 * @method
	 * @public
	 */
	complete(): void;
	/**
	 * Abort this {@linkcode AsyncSubject|subject} and multicast an {@linkcode error} to all observers. Any future observers will be immediately notified of the {@linkcode error} (unless they are already aborted). Has no operation (noop) if this {@linkcode AsyncSubject|subject} is already aborted.
	 * @param error The {@linkcode error} to multicast to all observers.
	 * @method
	 * @public
	 */
	error(error: unknown): void;
	/**
	 * Create a new {@linkcode Observable} with this {@linkcode AsyncSubject|subject} as the source. You can do this to create custom ConsumerObserver-side logic of this {@linkcode AsyncSubject|subject} and conceal it from code that uses the {@linkcode Observable}.
	 * @returns An {@linkcode Observable} that this {@linkcode AsyncSubject|subject} casts to.
	 * @method
	 * @public
	 */
	asObservable(): Observable<Value>;
	/**
	 * Observing notifications from this {@linkcode AsyncSubject|subject}.
	 * @param observerOrNext Either an {@linkcode ConsumerObserver} with some or all options, or the `next` handler that is called for each value emitted from the subscribed {@linkcode AsyncSubject|subject}.
	 * @method
	 * @public
	 */
	subscribe(
		observerOrNext?:
			| Partial<ConsumerObserver<Value>>
			| ((value: Value) => unknown)
			| null,
	): void;
	/**
	 * A method that returns the default async iterator for an object. Called by the semantics of the for-await-of statement.
	 * @public
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
 * @internal
 */
const noValue = Symbol('noValue');

/**
 * Flag indicating that an error is not set.
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
	readonly #output = new Observable((observer) => {
		// Check if this subject has finalized so we can notify the observer immediately.
		if (this.#error !== noError) observer.error(this.#error);
		else if (this.signal.aborted) this.#complete(observer);

		// Always subscribe to the delegate subject.
		this.#delegate.subscribe(observer);
	});

	/** @internal */
	pipe(...operations: []): this {
		return this.#pipeline.pipe(...operations);
	}

	/** @internal */
	[observable](): Subscribable {
		return this;
	}

	/** @internal */
	[Symbol.asyncIterator](): AsyncIterableIterator<unknown, void, void> {
		return this.#output[Symbol.asyncIterator]();
	}

	/** @internal */
	subscribe(observerOrNext: Partial<ConsumerObserver> | UnaryFunction): void {
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

		// Push the error notification to all observers via the delegate subject.
		this.#delegate.error(error);
	}

	/** @internal */
	asObservable(): Observable {
		return this.#output;
	}

	/** @internal */
	#complete(
		observer: Pick<ConsumerObserver, 'next' | 'complete'> = this.#delegate,
	): void {
		// If this subject has a value then we need to push it to the observer before
		// pushing the complete notification.
		if (this.#value !== noValue) observer.next(this.#value);

		// Push the completion notification to the observer.
		observer.complete();
	}
};
