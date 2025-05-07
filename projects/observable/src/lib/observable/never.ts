import { Observable } from './observable';

/**
 * An {@linkcode Observable} that does no work so it _never_ pushes any `next`, `error`, or `complete` notifications.
 *
 * Like any other {@linkcode Observable}, you can get it to push the `finally`
 * notification by providing an {@linkcode AbortSignal|signal} to the Observer and
 * aborting it before or after `subscribe`. For most use-cases this is not
 * useful, but good to know. Keep in mind that this is unnecessary to prevent
 * memory leaks, since the {@linkcode Observable} _never_ does any work.
 *
 * @example <caption>Without Observer signal</caption>
 *
 * import { never } from '@xander/observable';
 *
 * never.subscribe({
 *  signal: undefined, // This property is unnecessary, but is explicitly defined for clarity
 * 	next: () => console.log('Next'), // Never called
 * 	error: () => console.log('Error'), // Never called
 * 	complete: () => console.log('Complete'), // Never called
 * 	finally: () => console.log('finally'), // Never called
 * });
 * @example <caption>With Observer signal</caption>
 *
 * import { never } from '@xander/observable';
 *
 * const controller = new AbortController();
 *
 * controller.abort();
 *
 * never.subscribe({
 *  signal: controller.signal, // Already aborted
 * 	next: () => console.log('Next'), // Never called
 * 	error: () => console.log('Error'), // Never called
 * 	complete: () => console.log('Complete'), // Never called
 * 	finally: () => console.log('finally'), // Called immediately
 * });
 * @see {@linkcode Observable}
 * @constant
 * @public
 */
export const never: Observable<never> = new Observable();
