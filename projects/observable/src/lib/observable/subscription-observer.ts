import { UnhandledError } from '../errors';
import type { Notification } from './notification';
import { Observer } from './observer';

/**
 * Enables the producer to push {@linkcode Notification|notifications} to one (unicast) or more (multicast) consumers.
 */
export type SubscriptionObserver<Value = unknown> = Omit<
	Observer<Value>,
	'finally'
>;

/**
 * Object interface for a {@linkcode SubscriptionObserver} factory.
 */
export interface SubscriptionObserverConstructor {
	new <Value>(
		observerOrNext?:
			| Partial<Observer<Value>>
			| ((value: Value) => unknown)
			| null,
	): SubscriptionObserver<Value>;
	readonly prototype: SubscriptionObserver;
}

/**
 * @class
 */
export const SubscriptionObserver: SubscriptionObserverConstructor = class {
	readonly #consumerObserver?: Partial<Observer> | null;
	readonly #controller = new AbortController();
	readonly signal = this.#controller.signal;

	constructor(
		observerOrNext?: Partial<Observer> | ((value: unknown) => unknown) | null,
	) {
		if (typeof observerOrNext === 'function') {
			this.#consumerObserver = { next: observerOrNext };
		} else this.#consumerObserver = observerOrNext;

		this.#consumerObserver?.signal?.addEventListener(
			'abort',
			() => this.#finally(),
			{ once: true, signal: this.signal },
		);
		if (this.#consumerObserver?.signal?.aborted) this.#finally();
	}

	next(value: unknown): void {
		// If this observer has been aborted there is nothing to do.
		if (this.signal.aborted) return;

		try {
			this.#consumerObserver?.next?.(value);
		} catch (error) {
			this.error(error);
		}
	}

	error(error: unknown): void {
		// If this observer has been aborted there is nothing to do.
		if (this.signal.aborted) return;

		// Abort this observer before pushing notifications to the
		// consumer to account for reentrant code.
		this.#controller.abort();

		try {
			// Try to delegate the error to the consumer observer first,
			// otherwise report it as an unhandled error.
			if (this.#consumerObserver?.error) this.#consumerObserver.error(error);
			else reportUnhandledError(error);
		} catch (error) {
			reportUnhandledError(error);
		} finally {
			this.#finally();
		}
	}

	complete(): void {
		// If this observer has been aborted there is nothing to do.
		if (this.signal.aborted) return;

		// Abort this observer before pushing notifications to the
		// consumer to account for reentrant code.
		this.#controller.abort();

		try {
			this.#consumerObserver?.complete?.();
		} catch (error) {
			reportUnhandledError(error);
		} finally {
			this.#finally();
		}
	}

	#finally(): void {
		// Ensure this observer is aborted.
		this.#controller.abort();

		try {
			this.#consumerObserver?.finally?.();
		} catch (error) {
			reportUnhandledError(error);
		}
	}
};

function reportUnhandledError(error: unknown): void {
	// Throw error asynchronously to ensure it does not interfere with
	// the library's execution.
	globalThis.queueMicrotask(() => {
		throw ensureUnhandledError(error);
	});
}

function ensureUnhandledError(error: unknown): UnhandledError {
	return error instanceof UnhandledError
		? error
		: new UnhandledError({ cause: error });
}
