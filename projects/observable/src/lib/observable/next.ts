import type { Complete } from './complete';
import type { Error } from './error';
import type { Unsubscribable } from './unsubscribable';
import type { Subscribable } from './subscribable';
import type { Finally } from './finally';
import type { Observer } from './observer';
import type { Notification } from './notification';

/**
 * Object interface that implements the `next` {@linkcode Notification|notification}.
 */
export interface Next<Value = unknown> {
	/**
	 * A {@linkcode value} has been pushed to the consumer to be {@linkcode Observer|observed}. Will only happen during {@linkcode Subscribable.subscribe|subscription},
	 * and cannot happen after {@linkcode Error.error|error}, {@linkcode Complete.complete|complete}, or {@linkcode Unsubscribable.signal|unsubscription}.
	 * Logically, this also means it cannot happen after {@linkcode Finally.finally|finalization}.
	 */
	next(value: Value): void;
}
