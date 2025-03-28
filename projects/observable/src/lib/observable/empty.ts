import { Observable } from './observable';

/**
 * An {@linkcode Observable} that completes immediately on `subscribe` without
 * emitting any errors or values.
 *
 * You can prevent the `complete` notification from being pushed if you
 * provide an already aborted {@linkcode AbortSignal|signal} to the `Observer`.
 * For most use-cases this is not useful, but good to know. This is unnecessary to
 * prevent memory leaks, since the {@linkcode Observable} _never_ does any work.
 * Regardless of the state of the {@linkcode AbortSignal|signal}, the `finalize`
 * notification will still be pushed.
 *
 * @example <caption>Without Observer signal</caption>
 * import { empty } from 'observable';
 *
 * empty.subscribe({
 *  signal: undefined, // This property is unnecessary, but is explicitly defined for clarity
 * 	next: () => console.log('Next'), // Never called
 * 	error: () => console.log('Error'), // Never called
 * 	complete: () => console.log('Complete'), // Called immediately
 * 	finalize: () => console.log('Finalize'), // Called after complete
 * });
 * @example <caption>With Observer signal</caption>
 * import { empty } from 'observable';
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
 * 	finalize: () => console.log('Finalize'), // Called immediately
 * });
 * @see {@linkcode Observable}
 * @constant
 * @public
 */
export const empty = new Observable<never>((subscriber) =>
	subscriber.complete(),
);
