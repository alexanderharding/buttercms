import { Subject } from './subject';
import { Observable, type ConsumerObserver } from '../observable';
import { Pipeline } from '../pipe';
import { observable, Subscribable, InteropObservable } from '../operators';

/**
 * A variant of {@linkcode Subject} where when values are produced, they are {@linkcode structuredClone|structured cloned} and
 * sent only to `consumers` of _other_ {@linkcode BroadcastSubject}'s with the same name, including those defined in
 * different browsing contexts (e.g. other browser tabs).
 * ```ts
 * import { BroadcastSubject } from '@xander/observable';
 *
 * const subject1 = new BroadcastSubject('test');
 * const subject2 = new BroadcastSubject('test');
 *
 * subject1.subscribe((value) => console.log('first', value));
 * subject2.subscribe((value) => console.log('second', value));
 *
 * subject1.next(1);
 * subject2.next(2);
 *
 * // console output:
 * // first: 1
 * // second: 2
 * ```
 */
export interface BroadcastSubject<Value = void>
	extends InteropObservable<Value>,
		Pipeline<BroadcastSubject<Value>> {
	/**
	 * The provided name of this {@linkcode BroadcastSubject}.
	 */
	readonly name: string;
	/**
	 * Indicates that the `producer` cannot push any more notifications through this {@linkcode BroadcastSubject}.
	 */
	readonly signal: AbortSignal;
	/**
	 * A `String` value that is used in the creation of the string description of this {@linkcode BroadcastSubject}. Called by the built-in method Object.prototype.toString.
	 */
	readonly [Symbol.toStringTag]: string;
	/**
	 * Notify all `consumers` of _other_ {@linkcode BroadcastSubject}'s of the same `name` that a {@linkcode structuredClone|structured clone} of
	 * {@linkcode value} has been produced, even if the {@linkcode BroadcastSubject}'s are defined in another browsing context (ie. another browser tab).
	 * This has no-operation if this {@linkcode BroadcastSubject} is already {@linkcode signal|aborted}.
	 * @param value The {@linkcode value} that has been produced which will be {@linkcode structuredClone|structured cloned}.
	 */
	next(value: Value): void;
	/**
	 * Abort _this_ {@linkcode BroadcastSubject} and notify all `consumers` of _this_ {@linkcode BroadcastSubject} that the `producer`
	 * has finished successfully. This is mutually exclusive with {@linkcode error}. This has no-operation if this {@linkcode BroadcastSubject} is already
	 * {@linkcode signal|aborted}.
	 */
	complete(): void;
	/**
	 * Abort _this_ {@linkcode BroadcastSubject} and notify all `consumers` of _this_ {@linkcode BroadcastSubject} that the `producer`
	 * has finished because an {@linkcode error} occurred. This is mutually exclusive with {@linkcode complete}. This has no-operation if this {@linkcode BroadcastSubject} is already
	 * {@linkcode signal|aborted}.
	 * @param error The {@linkcode error} that occurred.
	 */
	error(error: unknown): void;
	/**
	 * Access an {@linkcode Observable} with this {@linkcode BroadcastSubject} as the source. You can do this to create custom
	 * `producer`-side logic of this {@linkcode BroadcastSubject} and conceal it from code that uses the {@linkcode Observable}.
	 * @returns An {@linkcode Observable} that this {@linkcode BroadcastSubject} casts to.
	 */
	asObservable(): Observable<Value>;
	/**
	 * Observe any notifications from _this_ {@linkcode BroadcastSubject} except for `next`, which is only received from
	 * _other_ {@linkcode BroadcastSubject|subjects} of the same name, even if they are defined in another browsing context (ie. another browser tab).
	 * @param observerOrNext If provided, either a {@linkcode ConsumerObserver} with some or all callback methods, or the `next` handler that is called for each produced value.
	 */
	subscribe(
		observerOrNext?:
			| Partial<ConsumerObserver<Value>>
			| ((value: Value) => unknown)
			| null,
	): void;
	/**
	 * A method that returns the async iterator for an this {@linkcode BroadcastSubject}. Called by the semantics of the for-await-of statement.
	 */
	[Symbol.asyncIterator](): AsyncIterableIterator<Value, void, void>;
}

export interface BroadcastSubjectConstructor {
	new (name: string): BroadcastSubject;
	new <Value>(name: string): BroadcastSubject<Value>;
	readonly prototype: BroadcastSubject;
}

/**
 * A fixed UUID that is used to prefix the name of the underlying {@linkcode BroadcastChannel}. This ensures that our
 * {@linkcode BroadcastSubject|subjects} only communicate with other {@linkcode BroadcastSubject|subjects} from this library.
 */
const namePrefix = '652ff2f3-bed7-4700-8c2e-ed53efbbcf30';

export const BroadcastSubject: BroadcastSubjectConstructor = class<Value> {
	readonly name: string;
	readonly [Symbol.toStringTag] = 'BroadcastSubject';
	readonly #channel: BroadcastChannel;
	readonly #delegate = new Subject<Value>();
	readonly #pipeline = new Pipeline(this);

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

	pipe(...operations: []): this {
		return this.#pipeline.pipe(...operations);
	}

	[observable](): Subscribable<Value> {
		return this;
	}

	[Symbol.asyncIterator](): AsyncIterableIterator<Value, void, void> {
		return this.#delegate[Symbol.asyncIterator]();
	}

	subscribe(
		observerOrNext?:
			| Partial<ConsumerObserver<Value>>
			| ((value: Value) => unknown)
			| null,
	): void {
		this.#delegate.subscribe(observerOrNext!);
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

	asObservable(): Observable<Value> {
		return this.#delegate.asObservable();
	}
};
