/**
 * An object interface that defines a set of callback functions a user can use to get
 * notified of any set of {@link Subscriber} events.
 */
export interface Observer<Value = unknown> {
	signal: AbortSignal;
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

export const completeSymbol = Symbol('complete');
export const errorSymbol = Symbol('error');

export interface Subscriber<Value = unknown> {
	signal: AbortSignal;
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
	observerOrNext?: Partial<Observer<Value>> | ((value: Value) => void) | null,
) => Subscriber<Value>;

// eslint-disable-next-line @typescript-eslint/naming-convention
export const Subscriber: SubscriberConstructor = class {
	/** @internal */
	readonly #observer?: Partial<Observer> | null;

	/** @internal */
	readonly #controller = new AbortController();

	/** @internal */
	readonly signal = this.#controller.signal;

	/** @internal */
	#closed = false;

	/** @internal */
	constructor(
		observerOrNext?: Partial<Observer> | ((value: unknown) => void) | null,
	) {
		if (typeof observerOrNext === 'function') {
			this.#observer = { next: observerOrNext };
		} else this.#observer = observerOrNext;

		if (this.#observer?.signal) {
			const { signal: observerSignal } = this.#observer;
			observerSignal.addEventListener('abort', () => this.#controller.abort(), {
				signal: this.signal,
			});
			if (observerSignal.aborted) this.#controller.abort();
		}
	}

	/** @internal */
	next(value: unknown): void {
		if (this.signal.aborted || this.#closed) return;
		try {
			this.#observer?.next?.(value);
		} catch (error) {
			this.error(error);
		}
	}

	/** @internal */
	error(error: unknown): void {
		if (this.signal.aborted || this.#closed) return;
		this.#closed = true;
		try {
			this.#observer?.error?.(error);
		} catch {
			// do nothing (for now)
		} finally {
			this.#controller.abort();
		}
	}

	/** @internal */
	complete(): void {
		if (this.signal.aborted || this.#closed) return;
		this.#closed = true;
		try {
			this.#observer?.complete?.();
		} catch {
			// do nothing (for now)
		} finally {
			this.#controller.abort();
		}
	}
};
