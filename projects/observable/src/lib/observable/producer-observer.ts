import { UnhandledError } from '../errors';
import { ConsumerObserver } from './consumer-observer';

/**
 * An object interface that defines a set of functions a user can use to push notifications to a consumer.
 */
export interface ProducerObserver<Value = unknown> {
	/**
	 * Signals that this {@linkcode ProducerObserver|observer} has been aborted and is no longer pushing new notifications.
	 */
	readonly signal: AbortSignal;
	/**
	 * Pushing notifications of type `next` with an attached {@linkcode value} to a consumer. This has no operation (noop) if this {@linkcode ProducerObserver|observer} has already been aborted.
	 * @param value The {@linkcode value} to send along with the `next` notification.
	 */
	next(value: Value): void;
	/**
	 * Aborts this {@linkcode ProducerObserver|observer} and pushes a notification of type `error` with an attached {@linkcode error} to a consumer. This has no operation (noop) if this {@linkcode ProducerObserver|observer} has already been aborted.
	 * @param error The {@linkcode error} value to send along with the `error` notification.
	 */
	error(error: unknown): void;
	/**
	 * Aborts this {@linkcode ProducerObserver|observer} and pushes a notification of type `complete` to a consumer. This has no operation (noop) if this {@linkcode ProducerObserver|observer} has already been aborted.
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
