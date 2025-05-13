/**
 * An object interface that defines a set of callbacks for receiving notifications from a `producer`.
 */
export interface ConsumerObserver<Value = unknown> {
	/**
	 * Signals the `producer` that the `consumer` is no longer interested in receiving notifications.
	 */
	readonly signal: AbortSignal;
	/**
	 * The `producer` has produced a {@linkcode value}.
	 * @param value The produced {@linkcode value}.
	 */
	next(value: Value): void;
	/**
	 * The `producer` has finished due to an {@linkcode error}. This is mutually exclusive with {@linkcode complete}.
	 * @param error The {@linkcode error} that occurred.
	 */
	error(error: unknown): void;
	/**
	 * The `producer` has finished successfully. This is mutually exclusive with {@linkcode error}.
	 */
	complete(): void;
	/**
	 * The `producer` has finished because of {@linkcode error}, {@linkcode complete}, or this {@linkcode ConsumerObserver|observer} has signaled an abort.
	 */
	finally(): void;
}
