import type { Next } from './next';
import type { Notification } from './notification';
import type { Finally } from './finally';
import type { Error } from './error';
import type { Unsubscribable } from './unsubscribable';

/**
 * Object interface that implements the `complete` {@linkcode Notification|notification}.
 */
export interface Complete {
	/**
	 * The producer is notifying the consumer that it is done {@linkcode Next.next|nexting} values, without error, will send no more values,
	 * and it will {@linkcode Finally.finally|finalize}. {@linkcode Complete.complete|Completion} cannot occur after an {@linkcode Error.error|error},
	 * or {@linkcode Unsubscribable.signal|unsubscription}. {@linkcode Complete.complete|Complete} cannot be called twice. {@linkcode Complete.complete|Complete},
	 * if it occurs, will always happen _before_ {@linkcode Finally.finally|finalization}.
	 */
	complete(): void;
}
