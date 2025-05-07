import { UnhandledError } from '../errors';
import { UnaryFunction } from '../pipe';

/**
 * An object interface that defines a set of callback functions a user can use to get notified of any set of {@linkcode Subscriber|subscriber} events.
 */
export interface Observer<Value = unknown> {
	/**
	 * Aborting this {@linkcode Observer|observer} and no longer accept new notifications from a {@linkcode Subscriber|subscriber}.
	 * @readonly
	 * @public
	 */
	readonly signal: AbortSignal;
	/**
	 * Receiving notifications of type `next` from a {@linkcode Subscriber|subscriber}, with a {@linkcode value}.
	 * @param value The {@linkcode value} received along with the `next` notification.
	 * @public
	 */
	next(value: Value): void;
	/**
	 * Receiving notifications of type `error`, with an attached {@linkcode error} indicating that a {@linkcode Subscriber|subscriber} has experienced an error condition and has finished sending push-based notifications. This is exclusive of the `complete` notification.
	 * @param error The {@linkcode error} value received along with the `error` notification.
	 * @public
	 */
	error(error: unknown): void;
	/**
	 * Receiving a notification of type `complete` from a {@linkcode Subscriber|subscriber} indicating that the {@linkcode Subscriber|subscriber} has finished sending push-based notifications. This is exclusive of the `error` notification.
	 * @public
	 */
	complete(): void;
	/**
	 * Called when this {@linkcode Observer|observer} has finished receiving notifications from a {@linkcode Subscriber|subscriber} and/or is no longer accepting new notifications.
	 * @public
	 */
	finally(): void;
}

/**
 * An object interface that defines a set of functions a user can use to push notifications to an {@linkcode Observer|observer}.
 * @public
 */
export interface Subscriber<Value = unknown> {
	/**
	 * Determining if/when this {@linkcode Subscriber|subscriber} has been aborted and is no longer pushing new notifications.
	 * @readonly
	 * @public
	 */
	readonly signal: AbortSignal;
	/**
	 * Pushing notifications of type `next` from this Subscriber, with a {@linkcode value} to an {@linkcode Observer}. This has no operation (noop) if this Subscriber has already been aborted.
	 * @param value The {@linkcode value} to send along with the `next` notification.
	 * @public
	 */
	next(value: Value): void;
	/**
	 * Aborting this Subscriber and pushing a notification of type `error`, with an attached {@linkcode error} to an {@linkcode Observer}. This has no operation (noop) if this Subscriber has already been aborted.
	 * @param error The {@linkcode error} value to send along with the `error` notification.
	 * @public
	 */
	error(error: unknown): void;
	/**
	 * Aborting this Subscriber and push a notification of type `complete` to an {@linkcode Observer}. This has no operation (noop) if this Subscriber has already been aborted.
	 * @public
	 */
	complete(): void;
}

export type SubscriberConstructor = new <Value = unknown>(
	observerOrNext?:
		| Partial<Observer<Value>>
		| ((value: Value) => unknown)
		| null,
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
				this.#observer?.finally?.();
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
			if (this.#observer?.error) {
				this.#observer.error(error);
			} else {
				// Report directly instead of throwing to keep the stack trace
				// as simple as possible.
				reportUnhandledError(error);
			}
		} catch (error) {
			reportUnhandledError(error);
		} finally {
			this.#finally();
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
		} catch (error) {
			reportUnhandledError(error);
		} finally {
			this.#finally();
		}
	}

	/** @internal */
	#finally(): void {
		try {
			this.#observer?.finally?.();
		} catch (error) {
			reportUnhandledError(error);
		}
	}
};

/** @internal */
function reportUnhandledError(error: unknown): void {
	// Throw error asynchronously to ensure it does not interfere with
	// the library's execution.
	globalThis.queueMicrotask(() => {
		throw ensureUnhandledError(error);
	});
}

/** @internal */
function ensureUnhandledError(error: unknown): UnhandledError {
	return error instanceof UnhandledError
		? error
		: new UnhandledError({ cause: error });
}
