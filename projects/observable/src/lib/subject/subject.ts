import { Observable, Observer, Subscriber } from '../observable';
import { Pipeline, UnaryFunction } from '../pipe';
import { subscribe } from '../operators';

/**
 * A Subject is a special type of Observable that allows values to be
 * multicasted to many Observers. Subjects are like EventEmitters.
 *
 * You can subscribe to a Subject, and you can call next to feed values
 * as well as error and complete.
 */
export interface Subject<Value = void>
	extends Omit<Observable<Value>, 'pipe'>,
		Pipeline<Subject<Value>> {
	/**
	 * @internal
	 * @ignore
	 * @readonly
	 */
	readonly [Symbol.toStringTag]: string;
	/**
	 * A signifier indicating if/when this {@linkcode Subject|subject} has been aborted
	 * and is no longer accepting new notifications.
	 * @readonly
	 * @public
	 */
	readonly signal: AbortSignal;
	/**
	 * Multicast a value to all subscribers of this {@linkcode Subject|subject}.
	 * Has no operation (noop) if this {@linkcode Subject|subject} is already aborted.
	 * @param value The value to multicast to all subscribers.
	 * @public
	 */
	next(value: Value): void;
	/**
	 * Aborts this {@linkcode Subject|subject} and multicasts a completion notification to all subscribers.
	 * Any future subscribers will be immediately completed (unless they are already aborted).
	 * Has no operation (noop) if this {@linkcode Subject|subject} is already aborted.
	 * @public
	 */
	complete(): void;
	/**
	 * Aborts this {@linkcode Subject|subject} and multicasts an error to all subscribers.
	 * Any future subscribers will be immediately notified of the error (unless they are already aborted).
	 * Has no operation (noop) if this {@linkcode Subject|subject} is already aborted.
	 * @param error The error to multicast to all subscribers.
	 * @public
	 */
	error(error: unknown): void;
	/**
	 * Creates a new Observable with this {@linkcode Subject|subject} as the source. You can do this
	 * to create custom Observer-side logic of this {@linkcode Subject|subject} and conceal it from
	 * code that uses the Observable.
	 * @return Observable that this {@linkcode Subject|subject} casts to.
	 * @public
	 */
	asObservable(): Observable<Value>;
}

export interface SubjectConstructor {
	new <Value = void>(): Subject<Value>;
	readonly prototype: Subject;
}

/**
 * @usage Flag indicating that an error is not set.
 * @internal
 */
const noError = Symbol('noError');

export const Subject: SubjectConstructor = class {
	/**
	 * @internal
	 * @ignore
	 */
	readonly [Symbol.toStringTag] = this.constructor.name;

	/**
	 * @internal
	 * @ignore
	 */
	readonly #controller = new AbortController();

	/**
	 * @internal
	 * @ignore
	 */
	readonly signal = this.#controller.signal;

	/**
	 * @internal
	 * @ignore
	 */
	#error: unknown = noError;

	/**
	 * This is used to track a known array of subscribers, so we don't have to
	 * clone them while iterating to prevent reentrant behaviors.
	 * (for example, what if this {@linkcode Subject|subject} is subscribed to when nexting to an observer)
	 * @internal
	 * @private
	 */
	#subscribersSnapshot?: ReadonlyArray<Subscriber>;

	/**
	 * @internal
	 * @ignore
	 */
	readonly #subscribers = new Map<symbol, Subscriber>();

	/**
	 * @internal
	 * @ignore
	 */
	readonly #delegate = new Observable((subscriber) => {
		// Check if this subject has finalized so we can notify the subscriber immediately.
		if (this.#error !== noError) subscriber.error(this.#error);
		else if (this.signal.aborted) subscriber.complete();

		// If the subscriber is already aborted then there's nothing to do.
		// This could be because the subscriber was aborted before it passed to this subject
		// or from this subject being in a finalized state (this.#checkFinalizers(subscriber)).
		if (subscriber.signal.aborted) return;

		// Use a unique symbol to identify the subscriber since it is allowed for the same
		// subscriber to be added multiple times.
		const symbol = Symbol('Subject subscriber');

		// Add the subscriber to the subscribers Map so it can begin to receive push notifications.
		this.#subscribers.set(symbol, subscriber);

		// Reset the subscribers snapshot since it is now stale.
		this.#subscribersSnapshot = undefined;

		// Remove the subscriber from the subscribers Map when it is at the end of it's lifecycle.
		subscriber.signal.addEventListener(
			'abort',
			() => this.#subscribers.delete(symbol),
			{ signal: subscriber.signal },
		);
	});

	/**
	 * @internal
	 * @ignore
	 */
	readonly #pipeline = new Pipeline(this);

	/**
	 * @internal
	 * @ignore
	 */
	[subscribe](observerOrNext?: Partial<Observer> | UnaryFunction | null): void {
		this.subscribe(observerOrNext);
	}

	/**
	 * @internal
	 * @ignore
	 */
	subscribe(observerOrNext?: Partial<Observer> | UnaryFunction | null): void {
		this.#delegate.subscribe(observerOrNext);
	}

	/**
	 * @internal
	 * @ignore
	 */
	next(value: unknown): void {
		// If this subject has been aborted there is nothing to do.
		if (this.signal.aborted) return;

		// Push the next value to all subscribers.
		this.#ensureSubscribersSnapshot().forEach((subscriber) =>
			subscriber.next(value),
		);
	}

	/**
	 * @internal
	 * @ignore
	 */
	complete(): void {
		// If this subject has been aborted there is nothing to do.
		if (this.signal.aborted) return;

		// Abort this subject before pushing the complete notification in-case of reentrant code.
		this.#controller.abort();

		// Push the complete notification to all subscribers.
		this.#ensureSubscribersSnapshot().forEach((subscriber) =>
			subscriber.complete(),
		);

		// Clear subscriber state after all have been notified.
		this.#subscribers.clear();
		this.#subscribersSnapshot = undefined;
	}

	/**
	 * @internal
	 * @ignore
	 */
	error(error: unknown): void {
		// If this subject has been aborted there is nothing to do.
		if (this.signal.aborted) return;

		// Set the finalization state before aborting in-case of reentrant code.
		this.#error = error;

		// Abort this subject before pushing the error notification in-case of reentrant code.
		this.#controller.abort();

		// Push the error notification to all subscribers.
		this.#ensureSubscribersSnapshot().forEach((subscriber) =>
			subscriber.error(error),
		);

		// Clear subscriber state after all have been notified.
		this.#subscribers.clear();
		this.#subscribersSnapshot = undefined;
	}

	/**
	 * @internal
	 * @ignore
	 */
	pipe(...operations: []): this {
		return this.#pipeline.pipe(...operations);
	}

	/**
	 * @internal
	 * @ignore
	 */
	asObservable(): Observable {
		return this.#delegate;
	}

	/**
	 * @internal
	 * @ignore
	 */
	#ensureSubscribersSnapshot(): ReadonlyArray<Subscriber> {
		return (this.#subscribersSnapshot ??= this.#takeSubscribersSnapshot());
	}

	/**
	 * @internal
	 * @ignore
	 */
	#takeSubscribersSnapshot(): ReadonlyArray<Subscriber> {
		return Array.from(this.#subscribers.values());
	}
};
