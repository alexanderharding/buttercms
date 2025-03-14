import { Observer, Subscriber } from 'subscriber';
import { Observable, subscribe } from '../observable/observable';
import { Pipeline } from '../pipe/pipeline';

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
	/** @internal */
	readonly [Symbol.toStringTag]: string;
	/**
	 * A signifier indicating if/when this {@linkcode Subject|subject} has been aborted
	 * and is no longer accepting new notifications.
	 */
	readonly signal: AbortSignal;
	/**
	 * Multicast a value to all subscribers of this {@linkcode Subject|subject}.
	 * Has no operation (noop) if this {@linkcode Subject|subject} is already aborted.
	 * @param value The value to multicast to all subscribers.
	 */
	next(value: Value): void;
	/**
	 * Aborts this {@linkcode Subject|subject} and multicasts a completion notification to all subscribers.
	 * Any future subscribers will be immediately completed (unless they are already aborted).
	 * Has no operation (noop) if this {@linkcode Subject|subject} is already aborted.
	 */
	complete(): void;
	/**
	 * Aborts this {@linkcode Subject|subject} and multicasts an error to all subscribers.
	 * Any future subscribers will be immediately notified of the error (unless they are already aborted).
	 * Has no operation (noop) if this {@linkcode Subject|subject} is already aborted.
	 * @param error The error to multicast to all subscribers.
	 */
	error(error: unknown): void;
	/**
	 * Creates a new Observable with this {@linkcode Subject|subject} as the source. You can do this
	 * to create custom Observer-side logic of this {@linkcode Subject|subject} and conceal it from
	 * code that uses the Observable.
	 * @return Observable that this {@linkcode Subject|subject} casts to.
	 */
	asObservable(): Observable<Value>;
}

export interface SubjectConstructor {
	new <Value>(signal?: AbortSignal): Subject<Value>;
	readonly prototype: Subject;
}

export const Subject: SubjectConstructor = class {
	/** @internal */
	readonly [Symbol.toStringTag] = this.constructor.name;

	/** @internal */
	readonly #controller = new AbortController();

	/** @internal */
	readonly signal = this.#controller.signal;

	/** @internal */
	#thrownError: unknown;

	/** @internal */
	#hasError = false;

	/**
	 * This is used to track a known array of subscribers, so we don't have to
	 * clone them while iterating to prevent reentrant behaviors.
	 * (for example, what if the subject is subscribed to when nexting to an observer)
	 * @internal
	 */
	#subscribersSnapshot?: ReadonlyArray<Subscriber>;

	/** @internal */
	readonly #subscribers = new Set<Subscriber>();

	/** @internal */
	readonly #delegate = new Observable((subscriber) => {
		// Check if this subject has finalized so we can notify the subscriber immediately.
		this.#checkFinalizers(subscriber);

		// If the subscriber is already aborted then there's nothing to do.
		// This could be because the subscriber was aborted before it was added to the subject
		// or from this subject being in a finalized state (this.#checkFinalizers(subscriber)).
		if (subscriber.signal.aborted) return;

		// Add the subscriber to this subject so it can receive notifications.
		this.#addSubscriber(subscriber);

		// Cleanup subscriber when it is at the end of its lifecycle.
		subscriber.signal.addEventListener(
			'abort',
			() => this.#deleteSubscriber(subscriber),
			{ signal: subscriber.signal },
		);
	});

	/** @internal */
	readonly #pipeline = new Pipeline(this);

	/** @internal */
	[subscribe](
		observerOrNext?: ((value: unknown) => void) | Partial<Observer> | null,
	): void {
		this.subscribe(observerOrNext);
	}

	/** @internal */
	subscribe(
		observerOrNext?: Partial<Observer> | ((value: unknown) => void) | null,
	): void {
		this.#delegate.subscribe(observerOrNext);
	}

	/** @internal */
	next(value: unknown): void {
		// If this subject has been aborted there is nothing to do.
		if (this.signal.aborted) return;

		// Push the next value to all subscribers.
		(this.#subscribersSnapshot ??= this.#takeSubscriberSnapshot()).forEach(
			(subscriber) => subscriber.next(value),
		);
	}

	/** @internal */
	complete(): void {
		// If this subject has been aborted there is nothing to do.
		if (this.signal.aborted) return;

		// Abort this subject before pushing the complete notification in-case of reentrant code.
		this.#controller.abort();

		// Push the complete notification to all subscribers.
		(this.#subscribersSnapshot ??= this.#takeSubscriberSnapshot()).forEach(
			(subscriber) => subscriber.complete(),
		);

		// Teardown after all subscribers have been notified.
		this.#finalizer();
	}

	/** @internal */
	error(error: unknown): void {
		// If this subject has been aborted there is nothing to do.
		if (this.signal.aborted) return;

		// Set the finalization state before aborting in-case of reentrant code.
		this.#hasError = true;
		this.#thrownError = error;

		// Abort this subject before pushing the error notification in-case of reentrant code.
		this.#controller.abort();

		// Push the error notification to all subscribers.
		(this.#subscribersSnapshot ??= this.#takeSubscriberSnapshot()).forEach(
			(subscriber) => subscriber.error(error),
		);

		// Teardown after all subscribers have been notified.
		this.#finalizer();
	}

	/** @internal */
	pipe(...operations: []): this {
		return this.#pipeline.pipe(...operations);
	}

	/** @internal */
	asObservable(): Observable {
		return this.#delegate;
	}

	/** @internal */
	#takeSubscriberSnapshot(): ReadonlyArray<Subscriber> {
		return Array.from(this.#subscribers.values());
	}

	/** @internal */
	#checkFinalizers(subscriber: Subscriber): void {
		if (this.#hasError) {
			// This Subject has errored so we need to notify the subscriber.
			subscriber.error(this.#thrownError);
		} else if (this.signal.aborted) {
			// This Subject has been aborted so it will no longer push any more values.
			subscriber.complete();
		}
	}

	/** @internal */
	#addSubscriber(subscriber: Subscriber): void {
		this.#subscribersSnapshot = undefined;
		this.#subscribers.add(subscriber);
	}

	/** @internal */
	#deleteSubscriber(subscriber: Subscriber): void {
		this.#subscribersSnapshot = undefined;
		this.#subscribers.delete(subscriber);
	}

	/** @internal */
	#finalizer(): void {
		this.#subscribers.clear();
		this.#subscribersSnapshot = undefined;
	}
};
