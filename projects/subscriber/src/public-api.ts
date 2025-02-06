import { Subscription, TeardownLogic } from 'subscription';

/**
 * An object interface that defines a set of callback functions a user can use to get
 * notified of any set of {@link Subscriber} events.
 */
export interface Observer<Value = unknown> {
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
 * Is both an {@linkcode Observer} and a {@linkcode Subscription}.
 */
export type Subscriber<Value = unknown> = Subscription & Observer<Value>;

export type SubscriberConstructor = new <Value = unknown>(
	observerOrNext?: Partial<Observer> | ((value: unknown) => void) | null,
) => Subscriber<Value>;

// eslint-disable-next-line @typescript-eslint/naming-convention
export const Subscriber: SubscriberConstructor = class {
	readonly #observer?: Partial<Observer> | null;
	readonly #subscription = new Subscription();

	constructor(
		observerOrNext?: Partial<Observer> | ((value: unknown) => void) | null,
	) {
		if (typeof observerOrNext === 'function') {
			this.#observer = { next: observerOrNext };
		} else this.#observer = observerOrNext;

		// Automatically chain subscriptions together here.
		if (observerOrNext instanceof Subscriber) observerOrNext.add(this);
		if (observerOrNext instanceof Subscription) observerOrNext.add(this);
	}

	get closed(): boolean {
		return this.#subscription.closed;
	}

	next(value: unknown): void {
		try {
			this.#observer?.next?.(value);
		} catch (error) {
			console.error(error);
		}
	}

	complete(): void {
		try {
			this.#observer?.complete?.();
		} finally {
			this.unsubscribe();
		}
	}

	error(error: unknown): void {
		try {
			this.#observer?.error?.(error);
		} finally {
			this.unsubscribe();
		}
	}

	add(teardown: TeardownLogic): void {
		this.#subscription.add(teardown);
	}

	remove(teardown: Exclude<TeardownLogic, void>): void {
		this.#subscription.remove(teardown);
	}

	unsubscribe(): void {
		this.#subscription.unsubscribe();
	}
};
