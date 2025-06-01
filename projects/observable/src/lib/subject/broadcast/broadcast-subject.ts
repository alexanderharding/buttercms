import type { Observer } from '../../observer';
import { observable } from '../../interop';
import { Observable } from '../../observable';
import { Subject } from '../../subject';
import type { BroadcastSubjectConstructor } from './broadcast-subject-constructor';

/**
 * A variant of {@linkcode Subject}. When values are {@linkcode BroadcastSubject.next|nexted}, they are {@linkcode structuredClone|structured cloned} and sent only
 * to consumers of _other_ {@linkcode BroadcastSubject|subject} instances with the same `name` even if they are in different browsing contexts
 * (e.g. browser tabs). Logically, consumers of the {@linkcode BroadcastSubject|subject} do not receive it's _own_ {@linkcode BroadcastSubject.next|nexted} values.
 */
export interface BroadcastSubject<Value = unknown> extends Subject<Value> {
	/**
	 * The name of this {@linkcode BroadcastSubject|subject}.
	 */
	readonly name: string;
}

/**
 * A fixed UUID that is used to prefix the name of the underlying {@linkcode BroadcastChannel}. This ensures that our
 * {@linkcode BroadcastSubject}'s only communicate with other {@linkcode BroadcastSubject}'s from this library.
 */
const namePrefix = '652ff2f3-bed7-4700-8c2e-ed53efbbcf30';

/**
 * @example
 * ```ts
 * import { BroadcastSubject } from '@xander/observable';
 *
 * // Setup subjects
 * const name = 'test';
 * const subject1 = new BroadcastSubject<number>(name);
 * const subject2 = new BroadcastSubject<number>(name);
 *
 * // Subscribe to subjects
 * subject1.subscribe((value) => console.log('subject1 received', value, 'from subject1'));
 * subject2.subscribe((value) => console.log('subject2 received', value, 'from subject2'));
 *
 * subject1.next(1); // subject2 received 1 from subject1
 * subject2.next(2); // subject1 received 2 from subject2
 * subject2.complete(); // subject1 received 2 from subject2
 * subject1.next(3); // No console output since subject2 is already completed
 * ```
 */
export const BroadcastSubject: BroadcastSubjectConstructor = class {
	readonly name: string;
	readonly [Symbol.toStringTag] = 'BroadcastSubject';
	readonly #channel: BroadcastChannel;
	readonly #delegate = new Subject();

	constructor(name: string) {
		// Initialization
		this.#channel = new BroadcastChannel(`${namePrefix}-${(this.name = name)}`);

		// Message handling
		this.#channel.onmessage = ({ data: value }) => this.#delegate.next(value);
		this.#channel.onmessageerror = (error) => this.error(error);
	}

	get signal(): AbortSignal {
		return this.#delegate.signal;
	}

	[observable](): Observable {
		return Observable.from(this.#delegate);
	}

	next(value: unknown): void {
		try {
			if (!this.signal.aborted) this.#channel.postMessage(value);
		} catch (error) {
			this.error(error);
		}
	}

	error(error: unknown): void {
		this.#channel.close();
		this.#delegate.error(error);
	}

	complete(): void {
		this.#channel.close();
		this.#delegate.complete();
	}

	subscribe(
		observerOrNext?: Partial<Observer> | ((value: unknown) => unknown) | null,
	): void {
		this.#delegate.subscribe(observerOrNext);
	}
};
