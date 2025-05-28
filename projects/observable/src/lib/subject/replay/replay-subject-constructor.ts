import type { ReplaySubject } from './replay-subject';

/**
 * Object interface for a {@linkcode ReplaySubject} factory.
 */
export interface ReplaySubjectConstructor {
	new (bufferSize?: number): ReplaySubject;
	new <Value>(bufferSize?: number): ReplaySubject<Value>;
	readonly prototype: ReplaySubject;
}
