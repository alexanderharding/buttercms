import { Subject } from '../subject';
import {
	type Subscribable,
	type Next,
	type Error,
	type Complete,
	type Notification,
	Observable,
	type Observer,
	observable,
} from '../../observable';
import type { BehaviorSubjectConstructor } from './behavior-subject-constructor';

/**
 * A variant of {@linkcode Subject} that requires an initial value and notifies new consumers of its current value upon {@linkcode Subscribable.subscribe|subscription}.
 * When a new value is {@linkcode Next.next|nexted}, it is stored as the current value and pushed to all existing consumers. Any new consumers that
 * {@linkcode Subscribable.subscribe|subscribe} after values have been {@linkcode Next.next|nexted} will immediately receive the most recent value, followed by any
 * subsequent values. If the {@linkcode BehaviorSubject|subject} has terminated with an {@linkcode Error.error|error}, late subscribers will receive the last value
 * followed by the {@linkcode Error.error|error} {@linkcode Notification|notification}. If the {@linkcode BehaviorSubject|subject} has {@linkcode Complete.complete|completed},
 * late subscribers will receive the last value followed by the {@linkcode Complete.complete|complete} {@linkcode Notification|notification}.
 */
export interface BehaviorSubject<Value = unknown> extends Subject<Value> {
	readonly value: Value;
}

/**
 * @example
 * ```ts
 * import { BehaviorSubject } from '@xander/observable';
 *
 * const subject = new BehaviorSubject(0);
 *
 * subject.subscribe((value) => console.log(value));
 *
 * // console output:
 * // 0
 *
 * subject.next(1);
 *
 * // console output:
 * // 1
 * ```
 */
export const BehaviorSubject: BehaviorSubjectConstructor = class<Value> {
	readonly [Symbol.toStringTag] = 'BehaviorSubject';
	#value: Value;
	readonly #delegate = new Subject<Value>();
	readonly signal = this.#delegate.signal;
	readonly #output = new Observable<Value>((observer) => {
		observer.next(this.#value);
		this.#delegate.subscribe(observer);
	});

	constructor(initialValue: Value) {
		this.#value = initialValue;
	}

	get value(): Value {
		return this.#value;
	}

	[observable](): Observable<Value> {
		return this.#output;
	}

	next(value: Value): void {
		this.#delegate.next(
			this.signal.aborted ? this.#value : (this.#value = value),
		);
	}

	complete(): void {
		this.#delegate.complete();
	}

	error(error: unknown): void {
		this.#delegate.error(error);
	}

	subscribe(
		observerOrNext?:
			| Partial<Observer<Value>>
			| ((value: Value) => unknown)
			| null,
	): void {
		this.#output.subscribe(observerOrNext);
	}
};
