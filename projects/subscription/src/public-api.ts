import { any } from 'abort-signal-interop';
import { noop } from 'rxjs';

/**
 * @internal An error thrown when one or more errors have occurred during the `unsubscribe` of a {@link Subscription}.
 */
class UnsubscribeError extends Error {
	readonly errors: Array<unknown>;
	constructor(errors: Array<unknown>) {
		super(
			errors.length
				? `${errors.length} errors occurred during unsubscribe:
  ${errors.map((_, i) => `${i + 1}) `).join('\n  ')}`
				: '',
		);
		this.errors = errors;
		this.name = 'UnsubscribeError';
	}
}

export interface Unsubscribable {
	unsubscribe(): void;
}

export type TeardownLogic =
	| Subscription
	| AbortController
	| ((reason?: unknown) => void)
	// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
	| void;

/**
 * Represents a disposable resource. A Subscription has one important method,
 * `unsubscribe`, that takes no argument and just disposes the resource held by
 * the subscription.
 *
 * Additionally, subscriptions may be grouped together through the `add`
 * method, which will attach a child Subscription to the current Subscription.
 * When a Subscription is unsubscribed, all its children (and its grandchildren)
 * will be unsubscribed as well.
 */
export interface Subscription extends AbortController {
	/**
	 * Adds a finalizer to this subscription, so that finalization will be unsubscribed/called
	 * when this subscription is unsubscribed. If this subscription is already {@link #closed},
	 * because it has already been unsubscribed, then whatever finalizer is passed to it
	 * will automatically be executed (unless the finalizer itself is also a closed subscription).
	 *
	 * Closed Subscriptions cannot be added as finalizers to any subscription. Adding a closed
	 * subscription to a any subscription will result in no operation. (A noop).
	 *
	 * Adding a subscription to itself, or adding `null` or `undefined` will not perform any
	 * operation at all. (A noop).
	 *
	 * `Subscription` instances that are added to this instance will automatically remove themselves
	 * if they are unsubscribed. Functions and {@link Unsubscribable} objects that you wish to remove
	 * will need to be removed manually with {@link #remove}
	 *
	 * @param teardown The finalization logic to add to this subscription.
	 */
	add(teardown: TeardownLogic): void;
	/**
	 * Removes a finalizer from this subscription that was previously added with the {@link #add} method.
	 *
	 * Note that `Subscription` instances, when unsubscribed, will automatically remove themselves
	 * from every other `Subscription` they have been added to. This means that using the `remove` method
	 * is not a common thing and should be used thoughtfully.
	 *
	 * If you add the same finalizer instance of a function or an unsubscribable object to a `Subscription` instance
	 * more than once, you will need to call `remove` the same number of times to remove all instances.
	 *
	 * All finalizer instances are removed to free up memory upon unsubscription.
	 *
	 * TIP: In instances you're adding and removing _Subscriptions from other Subscriptions_, you should
	 * be sure to unsubscribe or otherwise get rid of the child subscription reference as soon as you remove it.
	 * The child subscription has a reference to the parent it was added to via closure. In most cases, this
	 * a non-issue, as child subscriptions are rarely long-lived.
	 *
	 * @param teardown The finalizer to remove from this subscription
	 */
	remove(teardown: Exclude<TeardownLogic, void>): void;
}

export type SubscriptionConstructor = new (
	/**
	 * The finalizer to execute upon abort. Useful for guaranteeing a specific action upon abort.
	 */
	teardown?: TeardownLogic,
) => Subscription;

// eslint-disable-next-line @typescript-eslint/naming-convention
export const Subscription: SubscriptionConstructor = class {
	/** @internal */
	readonly #controller = new AbortController();

	/** @internal */
	readonly #cancelers = new Map<
		Exclude<TeardownLogic, void>,
		AbortController
	>();

	/** @internal */
	#teardown?: TeardownLogic;

	constructor(teardown?: TeardownLogic) {
		this.#teardown = teardown;
		if (this.#teardown && 'add' in this.#teardown) {
			this.#teardown.add(() => (this.#teardown = undefined));
		}
	}

	get signal(): AbortSignal {
		return this.#controller.signal;
	}

	abort(reason?: unknown): void {
		this.#controller.abort(reason);
	}

	add(teardown: TeardownLogic): void {
		if (!teardown || teardown === this) return;

		// Immediately abort the child if the parent is already aborted.
		if (this.signal.aborted) return finalize(teardown, this.signal.reason);

		const teardownCanceler = new AbortController();
		this.signal.addEventListener(
			'abort',
			() => finalize(teardown, this.signal.reason),
			{ signal: teardownCanceler.signal },
		);
		this.#cancelers.set(teardown, teardownCanceler);
	}

	remove(teardown: Exclude<TeardownLogic, void>): void {
		if (this.signal.aborted) return;
		this.#cancelers.get(teardown)?.abort(null);
		this.#cancelers.delete(teardown);
	}
};

function finalize(
	teardown: Exclude<TeardownLogic, void>,
	reason?: unknown,
): void {
	if (typeof teardown === 'function') teardown(reason);
	else teardown.abort(reason);
}
