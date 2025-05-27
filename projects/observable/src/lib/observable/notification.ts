import { Complete } from './complete';
import { Error } from './error';
import { Finally } from './finally';
import { Next } from './next';

/**
 * The act of a `producer` pushing {@linkcode Next|nexted} values, {@linkcode Error|errors}, {@linkcode Complete|completions}, and/or
 * {@linkcode Finally|finalizations} to a `consumer` to be `observed`.
 */
export type Notification<TNext = unknown> =
	| Next<TNext>
	| Error
	| Complete
	| Finally;
