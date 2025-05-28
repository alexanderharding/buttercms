import { Observable } from './observable';
import { Complete } from './complete';
import { Finally } from './finally';
import { Observer } from './observer';
import { Notification } from './notification';

/**
 * An {@linkcode Observable} that completes immediately on {@linkcode Observable.subscribe|subscribe}.
 *
 * You can prevent the {@linkcode Complete.complete|complete} {@linkcode Notification|notification} from being pushed if you
 * provide an already aborted {@linkcode AbortSignal|signal} to the {@linkcode Observer|observer}.
 * For most use-cases this is not useful, but good to know. This is unnecessary to
 * prevent memory leaks, since the {@linkcode Observable} _never_ does any work.
 * Regardless of the state of the {@linkcode AbortSignal|signal}, the {@linkcode Finally.finally|finally}
 * {@linkcode Notification|notification} will still be pushed.
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
