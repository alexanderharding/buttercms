import { Observable, type ConsumerObserver } from '../observable';
import { Subject } from './subject';

/**
 * [Glossary](https://jsr.io/@xander/observable#behaviorsubject)
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
export interface BehaviorSubject<Value = unknown> extends Subject<Value> {
	readonly value: Value;
}

export interface BehaviorSubjectConstructor {
	new <Value>(initialValue: Value): BehaviorSubject<Value>;
	readonly prototype: BehaviorSubject;
}

export const BehaviorSubject: BehaviorSubjectConstructor = class<Value> {
	readonly [Symbol.toStringTag] = 'BehaviorSubject';
	#value: Value;
	readonly #delegate = new Subject<Value>();
	readonly signal = this.#delegate.signal;
	readonly #output = new Observable<Value>((observer) => {
		if (!this.signal.aborted) observer.next(this.#value);
		this.#delegate.subscribe(observer);
	});

	/**
	 * @internal
	 * @constructor
	 * @public
	 */
	constructor(initialValue: Value) {
		this.#value = initialValue;
	}

	get value(): Value {
		return this.#value;
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
			| Partial<ConsumerObserver<Value>>
			| ((value: Value) => unknown)
			| null,
	): void {
		this.#output.subscribe(observerOrNext);
	}

	asObservable(): Observable<Value> {
		return this.#output;
	}
};
