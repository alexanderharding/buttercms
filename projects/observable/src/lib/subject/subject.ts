import { Observable, Observer, Subscriber } from '../observable';
import { Pipeline, UnaryFunction } from '../pipe';
import { subscribe } from '../operators';

/**
 * @usage The default value type for a {@linkcode Subject}.
 * @internal
 */
// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
type DefaultValue = void;

/**
 * @usage A special type of {@linkcode Observable} that allows notifications to multicast to many {@linkcode Observer|observers}, similar to an event emitter.
 * @public
 */
export interface Subject<Value = DefaultValue>
	extends Omit<Observable<Value>, 'pipe'>,
		Pipeline<Subject<Value>> {
	/**
	 * @readonly
	 * @public
	 */
	readonly [Symbol.toStringTag]: string;
	/**
	 * @usage Determining if/when this {@linkcode Subject|subject} has been aborted and is no longer accepting new notifications.
	 * @readonly
	 * @public
	 */
	readonly signal: AbortSignal;
	/**
	 * @usage Multicast a {@linkcode value} to all {@linkcode Subscriber|subscribers} of this {@linkcode Subject|subject}. Has no operation (noop) if this {@linkcode Subject|subject} is already aborted.
	 * @param value The {@linkcode value} to multicast to all {@linkcode Subscriber|subscribers}.
	 * @public
	 */
	next(value: Value): void;
	/**
	 * @usage Abort this {@linkcode Subject|subject} and multicast a complete notification to all {@linkcode Subscriber|subscribers}. Any future {@linkcode Subscriber|subscribers} will be immediately completed (unless they are already aborted). Has no operation (noop) if this {@linkcode Subject|subject} is already aborted.
	 * @public
	 */
	complete(): void;
	/**
	 * @usage Abort this {@linkcode Subject|subject} and multicast an {@linkcode error} to all {@linkcode Subscriber|subscribers}. Any future {@linkcode Subscriber|subscribers} will be immediately notified of the {@linkcode error} (unless they are already aborted). Has no operation (noop) if this {@linkcode Subject|subject} is already aborted.
	 * @param error The {@linkcode error} to multicast to all {@linkcode Subscriber|subscribers}.
	 * @public
	 */
	error(error: unknown): void;
	/**
	 * @usage Create a new {@linkcode Observable} with this {@linkcode Subject|subject} as the source. You can do this to create custom Observer-side logic of this {@linkcode Subject|subject} and conceal it from code that uses the {@linkcode Observable}.
	 * @returns An {@linkcode Observable} that this {@linkcode Subject|subject} casts to.
	 * @public
	 */
	asObservable(): Observable<Value>;
}

/**
 * @public
 */
export interface SubjectConstructor {
	new <Value = DefaultValue>(): Subject<Value>;
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
	 * @usage Tracking a known array of subscribers, so we don't have to clone them while iterating to prevent reentrant behaviors. (for example, what if this {@linkcode Subject|subject} is subscribed to when nexting to an observer)
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
