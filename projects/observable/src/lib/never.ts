import { Observable } from './observable';

/**
 * An {@linkcode Observable} that does no work.
 * @example
 * Without Observer signal
 * ```ts
 * import { never } from '@xander/observable';
 *
 * never.subscribe({
 *  signal: undefined, // This property is unnecessary, but is explicitly defined for clarity
 * 	next: () => console.log('next'), // Never called
 * 	error: () => console.log('error'), // Never called
 * 	complete: () => console.log('complete'), // Never called
 * 	finally: () => console.log('finally'), // Never called
 * });
 * ```
 * @example
 * With Observer signal
 * ```ts
 * import { never } from '@xander/observable';
 *
 * const controller = new AbortController();
 *
 * controller.abort();
 *
 * never.subscribe({
 *  signal: controller.signal, // Already aborted
 * 	next: () => console.log('next'), // Never called
 * 	error: () => console.log('error'), // Never called
 * 	complete: () => console.log('complete'), // Never called
 * 	finally: () => console.log('finally'), // Called immediately
 * });
 * ```
 */
export const never: Observable<never> = new Observable();
