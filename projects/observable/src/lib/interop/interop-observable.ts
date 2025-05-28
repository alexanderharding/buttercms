import { Subscribable } from '../observable';
import { observable } from './observable';
import { Observable } from '../observable';

/**
 * Object interface that implements the {@linkcode observable} method.
 */
export interface InteropObservable<Value = unknown> {
	/**
	 * @returns The default {@linkcode Subscribable|subscribable} for an object. Called by the semantics of the {@linkcode Observable.from} method.
	 */
	[observable](): Subscribable<Value>;
}
