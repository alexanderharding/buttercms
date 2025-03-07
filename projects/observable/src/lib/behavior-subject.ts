import { Observer } from 'subscriber';
import { Observable, subscribe } from './observable';
import { Subject } from './subject';
import { Pipeline } from './pipeline';

/**
 * A variant of Subject that requires an initial value and emits its current value whenever it is subscribed to.
 */
export type BehaviorSubject<Value = unknown> = Omit<Subject<Value>, 'pipe'> &
	Readonly<{ value: Value }> &
	Pipeline<BehaviorSubject<Value>>;

export interface BehaviorSubjectConstructor {
	new <Value>(
		initialValue: Value,
		signal?: AbortSignal,
	): BehaviorSubject<Value>;
	readonly prototype: BehaviorSubject;
}

export const BehaviorSubject: BehaviorSubjectConstructor = class<Value> {
	/** @internal */
	readonly [Symbol.toStringTag] = 'BehaviorSubject';

	/** @internal */
	#value: Value;

	/** @internal */
	readonly #delegate = new Subject<Value>();

	/** @internal */
	readonly signal = this.#delegate.signal;

	/** @internal */
	readonly #pipeline = new Pipeline(this);

	/** @internal */
	readonly #output = new Observable((subscriber) => {
		if (!this.signal.aborted) subscriber.next(this.#value);
		return this.#delegate.subscribe(subscriber);
	});

	/** @internal */
	constructor(initialValue: Value) {
		this.#value = initialValue;
	}

	/** @internal */
	get value(): Value {
		return this.#value;
	}

	/** @internal */
	pipe(...operations: []): this {
		return this.#pipeline.pipe(...operations);
	}

	/** @internal */
	[subscribe](
		observerOrNext?: ((value: Value) => void) | Partial<Observer<Value>> | null,
	): void {
		this.subscribe(observerOrNext);
	}

	/** @internal */
	subscribe(
		observerOrNext?: Partial<Observer> | ((value: unknown) => void) | null,
	): void {
		this.#output.subscribe(observerOrNext);
	}

	/** @internal */
	next(value: Value): void {
		this.#delegate.next(
			this.signal.aborted ? this.#value : (this.#value = value),
		);
	}

	/** @internal */
	complete(): void {
		this.#delegate.complete();
	}

	/** @internal */
	error(error: unknown): void {
		this.#delegate.error(error);
	}

	/** @internal */
	asObservable(): Observable {
		return this.#output;
	}
};
