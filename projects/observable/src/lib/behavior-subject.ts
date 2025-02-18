import { Observer } from 'subscriber';
import { Observable } from './observable';
import { Subject } from './subject';
import { UnaryFunction } from './unary-function';
import { from } from './from';

/**
 * A variant of Subject that requires an initial value and emits its current value whenever it is subscribed to.
 */
export type BehaviorSubject<Value = unknown> = Subject<Value> &
	Readonly<{ value: Value }>;

export interface BehaviorSubjectConstructor {
	new (initialValue: unknown): BehaviorSubject;
	new <Value>(initialValue: Value): BehaviorSubject<Value>;
	readonly prototype: BehaviorSubject;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const BehaviorSubject: BehaviorSubjectConstructor = class {
	readonly [Symbol.toStringTag] = 'BehaviorSubject';

	/** @internal */
	#value: unknown;

	/** @internal */
	readonly #delegate = new Subject<unknown>();

	/** @internal */
	readonly #output = new Observable((subscriber) => {
		if (!this.signal.aborted) subscriber.next(this.#value);
		return this.#delegate.subscribe(subscriber);
	});

	constructor(initialValue: unknown) {
		this.#value = initialValue;
	}

	get value(): unknown {
		return this.#value;
	}

	get observed(): boolean {
		return this.#delegate.observed;
	}

	get signal(): AbortSignal {
		return this.#delegate.signal;
	}

	subscribe(
		observerOrNext?: Partial<Observer> | ((value: unknown) => void) | null,
	): void {
		this.#output.subscribe(observerOrNext);
	}

	abort(reason?: unknown): void {
		this.#delegate.abort(reason);
	}

	next(value: unknown): void {
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

	asObservable(): Observable {
		return from(this);
	}

	pipe(...operations: ReadonlyArray<UnaryFunction<never, never>>): Observable {
		return operations.reduce(
			(acc: never, operation) => operation(acc),
			this.asObservable(),
		);
	}
};
