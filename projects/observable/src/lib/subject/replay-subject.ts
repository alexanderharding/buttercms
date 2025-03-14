import { Observer, Subscriber } from 'subscriber';
import { Observable, subscribe } from '../observable/observable';
import { Subject } from './subject';
import { Pipeline } from '../pipe/pipeline';
// import { of } from '../of';
// import { defer } from '../defer';
// import { tap } from '../tap';
// import { from, ObservableInput, ObservedValueOf } from '../from';
// import { connectable } from '../connect';
// import { UnaryFunction } from '../unary-function';

/**
 * A variant of {@linkcode Subject} that emits a buffer of the last N values, or all values if less than N.
 */
export type ReplaySubject<Value = unknown> = Omit<Subject<Value>, 'pipe'> &
	Pipeline<ReplaySubject<Value>>;

export interface ReplaySubjectConstructor {
	new <Value>(count?: number): ReplaySubject<Value>;
	readonly prototype: ReplaySubject;
}

export const ReplaySubject: ReplaySubjectConstructor = class<Value> {
	/** @internal */
	readonly [Symbol.toStringTag] = this.constructor.name;

	/** @internal */
	readonly #count: number;

	/** @internal */
	readonly #buffer: Array<Value> = [];

	/** @internal */
	readonly #delegate = new Subject<Value>();

	/** @internal */
	readonly signal = this.#delegate.signal;

	/** @internal */
	readonly #pipeline = new Pipeline(this);

	/** @internal */
	readonly #output = new Observable((subscriber) => {
		// We use a copy here, so reentrant code does not mutate our array while we're
		// emitting it to a new subscriber.
		const copy = this.#buffer.slice();
		for (let i = 0; i < copy.length && !subscriber.signal.aborted; i++) {
			subscriber.next(copy[i]);
		}
		this.#delegate.subscribe(subscriber);
	});

	/** @internal */
	constructor(count = Infinity) {
		// Initialization
		this.#count = Math.max(1, count);

		// Teardown
		new Subscriber({
			signal: this.signal,
			// Remove all references to the buffer values on finalization
			// of this subject so they can be garbage collected.
			finalize: () => (this.#buffer.length = 0),
		});
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
		if (!this.signal.aborted) {
			this.#buffer.push(value);
			// Trim the buffer before pushing it to the value delegate so
			// reentrant code does not get pushed values than it should.
			while (this.#buffer.length > this.#count) this.#buffer.shift();
		}

		this.#delegate.next(value);
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

// let subject = new ReplaySubject<number>(1);
// const privateObservable = of(1, 2, 3);

// export const publicObservable = defer(() => subject).pipe(
// 	tap({ signal: undefined, error: reset, complete: reset }),
// );

// function reset() {
// 	subject = new ReplaySubject(1);
// }

// export function shareReplay<Input extends ObservableInput>(
// 	count?: number,
// ): UnaryFunction<Input, Observable<ObservedValueOf<Input>>> {
// 	return (input) => {
// 		let subject: ReplaySubject<ObservedValueOf<Input>>;
// 		let active = 0;

// 		return connectable(input, () => {
// 			active++;
// 			const isSetup = !!subject;
// 			if (!isSetup) setup();
// 			return subject;
// 		}).pipe(tap({ error: reset, complete: reset, finalize }));

// 		function setup() {
// 			reset();
// 		}

// 		function reset() {
// 			subject = new ReplaySubject(count);
// 			from(input).subscribe(subject);
// 		}

// 		function finalize() {
// 			if (active > 0) active--;
// 			if (active === 0) subject = new ReplaySubject(count);
// 		}
// 	};
// 	return (input: ObservableInput) => {
// 		let subject: ReplaySubject;
// 		const source = from(input);

// 		return connectable(input, () => (subject ??= new ReplaySubject(1))).pipe(
// 			tap({ error: setup, complete: setup }),
// 		);

// 		function setup() {
// 			subject = new ReplaySubject(1);
// 			source.subscribe(subject);
// 		}
// 	};
// }

// privateObservable.subscribe({
// 	...subject,
// 	// signal: undefined,
// 	error: (error) => {
// 		const stale = subject;
// 		subject = new ReplaySubject(1);
// 		stale.error(error);
// 	},
// 	complete: () => {
// 		const oldSubject = subject;
// 		subject = new ReplaySubject(1);
// 		oldSubject.complete();
// 	},
// });

// subject.subscribe(console.log);
