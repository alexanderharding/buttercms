import { Subject } from './subject';
import { Observable, type ConsumerObserver } from '../observable';

/**
 * [Glossary](https://jsr.io/@xander/observable#broadcastsubject)
 * @example
 * ```ts
 * import { BroadcastSubject } from '@xander/observable';
 *
 * // Setup subjects
 * const name = 'test';
 * const subject1 = new BroadcastSubject(name);
 * const subject2 = new BroadcastSubject(name);
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
export type BroadcastSubject<Value = void> = Subject<Value>;

export interface BroadcastSubjectConstructor {
	new (name: string): BroadcastSubject;
	new <Value>(name: string): BroadcastSubject<Value>;
	readonly prototype: BroadcastSubject;
}

/**
 * A fixed UUID that is used to prefix the name of the underlying {@linkcode BroadcastChannel}. This ensures that our
 * {@linkcode BroadcastSubject} only communicate with other {@linkcode BroadcastSubject} from this library.
 */
const namePrefix = '652ff2f3-bed7-4700-8c2e-ed53efbbcf30';

export const BroadcastSubject: BroadcastSubjectConstructor = class<Value> {
	readonly name: string;
	readonly [Symbol.toStringTag] = 'BroadcastSubject';
	readonly #channel: BroadcastChannel;
	readonly #delegate = new Subject<Value>();

	constructor(name: string) {
		// Initialization
		this.#channel = new BroadcastChannel(`${namePrefix}-${(this.name = name)}`);

		// Message handling
		this.#channel.onmessage = (event) => this.#delegate.next(event.data);
		this.#channel.onmessageerror = (event) => this.error(event);

		// Teardown
		this.signal.addEventListener('abort', () => this.#channel.close(), {
			signal: this.signal,
		});
	}

	get signal(): AbortSignal {
		return this.#delegate.signal;
	}

	next(value: Value): void {
		try {
			if (!this.signal.aborted) this.#channel.postMessage(value);
		} catch (error) {
			this.error(error);
		}
	}

	error(error: unknown): void {
		this.#delegate.error(error);
	}

	complete(): void {
		this.#delegate.complete();
	}

	subscribe(
		observerOrNext?:
			| Partial<ConsumerObserver<Value>>
			| ((value: Value) => unknown)
			| null,
	): void {
		this.#delegate.subscribe(observerOrNext!);
	}

	asObservable(): Observable<Value> {
		return this.#delegate.asObservable();
	}
};
