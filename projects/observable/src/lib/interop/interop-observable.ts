import { Subscribable } from '../observable';
import { observable } from './observable';

export interface InteropObservable<Value = unknown> {
	[observable](): Subscribable<Value>;
}
