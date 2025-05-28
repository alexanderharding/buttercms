import type { Subject } from './subject';

/**
 * Object interface for a {@linkcode Subject} factory.
 */
export interface SubjectConstructor {
	new (): Subject;
	new <Value>(): Subject<Value>;
	readonly prototype: Subject;
}
