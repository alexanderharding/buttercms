import { Complete } from './complete';
import { Error } from './error';
import { Finally } from './finally';
import { Next } from './next';

/**
 * The act of a producer pushing {@linkcode Next.next|nexted} values, {@linkcode Error.error|errors}, {@linkcode Complete.complete|completions}, and/or
 * {@linkcode Finally.finally|finalizations} to a consumer to be observed.
 */
export type Notification<Value = unknown> =
	| Next<Value>
	| Error
	| Complete
	| Finally;
