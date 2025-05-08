import { Observable } from './observable';

/**
 * An {@linkcode Observable} that completes immediately on `subscribe` without
 * emitting any errors or values.
 *
 * You can prevent the `complete` notification from being pushed if you
 * provide an already aborted {@linkcode AbortSignal|signal} to the `Observer`.
 * For most use-cases this is not useful, but good to know. This is unnecessary to
 * prevent memory leaks, since the {@linkcode Observable} _never_ does any work.
 * Regardless of the state of the {@linkcode AbortSignal|signal}, the `finally`
 * notification will still be pushed.
 *
 * ```ts
 * // Without Observer signal
 * import { empty } from '@xander/observable';
 *
 * empty.subscribe({
 *  signal: undefined, // This property is unnecessary, but is explicitly defined for clarity
 * 	next: () => console.log('Next'), // Never called
 * 	error: () => console.log('Error'), // Never called
 * 	complete: () => console.log('Complete'), // Called immediately
 * 	finally: () => console.log('finally'), // Called after complete
 * });
 * ```
 * ```ts
 * // With Observer signal
 * import { empty } from '@xander/observable';
 *
 * const controller = new AbortController();
 *
 * controller.abort();
 *
 * empty.subscribe({
 *  signal: controller.signal,
 * 	next: () => console.log('Next'), // Never called
 * 	error: () => console.log('Error'), // Never called
 * 	complete: () => console.log('Complete'), // Never called
 * 	finally: () => console.log('finally'), // Called immediately
 * });
 * ```
 * @see {@linkcode Observable}
 * @constant
 * @public
 */
export const empty: Observable<never> = new Observable((dispatcher) =>
	dispatcher.complete(),
);
