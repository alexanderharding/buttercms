import type { InteropObservable } from './interop-observable';
import type { Observable } from '../observable';
import type { Subscribable } from '../subscription';

/**
 * A method that returns the default {@linkcode Subscribable|subscribable} for an object. Called by the semantics of the {@linkcode Observable.from} method.
 * @see {@linkcode InteropObservable}
 */
export const observable = Symbol('Interop Observable');
