import { Observable, ConsumerObserver, ProducerObserver } from '../observable';
import { Pipeline } from '../pipe';
import { InteropObservable, observable, Subscribable } from '../operators';

/**
 * A special type of `observable` (not to be confused with the {@linkcode Observable} class) that multicast `producer` notifications to many
 * `consumers`, similar to an event emitter. If the {@linkcode Subject} has already pushed the notification of type `complete` or `error`,
 * late `consumers` will be immediately pushed the same notification on `subscribe`.
 * @example
 * ```ts
 * import { Subject } from '@xander/observable';
 *
 * const subject = new Subject<number>();
 *
 * subject.subscribe((value) => console.log(value));
 *
 * subject.next(1);
 *
 * // console output:
 * // 1
 *
 * subject.subscribe((value) => console.log(value));
 *
 * subject.next(2);
 *
 * // console output:
 * // 2
 * // 2
 * ```
 */
export interface Subject<Value = void>
	extends InteropObservable<Value>,
		Pipeline<Subject<Value>> {
	/**
	 * A `String` value that is used in the creation of the string description of this {@linkcode Subject}. Called by the built-in method `Object.prototype.toString`.
	 */
	readonly [Symbol.toStringTag]: string;
	/**
	 * Indicates that the `producer` cannot push any more notifications through this {@linkcode Subject}.
	 */
	readonly signal: AbortSignal;
	/**
	 * Notify all `consumers` of this {@linkcode Subject} that a {@linkcode value} has been produced. This has no-operation if this {@linkcode Subject} is already {@linkcode signal|aborted}.
	 * @param value The {@linkcode value} that has been produced.
	 */
	next(value: Value): void;
	/**
	 * Abort this {@linkcode Subject} and notify all `consumers` of this {@linkcode Subject} that the `producer` has finished successfully. This is mutually exclusive
	 * with {@linkcode error} and has no-operation if this {@linkcode Subject} is already {@linkcode signal|aborted}.
	 */
	complete(): void;
	/**
	 * Abort this {@linkcode Subject} and notify all `consumers` of this {@linkcode Subject} that the `producer` has finished because an {@linkcode error} occurred. This is
	 * mutually exclusive with {@linkcode complete} and has no-operation if this {@linkcode Subject} is already {@linkcode signal|aborted}.
	 * @param error The {@linkcode error} that occurred.
	 */
	error(error: unknown): void;
	/**
	 * Access an {@linkcode Observable} with this {@linkcode Subject} as the source. You can do this to create custom `producer`-side logic of this
	 * {@linkcode Subject} and conceal it from code that uses the {@linkcode Observable}.
	 * @returns An {@linkcode Observable} that this {@linkcode Subject} casts to.
	 */
	asObservable(): Observable<Value>;
	/**
	 * Observe notifications from this {@linkcode Subject}.
	 * @param observerOrNext If provided, either a {@linkcode ConsumerObserver} with some or all callback methods, or the `next` handler that is called for each produced value.
	 */
	subscribe(
		observerOrNext?:
			| Partial<ConsumerObserver<Value>>
			| ((value: Value) => unknown)
			| null,
	): void;
	/**
	 * A method that returns the async iterator for this {@linkcode Subject}. Called by the semantics of the for-await-of statement.
	 */
	[Symbol.asyncIterator](): AsyncIterableIterator<Value, void, void>;
}

export interface SubjectConstructor {
	new (): Subject;
	new <Value>(): Subject<Value>;
	readonly prototype: Subject;
}

/**
 * Flag indicating that an error is not set.
 */
const noError = Symbol('noError');

export const Subject: SubjectConstructor = class<Value> {
	readonly [Symbol.toStringTag] = 'Subject';
	readonly #controller = new AbortController();
	readonly signal = this.#controller.signal;
	#error: unknown = noError;
	/**
	 * Tracking a known array of observers, so we don't have to clone them while iterating to prevent reentrant
	 * behaviors. (for example, what if this {@linkcode Subject} is subscribed to when nexting to an observer)
	 */
	#observersSnapshot?: ReadonlyArray<ProducerObserver<Value>>;
	readonly #observers = new Map<symbol, ProducerObserver<Value>>();
	readonly #delegate = new Observable<Value>((observer) => {
		// Check if this subject has finalized so we can notify the observer immediately.
		if (this.#error !== noError) observer.error(this.#error);
		else if (this.signal.aborted) observer.complete();

		// If the observer is already aborted then there's nothing to do.
		// This could be because the observer was aborted before it passed to this subject
		// or from this subject being in a finalized state.
		if (observer.signal.aborted) return;

		// Use a unique symbol to identify the observer since it is allowed for the same
		// observer to be added multiple times.
		const key = Symbol('Subject producer observer');

		// Add the observer to the observers Map so it can begin to receive push notifications.
		this.#observers.set(key, observer);

		// Reset the observers snapshot since it is now stale.
		this.#observersSnapshot = undefined;

		// Remove the observer from the observers Map when it's at the end of it's lifecycle.
		observer.signal.addEventListener(
			'abort',
			() => this.#observers.delete(key),
			{ signal: observer.signal },
		);
	});
	readonly #pipeline = new Pipeline(this);

	constructor() {
		// Free up memory whenever this subject is at the end of it's lifecycle.
		this.signal.addEventListener(
			'abort',
			() => {
				this.#observers.clear();
				this.#observersSnapshot = undefined;
			},
			{ signal: this.signal },
		);
	}

	[observable](): Subscribable<Value> {
		return this;
	}

	[Symbol.asyncIterator](): AsyncIterableIterator<Value, void, void> {
		return this.#delegate[Symbol.asyncIterator]();
	}

	subscribe(
		observerOrNext?:
			| Partial<ConsumerObserver<Value>>
			| ((value: Value) => unknown)
			| null,
	): void {
		this.#delegate.subscribe(observerOrNext);
	}

	next(value: Value): void {
		// If this subject has been aborted there is nothing to do.
		if (this.signal.aborted) return;

		// Multicast this notification.
		this.#ensureObserversSnapshot().forEach((observer) => observer.next(value));
	}

	complete(): void {
		// If this subject has been aborted there is nothing to do.
		if (this.signal.aborted) return;

		// Get the observers snapshot before aborting because they will be cleared.
		const observers = this.#ensureObserversSnapshot();

		// Abort this subject before pushing this notification in-case of reentrant code.
		this.#controller.abort();

		// Multicast this notification.
		observers.forEach((observer) => observer.complete());
	}

	error(error: unknown): void {
		// If this subject has been aborted there is nothing to do.
		if (this.signal.aborted) return;

		// Set the finalization state before aborting in-case of reentrant code.
		this.#error = error;

		// Get the observers snapshot before aborting because they will be cleared.
		const observers = this.#ensureObserversSnapshot();

		// Abort this subject before pushing the error notification in-case of reentrant code.
		this.#controller.abort();

		// Multicast this notification.
		observers.forEach((observer) => observer.error(error));
	}

	pipe(...operations: []): this {
		return this.#pipeline.pipe(...operations);
	}

	asObservable(): Observable<Value> {
		return this.#delegate;
	}

	#ensureObserversSnapshot(): ReadonlyArray<ProducerObserver<Value>> {
		return (this.#observersSnapshot ??= this.#takeObserversSnapshot());
	}

	#takeObserversSnapshot(): ReadonlyArray<ProducerObserver<Value>> {
		return Array.from(this.#observers.values());
	}
};
