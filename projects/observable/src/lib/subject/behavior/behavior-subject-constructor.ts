import type { BehaviorSubject } from './behavior-subject';

/**
 * Object interface for a {@linkcode BehaviorSubject} factory.
 */
export interface BehaviorSubjectConstructor {
	new <Value>(initialValue: Value): BehaviorSubject<Value>;
	readonly prototype: BehaviorSubject;
}
