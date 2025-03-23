import { UnaryFunction } from '../pipe';

/**
 * An object interface that defines a set of callback functions a user can use to get
 * notified of any set of {@link Subscriber} events.
 */
export interface Observer<Value = unknown> {
	/**
	 * A signifier indicating if/when this {@linkcode Observer|observer} has been
	 * aborted and is no longer receiving new notifications.
	 */
	readonly signal: AbortSignal;
	/**
	 * The callback to receive notifications of type `next` from
	 * the Subscriber, with a value. The Subscriber may call this method 0 or more
	 * times.
	 * @param value The `next` value.
	 */
	next(value: Value): void;
	/**
	 * The callback to receive notifications of type `error`, with an attached `Error`.
	 * Notifies the Observer that the Subscriber has experienced an error condition.
	 * @param err The `error` exception.
	 */
	error(error: unknown): void;
	/**
	 * The callback to receive a valueless notification of type
	 * `complete` from the Subscriber. Notifies the Observer that the Subscriber
	 * has finished sending push-based notifications.
	 */
	complete(): void;
	/**
	 * The callback to receive a valueless notification of type
	 * `abort` from the Subscriber. Notifies the Observer that the Subscriber
	 * has finished sending push-based notifications.
	 */
	finalize(): void;
}

/**
 * An object interface that defines a set of functions a user can use to push
 * notifications to an {@link Observer|observer}.
 */
export interface Subscriber<Value = unknown> {
	/**
	 * A signifier indicating if/when this {@linkcode Subscriber|subscriber} has been
	 * aborted and is no longer pushing notifications.
	 */
	readonly signal: AbortSignal;
	/**
	 * The callback to receive notifications of type `next` from
	 * the Subscriber, with a value. The Subscriber may call this method 0 or more
	 * times.
	 * @param value The `next` value.
	 */
	next(value: Value): void;
	/**
	 * The callback to receive notifications of type `error`, with an attached `Error`.
	 * Notifies the Observer that the Subscriber has experienced an error condition.
	 * @param err The `error` exception.
	 */
	error(error: unknown): void;
	/**
	 * The callback to receive a valueless notification of type
	 * `complete` from the Subscriber. Notifies the Observer that the Subscriber
	 * has finished sending push-based notifications.
	 */
	complete(): void;
}

export type SubscriberConstructor = new <Value = unknown>(
	observerOrNext?: Partial<Observer<Value>> | UnaryFunction<Value> | null,
) => Subscriber<Value>;

export const Subscriber: SubscriberConstructor = class {
	/** @internal */
	readonly #observer?: Partial<Observer> | null;

	/** @internal */
	readonly #controller = new AbortController();

	/** @internal */
	readonly signal = this.#controller.signal;

	/** @internal */
	constructor(observerOrNext?: Partial<Observer> | UnaryFunction | null) {
		if (typeof observerOrNext === 'function') {
			this.#observer = { next: observerOrNext };
		} else this.#observer = observerOrNext;

		if (this.#observer?.signal) {
			const { signal: observerSignal } = this.#observer;
			const finalizer = () => {
				this.#controller.abort();
				this.#observer?.finalize?.();
			};
			observerSignal.addEventListener('abort', finalizer, {
				signal: this.signal,
			});
			if (observerSignal.aborted) finalizer();
		}
	}

	/** @internal */
	next(value: unknown): void {
		// If this subscriber has been aborted there is nothing to do.
		if (this.signal.aborted) return;

		try {
			this.#observer?.next?.(value);
		} catch (error) {
			this.error(error);
		}
	}

	/** @internal */
	error(error: unknown): void {
		// If this subscriber has been aborted there is nothing to do.
		if (this.signal.aborted) return;

		// Abort this subscriber before pushing notifications to the
		// observer to handle reentrant code.
		this.#controller.abort();

		try {
			this.#observer?.error?.(error);
		} catch {
			// do nothing (for now)
		} finally {
			this.#observer?.finalize?.();
		}
	}

	/** @internal */
	complete(): void {
		// If this subscriber has been aborted there is nothing to do.
		if (this.signal.aborted) return;

		// Abort this subscriber before pushing notifications to the
		// observer to handle reentrant code.
		this.#controller.abort();

		try {
			this.#observer?.complete?.();
		} catch {
			// do nothing (for now)
		} finally {
			this.#observer?.finalize?.();
		}
	}
};
