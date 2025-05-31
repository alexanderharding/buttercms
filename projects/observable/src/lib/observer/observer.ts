/**
 * The manifestation of a consumer. A type that has handlers for each type of notification
 * ({@linkcode Observer.next|next}, {@linkcode Observer.error|error}, {@linkcode Observer.complete|complete},
 * and {@linkcode Observer.finally|finally}).
 */
export interface Observer<Value = unknown> {
	/**
	 * The act of a consumer telling a producer it's no longer interested in receiving values. Causes {@linkcode Observer.finally|finalization}.
	 */
	readonly signal: AbortSignal;
	/**
	 * A {@linkcode value} has been pushed to the consumer to be {@linkcode Observer|observed}. Will only happen during subscription,
	 * and cannot happen after {@linkcode Observer.error|error}, {@linkcode Observer.complete|complete}, or {@linkcode Observer.signal|unsubscription}.
	 * Logically, this also means it cannot happen after {@linkcode Observer.finally|finalization}.
	 */
	next(value: Value): void;
	/**
	 * The producer has encountered a problem and is notifying the consumer. This is a notification that the producer
	 * will no longer send values and will {@linkcode Observer.finally|finalize}. This cannot occur after {@linkcode Observer.complete|complete}, any
	 * other {@linkcode Observer.error|error}, or {@linkcode Observer.signal|unsubscription}. Logically, this also means it cannot happen after
	 * {@linkcode Observer.finally|finalization}.
	 */
	error(error: unknown): void;
	/**
	 * The producer is notifying the consumer that it is done {@linkcode Observer.next|nexting} values, without error, will send no more values,
	 * and it will {@linkcode Observer.finally|finalize}. {@linkcode Observer.complete|Completion} cannot occur after an {@linkcode Observer.error|error},
	 * or {@linkcode Observer.signal|unsubscription}. {@linkcode Observer.complete|Complete} cannot be called twice. {@linkcode Observer.complete|Complete},
	 * if it occurs, will always happen _before_ {@linkcode Observer.finally|finalization}.
	 */
	complete(): void;
	/**
	 * The producer is notifying the consumer that it is done {@linkcode Observer.next|nexting} values, for any reason and will send no more values.
	 * {@linkcode Observer.finally|Finally}, if it occurs, will always happen as a side-effect _after_ {@linkcode Observer.complete|complete},
	 * {@linkcode Observer.error|error}, or {@linkcode Observer.signal|unsubscribe}.
	 */
	finally(): void;
}
