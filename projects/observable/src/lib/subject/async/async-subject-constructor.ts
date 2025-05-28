import type { AsyncSubject } from './async-subject';

/**
 * Object interface for an {@linkcode AsyncSubject} factory.
 */
export interface AsyncSubjectConstructor {
	new (): AsyncSubject;
	new <Value>(): AsyncSubject<Value>;
	readonly prototype: AsyncSubject;
}
