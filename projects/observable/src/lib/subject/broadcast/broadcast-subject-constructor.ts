import type { BroadcastSubject } from './broadcast-subject';

/**
 * Object interface for a {@linkcode BroadcastSubject} factory.
 */
export interface BroadcastSubjectConstructor {
	new (name: string): BroadcastSubject;
	new <Value>(name: string): BroadcastSubject<Value>;
	readonly prototype: BroadcastSubject;
}
