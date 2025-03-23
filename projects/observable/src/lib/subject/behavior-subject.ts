import { Observable, subscribe, type Observer } from '../observable';
import { Subject } from './subject';
import { Pipeline } from '../pipe';

/**
 * A variant of {@linkcode Subject} that requires an initial value and
 * emits its current value whenever it is subscribed to.
 *
 * @template Value - The type of values emitted by the subject.
 * @example
 * const subject = new BehaviorSubject(0);
 * subject.subscribe((value) => console.log(value)); // 0
 * subject.next(1);
 *
 * @see {@linkcode Subject}
 * @public
 */
export type BehaviorSubject<Value = unknown> = Omit<Subject<Value>, 'pipe'> &
	Readonly<{ value: Value }> &
	Pipeline<BehaviorSubject<Value>>;

export interface BehaviorSubjectConstructor {
	new <Value>(initialValue: Value): BehaviorSubject<Value>;
	readonly prototype: BehaviorSubject;
}

export const BehaviorSubject: BehaviorSubjectConstructor = class<Value> {
	/**
	 * @internal
	 * @readonly
	 * @public
	 */
	readonly [Symbol.toStringTag] = 'BehaviorSubject';

	/**
	 * @internal
	 * @readonly
	 * @public
	 */
	#value: Value;

	/**
	 * @internal
	 * @readonly
	 * @public
	 */
	readonly #delegate = new Subject<Value>();

	/**
	 * @internal
	 * @readonly
	 * @public
	 */
	readonly signal = this.#delegate.signal;

	/**
	 * @internal
	 * @readonly
	 * @public
	 */
	readonly #pipeline = new Pipeline(this);

	/**
	 * @internal
	 * @readonly
	 * @public
	 */
	readonly #output = new Observable((subscriber) => {
		if (!this.signal.aborted) subscriber.next(this.#value);
		return this.#delegate.subscribe(subscriber);
	});

	/**
	 * @internal
	 * @constructor
	 * @public
	 */
	constructor(initialValue: Value) {
		this.#value = initialValue;
	}

	/**
	 * @internal
	 * @readonly
	 * @public
	 */
	get value(): Value {
		return this.#value;
	}

	/**
	 * @internal
	 * @readonly
	 * @public
	 */
	pipe(...operations: []): this {
		return this.#pipeline.pipe(...operations);
	}

	/**
	 * @internal
	 * @readonly
	 * @public
	 */
	[subscribe](
		observerOrNext?: ((value: Value) => void) | Partial<Observer<Value>> | null,
	): void {
		this.subscribe(observerOrNext);
	}

	/**
	 * @internal
	 * @readonly
	 * @public
	 */
	subscribe(
		observerOrNext?: Partial<Observer> | ((value: unknown) => void) | null,
	): void {
		this.#output.subscribe(observerOrNext);
	}

	/**
	 * @internal
	 * @readonly
	 * @public
	 */
	next(value: Value): void {
		this.#delegate.next(
			this.signal.aborted ? this.#value : (this.#value = value),
		);
	}

	/**
	 * @internal
	 * @readonly
	 * @public
	 */
	complete(): void {
		this.#delegate.complete();
	}

	/**
	 * @internal
	 * @readonly
	 * @public
	 */
	error(error: unknown): void {
		this.#delegate.error(error);
	}

	/**
	 * @internal
	 * @readonly
	 * @public
	 */
	asObservable(): Observable {
		return this.#output;
	}
};
