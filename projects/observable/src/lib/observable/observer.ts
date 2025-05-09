import { UnhandledError } from '../errors';

/**
 * An object interface that defines a set of callbacks for receiving notifications from a producer.
 */
export interface ConsumerObserver<Value = unknown> {
	/**
	 * Signals that this {@linkcode ConsumerObserver} is no longer accepting notifications.
	 */
	readonly signal: AbortSignal;
	/**
	 * A callback that receives `next` notifications with an attached value.
	 * @param value The value received with the notification.
	 */
	next(value: Value): void;
	/**
	 * A callback that receives an `error` notification with the error that caused the producer to stop. Mutually exclusive with {@linkcode complete}.
	 * @param error The {@linkcode error|error value} received with the notification.
	 */
	error(error: unknown): void;
	/**
	 * A callback that receives a `complete` notification indicating the producer has finished. Mutually exclusive with {@linkcode error}.
	 */
	complete(): void;
	/**
	 * A callback invoked when this {@linkcode ConsumerObserver} stops accepting notifications, either by {@linkcode complete}, {@linkcode error}, or {@linkcode signal|abortion}.
	 */
	finally(): void;
}

/**
 * An object interface that defines a set of functions a user can use to push notifications to a {@linkcode ConsumerObserver}.
 */
export interface ProducerObserver<Value = unknown> {
	/**
	 * Determines if/when this {@linkcode ProducerObserver} has been aborted and is no longer pushing new notifications.
	 */
	readonly signal: AbortSignal;
	/**
	 * Pushing notifications of type `next` with an attached {@linkcode value} to the {@linkcode ConsumerObserver}. This has no operation (noop) if this {@linkcode ProducerObserver} has already been aborted.
	 * @param value The {@linkcode value} to send along with the `next` notification.
	 */
	next(value: Value): void;
	/**
	 * Aborts this {@linkcode ProducerObserver} and pushes a notification of type `error` with an attached {@linkcode error} to an {@linkcode ConsumerObserver}. This has no operation (noop) if this {@linkcode ProducerObserver} has already been aborted.
	 * @param error The {@linkcode error} value to send along with the `error` notification.
	 */
	error(error: unknown): void;
	/**
	 * Aborts this {@linkcode ProducerObserver} and pushes a notification of type `complete` to a {@linkcode ConsumerObserver}. This has no operation (noop) if this {@linkcode ProducerObserver} has already been aborted.
	 */
	complete(): void;
}

export type ProducerObserverConstructor = new <Value = unknown>(
	observerOrNext?:
		| Partial<ConsumerObserver<Value>>
		| ((value: Value) => unknown)
		| null,
) => ProducerObserver<Value>;

export const ProducerObserver: ProducerObserverConstructor = class {
	/** @internal */
	readonly #consumerObserver?: Partial<ConsumerObserver> | null;

	/** @internal */
	readonly #controller = new AbortController();

	/** @internal */
	readonly signal = this.#controller.signal;

	/** @internal */
	constructor(
		observerOrNext?:
			| Partial<ConsumerObserver>
			| ((value: unknown) => unknown)
			| null,
	) {
		if (typeof observerOrNext === 'function') {
			this.#consumerObserver = { next: observerOrNext };
		} else this.#consumerObserver = observerOrNext;

		if (this.#consumerObserver?.signal) {
			const { signal: observerSignal } = this.#consumerObserver;
			const finalizer = () => {
				this.#controller.abort();
				this.#consumerObserver?.finally?.();
			};
			observerSignal.addEventListener('abort', finalizer, {
				signal: this.signal,
			});
			if (observerSignal.aborted) finalizer();
		}
	}

	/** @internal */
	next(value: unknown): void {
		// If this observer has been aborted there is nothing to do.
		if (this.signal.aborted) return;

		try {
			this.#consumerObserver?.next?.(value);
		} catch (error) {
			this.error(error);
		}
	}

	/** @internal */
	error(error: unknown): void {
		// If this observer has been aborted there is nothing to do.
		if (this.signal.aborted) return;

		// Abort this observer before pushing notifications to the
		// observer to handle reentrant code.
		this.#controller.abort();

		try {
			if (this.#consumerObserver?.error) {
				this.#consumerObserver.error(error);
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
		// If this observer has been aborted there is nothing to do.
		if (this.signal.aborted) return;

		// Abort this observer before pushing notifications to the
		// observer to handle reentrant code.
		this.#controller.abort();

		try {
			this.#consumerObserver?.complete?.();
		} catch (error) {
			reportUnhandledError(error);
		} finally {
			this.#finally();
		}
	}

	/** @internal */
	#finally(): void {
		try {
			this.#consumerObserver?.finally?.();
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
