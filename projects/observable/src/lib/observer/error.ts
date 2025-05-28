import type { Complete } from './complete';
import type { Finally } from './finally';
import type { Unsubscribable } from '../subscription/unsubscribable';

/**
 * Object interface that implements the `error` {@linkcode Notification|notification}.
 */
export interface Error {
	/**
	 * The producer has encountered a problem and is notifying the consumer. This is a {@linkcode Notification|notification} that the producer
	 * will no longer send values and will {@linkcode Finally.finally|finalize}. This cannot occur after {@linkcode Complete.complete|complete}, any
	 * other {@linkcode Error.error|error}, or {@linkcode Unsubscribable.signal|unsubscription}. Logically, this also means it cannot happen after
	 * {@linkcode Finally.finally|finalization}.
	 */
	error(error: unknown): void;
}
