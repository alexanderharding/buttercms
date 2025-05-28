import type { Finally } from '../observer';

/**
 * Object interface that implements a `signal` property for the purpose of unsubscribing.
 */
export interface Unsubscribable {
	/**
	 * The act of a consumer telling a producer is no longer interested in receiving values. Causes {@linkcode Finally.finally|finalization}.
	 */
	readonly signal: AbortSignal;
}
