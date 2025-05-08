import { UnhandledError } from '../errors';
import { UnaryFunction } from '../pipe';

/**
 * An object interface that defines a set of callbacks for receiving notifications from a producer.
 */
export interface Observer<Value = unknown> {
	/**
	 * Signals that this {@linkcode Observer} is no longer accepting notifications.
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
	 * A callback invoked when this {@linkcode Observer} stops accepting notifications, either by {@linkcode complete}, {@linkcode error}, or {@linkcode signal|abortion}.
	 */
	finally(): void;
}

/**
 * An object interface that defines a set of functions a user can use to push notifications to an {@linkcode Observer|observer}.
 */
export interface Dispatcher<Value = unknown> {
	/**
	 * Determines if/when this {@linkcode Dispatcher|dispatcher} has been aborted and is no longer pushing new notifications.
	 */
	readonly signal: AbortSignal;
	/**
	 * Pushing notifications of type `next` with an attached {@linkcode value} to an {@linkcode Observer}. This has no operation (noop) if this {@linkcode Dispatcher|dispatcher} has already been aborted.
	 * @param value The {@linkcode value} to send along with the `next` notification.
	 */
	next(value: Value): void;
	/**
	 * Aborts this {@linkcode Dispatcher|dispatcher} and pushes a notification of type `error` with an attached {@linkcode error} to an {@linkcode Observer}. This has no operation (noop) if this {@linkcode Dispatcher|dispatcher} has already been aborted.
	 * @param error The {@linkcode error} value to send along with the `error` notification.
	 */
	error(error: unknown): void;
	/**
	 * Aborts this {@linkcode Dispatcher|dispatcher} and push a notification of type `complete` to an {@linkcode Observer}. This has no operation (noop) if this {@linkcode Dispatcher|dispatcher} has already been aborted.
	 */
	complete(): void;
}

export type DispatcherConstructor = new <Value = unknown>(
	observerOrNext?:
		| Partial<Observer<Value>>
		| ((value: Value) => unknown)
		| null,
) => Dispatcher<Value>;

export const Dispatcher: DispatcherConstructor = class {
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
		// If this dispatcher has been aborted there is nothing to do.
		if (this.signal.aborted) return;

		try {
			this.#observer?.next?.(value);
		} catch (error) {
			this.error(error);
		}
	}

	/** @internal */
	error(error: unknown): void {
		// If this dispatcher has been aborted there is nothing to do.
		if (this.signal.aborted) return;

		// Abort this dispatcher before pushing notifications to the
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
		// If this dispatcher has been aborted there is nothing to do.
		if (this.signal.aborted) return;

		// Abort this dispatcher before pushing notifications to the
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
