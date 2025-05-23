import { UnhandledError } from '../errors';
import { Completable } from './completable';
import { ConsumerObserver } from './consumer-observer';
import { Errorable } from './errorable';
import { Nextable } from './nextable';
import { Unsubscribable } from './unsubscribable';

/**
 * [Glossary](https://jsr.io/@xander/observable#producerobserver)
 */
export type ProducerObserver<Value = unknown> = Nextable<Value> &
	Errorable &
	Completable &
	Unsubscribable;

export interface ProducerObserverConstructor {
	new <Value>(
		observerOrNext?:
			| Partial<ConsumerObserver<Value>>
			| ((value: Value) => unknown)
			| null,
	): ProducerObserver<Value>;
	readonly prototype: ProducerObserver;
}

export const ProducerObserver: ProducerObserverConstructor = class {
	readonly #consumerObserver?: Partial<ConsumerObserver> | null;
	readonly #controller = new AbortController();
	readonly signal = this.#controller.signal;

	constructor(
		observerOrNext?:
			| Partial<ConsumerObserver>
			| ((value: unknown) => unknown)
			| null,
	) {
		if (typeof observerOrNext === 'function') {
			this.#consumerObserver = { next: observerOrNext };
		} else this.#consumerObserver = observerOrNext;

		this.#consumerObserver?.signal?.addEventListener(
			'abort',
			() => this.#finally(),
			{ signal: this.signal },
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
			this.#consumerObserver?.error?.(error);
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
