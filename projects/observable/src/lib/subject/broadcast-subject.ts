import { Subject } from './subject';
import { Observable, type Observer } from '../observable';
import { Pipeline, type UnaryFunction } from '../pipe';
import { subscribe } from '../operators';

/**
 * A wrapper around the {@linkcode BroadcastChannel} object provided by the browser.
 *
 * When a {@linkcode BroadcastSubject} is created, it establishes a new {@linkcode BroadcastChannel} connection
 * with the specified name. Any messages posted to this channel by other {@linkcode BroadcastChannel} objects
 * will be emitted as values in the stream.
 *
 * If at any point there is an error in message processing or posting, the stream will error with
 * whatever the {@linkcode BroadcastChannel} API has thrown. Note that these errors will close the underlying
 * channel - subscribers will need to create a new instance to continue receiving messages.
 *
 * By virtue of being a {@linkcode Subject}, {@linkcode BroadcastSubject} allows for both sending and receiving
 * messages. To send a message to other {@linkcode BroadcastChannel} objects, use the `next` method. The value passed
 * to `next` must be {@linkcode structuredClone|cloneable} - if it's not, subscribers to the current {@linkcode BroadcastSubject}
 * will receive an error. The `complete` and `error` methods both close the underlying channel so it can no longer
 * send or receive messages.
 *
 * @template Value - The type of values that can be sent/received through the channel.
 * @example
 * // Create a broadcast subject to communicate between tabs
 * const subject = new BroadcastSubject('my-channel');
 *
 * // Send messages to other tabs
 * subject.next('Hello from tab 1!');
 *
 * // Receive messages from other tabs
 * subject.subscribe(message => console.log('Received:', message));
 *
 * @see {@link BroadcastChannel}
 * @public
 */
export interface BroadcastSubject<Value = void>
	extends Omit<Subject<Value>, 'pipe'>,
		Pipeline<BroadcastSubject<Value>> {
	/**
	 * The name of the underlying {@linkcode BroadcastChannel}.
	 * @see {@linkcode BroadcastChannel.name}
	 * @readonly
	 * @public
	 */
	readonly name: string;
}

/**
 * Constructs a new {@linkcode BroadcastSubject} instance.
 * @param name The name of the underlying {@linkcode BroadcastChannel}.
 * @constructor
 * @public
 */
export interface BroadcastSubjectConstructor {
	new <Value>(name: string): BroadcastSubject<Value>;
	readonly prototype: BroadcastSubject;
}

export const BroadcastSubject: BroadcastSubjectConstructor = class {
	/**
	 * @internal
	 * @readonly
	 * @public
	 */
	readonly [Symbol.toStringTag] = this.constructor.name;

	/**
	 * @internal
	 * @readonly
	 * @private
	 */
	readonly #channel: BroadcastChannel;

	/**
	 * @internal
	 * @readonly
	 * @private
	 */
	readonly #delegate = new Subject<unknown>();

	/**
	 * @internal
	 * @readonly
	 * @private
	 */
	readonly #pipeline = new Pipeline(this);

	/**
	 * @internal
	 * @constructor
	 * @public
	 */
	constructor(name: string) {
		// Initialization
		this.#channel = new BroadcastChannel(name);

		// Message handling
		this.#channel.onmessage = (event) => this.#delegate.next(event.data);
		this.#channel.onmessageerror = (event) => this.error(event);

		// Teardown
		this.signal.addEventListener('abort', () => this.#channel.close(), {
			signal: this.signal,
		});
	}

	/**
	 * @internal
	 * @readonly
	 * @public
	 */
	get name(): string {
		return this.#channel.name;
	}

	/**
	 * @internal
	 * @readonly
	 * @public
	 */
	get signal(): AbortSignal {
		return this.#delegate.signal;
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
	[subscribe](observerOrNext?: Partial<Observer> | UnaryFunction | null): void {
		this.asObservable().subscribe(observerOrNext);
	}

	/**
	 * @internal
	 * @readonly
	 * @public
	 */
	subscribe(observerOrNext: Partial<Observer> | UnaryFunction): void {
		this.#delegate.subscribe(observerOrNext);
	}

	/**
	 * @internal
	 * @readonly
	 * @public
	 */
	next(value: unknown): void {
		if (!this.signal.aborted) this.#channel.postMessage(value);
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
	complete(): void {
		this.#delegate.complete();
	}

	/**
	 * @internal
	 * @readonly
	 * @public
	 */
	asObservable(): Observable {
		return this.#delegate.asObservable();
	}
};
