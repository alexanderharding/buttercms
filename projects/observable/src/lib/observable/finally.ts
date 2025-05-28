import type { Complete } from './complete';
import type { Error } from './error';
import type { Unsubscribable } from './unsubscribable';
import type { Next } from './next';
import type { Notification } from './notification';

/**
 * Object interface that implements the `finally` {@linkcode Notification|notification}.
 */
export interface Finally {
	/**
	 * The producer is notifying the consumer that it is done {@linkcode Next.next|nexting} values, for any reason and will send no more values.
	 * {@linkcode Finally.finally|Finally}, if it occurs, will always happen as a side-effect _after_ {@linkcode Complete.complete|complete},
	 * {@linkcode Error.error|error}, or {@linkcode Unsubscribable.signal|unsubscribe}.
	 */
	finally(): void;
}
