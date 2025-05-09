import { Observable, ConsumerObserver, ProducerObserver } from '../observable';
import { Pipeline } from '../pipe';
import { InteropObservable, observable, Subscribable } from '../operators';

/**
 * A special type of {@linkcode Observable|observable} that allows notifications to multicast to many observers, similar to an event emitter. If the {@linkcode Subject|subject} has already pushed the notification of type `complete` or `error`, late observers will be immediately pushed the same notification on `subscribe`.
 * @public
 */
export interface Subject<Value = void>
	extends InteropObservable<Value>,
		Pipeline<Subject<Value>> {
	/**
	 * A String value that is used in the creation of the default string description of an object. Called by the built-in method Object.prototype.toString.
	 * @readonly
	 * @public
	 */
	readonly [Symbol.toStringTag]: string;
	/**
	 * Determining if/when this {@linkcode Subject|subject} has been aborted and is no longer accepting new notifications.
	 * @readonly
	 * @property
	 * @public
	 */
	readonly signal: AbortSignal;
	/**
	 * Multicast a notification of type `next` with the attached {@linkcode value} to all observers of this {@linkcode Subject|subject}. This has no operation (noop) if this {@linkcode Subject|subject} is already aborted.
	 * @param value The {@linkcode value} to multicast to all observers.
	 * @method
	 * @public
	 */
	next(value: Value): void;
	/**
	 * Abort this {@linkcode Subject|subject} and multicast a notification of type `complete` to all observers. Any future observers will be immediately notified of the `complete` (unless they are already aborted). This has no operation (noop) if this {@linkcode Subject|subject} is already aborted.
	 * @method
	 * @public
	 */
	complete(): void;
	/**
	 * Abort this {@linkcode Subject|subject} and multicast a notification of type `error` with the attached {@linkcode error} to all observers. Any future observers will be immediately notified of the `error` (unless they are already aborted). This has no operation (noop) if this {@linkcode Subject|subject} is already aborted.
	 * @param error The {@linkcode error} to multicast to all observers.
	 * @method
	 * @public
	 */
	error(error: unknown): void;
	/**
	 * Create a new {@linkcode Observable} with this {@linkcode Subject|subject} as the source. You can do this to create custom ConsumerObserver-side logic of this {@linkcode Subject|subject} and conceal it from code that uses the {@linkcode Observable}.
	 * @returns An {@linkcode Observable} that this {@linkcode Subject|subject} casts to.
	 * @method
	 * @public
	 */
	asObservable(): Observable<Value>;
	/**
	 * Observing notifications from this {@linkcode Subject|subject}.
	 * @param observerOrNext If provided, either an {@linkcode ConsumerObserver} with some or all options or the `next` handler (equivalent of `subscribe({ next })`).
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

/**
 * @public
 */
export interface SubjectConstructor {
	new (): Subject;
	new <Value>(): Subject<Value>;
	readonly prototype: Subject;
}

/**
 * Flag indicating that an error is not set.
 * @internal
 */
const noError = Symbol('noError');

export const Subject: SubjectConstructor = class<Value> {
	/**
	 * @internal
	 * @ignore
	 */
	readonly [Symbol.toStringTag] = 'Subject';

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
	 * Tracking a known array of observers, so we don't have to clone them while iterating to prevent reentrant behaviors. (for example, what if this {@linkcode Subject|subject} is subscribed to when nexting to an observer)
	 * @internal
	 * @private
	 */
	#observersSnapshot?: ReadonlyArray<ProducerObserver<Value>>;

	/**
	 * @internal
	 * @ignore
	 */
	readonly #observers = new Map<symbol, ProducerObserver<Value>>();

	/**
	 * @internal
	 * @ignore
	 */
	readonly #delegate = new Observable<Value>((observer) => {
		// Check if this subject has finalized so we can notify the observer immediately.
		if (this.#error !== noError) observer.error(this.#error);
		else if (this.signal.aborted) observer.complete();

		// If the observer is already aborted then there's nothing to do.
		// This could be because the observer was aborted before it passed to this subject
		// or from this subject being in a finalized state (this.#checkFinalizers(observer)).
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

	/**
	 * @internal
	 * @ignore
	 */
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

	/**
	 * @internal
	 * @ignore
	 */
	[observable](): Subscribable<Value> {
		return this;
	}

	/**
	 * @internal
	 * @ignore
	 */
	[Symbol.asyncIterator](): AsyncIterableIterator<Value, void, void> {
		return this.#delegate[Symbol.asyncIterator]();
	}

	/**
	 * @internal
	 * @ignore
	 */
	subscribe(
		observerOrNext?:
			| Partial<ConsumerObserver<Value>>
			| ((value: Value) => unknown)
			| null,
	): void {
		this.#delegate.subscribe(observerOrNext);
	}

	/**
	 * @internal
	 * @ignore
	 */
	next(value: Value): void {
		// If this subject has been aborted there is nothing to do.
		if (this.signal.aborted) return;

		// Multicast this notification.
		this.#ensureProducerObserversSnapshot().forEach((observer) =>
			observer.next(value),
		);
	}

	/**
	 * @internal
	 * @ignore
	 */
	complete(): void {
		// If this subject has been aborted there is nothing to do.
		if (this.signal.aborted) return;

		// Get the observers snapshot before aborting because it will be cleared.
		const observers = this.#ensureProducerObserversSnapshot();

		// Abort this subject before pushing this notification in-case of reentrant code.
		this.#controller.abort();

		// Multicast this notification.
		observers.forEach((observer) => observer.complete());
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

		// Get the observers snapshot before aborting because it will be cleared.
		const observers = this.#ensureProducerObserversSnapshot();

		// Abort this subject before pushing the error notification in-case of reentrant code.
		this.#controller.abort();

		// Multicast this notification.
		observers.forEach((observer) => observer.error(error));
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
	asObservable(): Observable<Value> {
		return this.#delegate;
	}

	/**
	 * @internal
	 * @ignore
	 */
	#ensureProducerObserversSnapshot(): ReadonlyArray<ProducerObserver<Value>> {
		return (this.#observersSnapshot ??= this.#takeProducerObserversSnapshot());
	}

	/**
	 * @internal
	 * @ignore
	 */
	#takeProducerObserversSnapshot(): ReadonlyArray<ProducerObserver<Value>> {
		return Array.from(this.#observers.values());
	}
};
