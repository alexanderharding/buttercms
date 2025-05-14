import { Observable, type ConsumerObserver } from '../observable';
import { Subject } from './subject';
import { Pipeline, UnaryFunction } from '../pipe';
import { InteropObservable, observable, Subscribable } from '../operators';

/**
 * A variant of {@linkcode Subject} that requires an initial value and
 * notifies new `consumers` of the {@linkcode BehaviorSubject}'s current value whenever
 * it is observed.
 * @example
 * ```ts
 * import { BehaviorSubject } from '@xander/observable';
 *
 * const subject = new BehaviorSubject(0);
 *
 * subject.subscribe((value) => console.log(value));
 *
 * subject.next(1);
 *
 * // console output:
 * // 0
 * // 1
 * ```
 */
export interface BehaviorSubject<Value = unknown>
	extends InteropObservable<Value>,
		Pipeline<BehaviorSubject<Value>> {
	/**
	 * A `String` value that is used in the creation of the string description of an object. Called by the built-in method Object.prototype.toString.
	 */
	readonly [Symbol.toStringTag]: string;
	/**
	 * Indicates that the `producer` cannot push any more notifications through this {@linkcode BehaviorSubject}.
	 */
	readonly signal: AbortSignal;
	/**
	 * Store {@linkcode value} as the current value and notify all `consumers` of this {@linkcode BehaviorSubject} that a {@linkcode value} has been produced.
	 * This has no-operation if this {@linkcode BehaviorSubject} is already {@linkcode signal|aborted}.
	 * @param value The {@linkcode value} that has been produced.
	 */
	next(value: Value): void;
	/**
	 * Abort this {@linkcode BehaviorSubject} and notify all `consumers` of this {@linkcode BehaviorSubject} that the `producer` has finished successfully.
	 * This is mutually exclusive with {@linkcode error} and has no-operation if this {@linkcode BehaviorSubject} is already {@linkcode signal|aborted}.
	 */
	complete(): void;
	/**
	 * Abort this {@linkcode BehaviorSubject} and notify all `consumers` of this {@linkcode BehaviorSubject} that the `producer` has finished because an {@linkcode error} occurred.
	 * This is mutually exclusive with {@linkcode complete} and has no-operation if this {@linkcode BehaviorSubject} is already {@linkcode signal|aborted}.
	 * @param error The {@linkcode error} that occurred.
	 */
	error(error: unknown): void;
	/**
	 * Access an {@linkcode Observable} with this {@linkcode BehaviorSubject} as the source. You can do this to create custom `producer`-side logic
	 * of this {@linkcode BehaviorSubject} and conceal it from code that uses the {@linkcode Observable}.
	 * @returns An {@linkcode Observable} that this {@linkcode BehaviorSubject} casts to.
	 */
	asObservable(): Observable<Value>;
	/**
	 * Observe notifications from this {@linkcode BehaviorSubject}.
	 * @param observerOrNext If provided, either a {@linkcode ConsumerObserver} with some or all callback methods, or the `next` handler that is called for each produced value.
	 */
	subscribe(
		observerOrNext?:
			| Partial<ConsumerObserver<Value>>
			| ((value: Value) => unknown)
			| null,
	): void;
	/**
	 * A method that returns the async iterator for this {@linkcode BehaviorSubject}. Called by the semantics of the for-await-of statement.
	 */
	[Symbol.asyncIterator](): AsyncIterableIterator<Value, void, void>;
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
	readonly #pipeline = new Pipeline(this);
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

	pipe(...operations: []): this {
		return this.#pipeline.pipe(...operations);
	}

	[observable](): Subscribable {
		return this;
	}

	[Symbol.asyncIterator](): AsyncIterableIterator<Value, void, void> {
		return this.#delegate[Symbol.asyncIterator]();
	}

	subscribe(observerOrNext: Partial<ConsumerObserver> | UnaryFunction): void {
		this.#output.subscribe(observerOrNext);
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

	asObservable(): Observable<Value> {
		return this.#output;
	}
};
