import { any } from 'abort-signal-interop';

/**
 * An object interface that defines a set of callback functions a user can use to get
 * notified of any set of {@link Subscriber} events.
 */
export interface Observer<Value = unknown> {
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

/**
 * Is both an {@linkcode Observer} and an {@linkcode AbortController}.
 */
export type Subscriber<Value = unknown> = Observer<Value> & AbortController;
export type SubscriberConstructor = new <Value = unknown>(
	observerOrNext?: Partial<Observer> | ((value: unknown) => void) | null,
) => Subscriber<Value>;

// eslint-disable-next-line @typescript-eslint/naming-convention
export const Subscriber: SubscriberConstructor = class {
	readonly #observer?: Partial<Observer> | null;
	readonly #controller = new AbortController();
	readonly signal = this.#controller.signal;

	constructor(
		observerOrNext?: Partial<Observer> | ((value: unknown) => void) | null,
	) {
		if (typeof observerOrNext === 'function') {
			this.#observer = { next: observerOrNext };
		} else this.#observer = observerOrNext;

		if (this.#observer && 'signal' in this.#observer && this.#observer.signal) {
			const { signal: observerSignal } = this.#observer;
			observerSignal.addEventListener(
				'abort',
				() => this.#controller.abort(observerSignal.reason),
				{ signal: this.#controller.signal },
			);
			if (observerSignal.aborted) this.#controller.abort(observerSignal.reason);
		}
	}

	abort(reason?: unknown): void {
		this.#controller.abort(reason);
	}

	next(value: unknown): void {
		if (this.#observer?.signal?.aborted) return;
		try {
			this.#observer?.next?.(value);
		} catch (error) {
			this.error(error);
		}
	}

	error(error: unknown): void {
		if (this.#observer?.signal?.aborted) return;
		try {
			this.#observer?.error?.(error);
		} catch {
			// do nothing (for now)
		}
	}

	complete(): void {
		if (this.#observer?.signal?.aborted) return;
		try {
			this.#observer?.complete?.();
		} catch {
			// do nothing (for now)
		}
	}
};

function isAbortControllerLike(value: unknown): value is AbortControllerLike {
	return (
		!!value &&
		typeof value === 'object' &&
		'signal' in value &&
		isAbortSignalLike(value.signal)
	);
}

interface AbortSignalLike {
	readonly aborted: boolean;
	readonly reason?: unknown;
	addEventListener(
		type: 'abort',
		listener: (event: Event) => void,
		options: { signal: AbortSignalLike },
	): void;
}

interface AbortControllerLike {
	readonly signal: AbortSignalLike;
}

function isAbortSignalLike(value: unknown): value is AbortSignalLike {
	return (
		!!value &&
		typeof value === 'object' &&
		'reason' in value &&
		'aborted' in value &&
		typeof value.aborted === 'boolean' &&
		'addEventListener' in value &&
		typeof value.addEventListener === 'function'
	);
}
