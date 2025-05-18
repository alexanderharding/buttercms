import { Observable } from './observable';

/**
 * An {@linkcode Observable} that completes immediately on `subscribe`.
 *
 * You can prevent the `complete` notification from being pushed if you
 * provide an already aborted {@linkcode AbortSignal|signal} to the `ConsumerObserver`.
 * For most use-cases this is not useful, but good to know. This is unnecessary to
 * prevent memory leaks, since the {@linkcode Observable} _never_ does any work.
 * Regardless of the state of the {@linkcode AbortSignal|signal}, the `finally`
 * notification will still be pushed.
 *
 * @example
 * Without ConsumerObserver signal
 * ```ts
 * import { empty } from '@xander/observable';
 *
 * empty.subscribe({
 *  signal: undefined, // This property is unnecessary, but is explicitly defined for clarity
 * 	next: () => console.log('next'), // Never called
 * 	error: () => console.log('error'), // Never called
 * 	complete: () => console.log('complete'), // Called immediately
 * 	finally: () => console.log('finally'), // Called after complete
 * });
 * ```
 * @example
 * With ConsumerObserver signal
 * ```ts
 * import { empty } from '@xander/observable';
 *
 * const controller = new AbortController();
 *
 * controller.abort();
 *
 * empty.subscribe({
 *  signal: controller.signal, // Already aborted
 * 	next: () => console.log('next'), // Never called
 * 	error: () => console.log('error'), // Never called
 * 	complete: () => console.log('complete'), // Never called
 * 	finally: () => console.log('finally'), // Called immediately
 * });
 * ```
 */
export const empty: Observable<never> = new Observable((observer) =>
	observer.complete(),
);
