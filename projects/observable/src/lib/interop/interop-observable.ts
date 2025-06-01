import { observable } from './observable';
import type { Subscribable } from '../subscription';

/**
 * Object interface that implements the {@linkcode observable} method.
 */
export interface InteropObservable<Value = unknown> {
	/**
	 * @returns The default `Subscribable` for an object. Called by the semantics of the `Observable.from` method.
	 */
	[observable](): Subscribable<Value>;
}
