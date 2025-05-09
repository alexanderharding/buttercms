/**
 * An object interface that defines a set of callbacks for receiving notifications from a producer.
 */
export interface ConsumerObserver<Value = unknown> {
	/**
	 * Signals to the producer that it should not push any more notifications to this {@linkcode ConsumerObserver|observer}.
	 */
	readonly signal: AbortSignal;
	/**
	 * A callback that receives `next` notifications with an attached {@linkcode value}.
	 * @param value The {@linkcode value} received with the notification.
	 */
	next(value: Value): void;
	/**
	 * A callback that receives an `error` notification with the {@linkcode error} that caused the producer to stop. Mutually exclusive with {@linkcode complete}.
	 * @param error The {@linkcode error} received with the notification.
	 */
	error(error: unknown): void;
	/**
	 * A callback that receives a `complete` notification indicating the producer has finished. Mutually exclusive with {@linkcode error}.
	 */
	complete(): void;
	/**
	 * A callback invoked when this {@linkcode ConsumerObserver|observer} is no longer receiving new notifications, either after {@linkcode complete}, {@linkcode error}, or {@linkcode signal|abortion}.
	 */
	finally(): void;
}
