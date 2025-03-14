import { Subject } from './subject';
import { Observable, subscribe } from '../observable/observable';
import { Observer, Subscriber } from 'subscriber';
import { Pipeline } from '../pipe/pipeline';
import { fromEvent } from '../observable/from-event';
import { noop } from '../noop';

/**
 * Wrapper around the {@linkcode BroadcastChannel} object provided by the browser.

 *
 * <span class="informal">{@linkcode Subject} that communicates with other {@linkcode BroadcastChannel} objects</span>
 *
 * {@linkcode BroadcastSubject} constructs an object that can be used to communicate with other
 * {@linkcode BroadcastChannel} objects (which may be in other windows, tabs, workers, or iframes) under the
 * same origin. {@linkcode BroadcastSubject} accepts a string with the channel name.
 *
 * When {@linkcode BroadcastSubject} is created, it establishes a new {@linkcode BroadcastChannel} connection
 * with the specified name. Any messages posted to this channel by other {@linkcode BroadcastChannel} objects
 * will be emitted as values in the stream. By default, the raw message data is emitted, but you
 * can provide a custom `transform` function in the config to transform the {@linkcode MessageEvent}
 * before emission.
 *
 * If at any point there is an error in message processing or posting, the stream will error with
 * whatever the BroadcastChannel API has thrown. Note that these errors will close the underlying
 * channel - subscribers will need to create a new instance to continue receiving messages.
 *
 * By virtue of being a {@linkcode Subject}, {@linkcode BroadcastSubject} allows for both sending and receiving
 * messages. To send a message to other {@linkcode BroadcastChannel} objects, use the `next` method. The value passed
 * to `next` must be {@linkcode structuredClone|cloneable} - if it's not, subscribers to the current {@linkcode BroadcastSubject}
 * will receive an error. The `complete` and `error` methods both close the underlying channel so it can no longer
 * send or receive messages.
 */
export interface BroadcastSubject<Value = void>
	extends Omit<Subject<Value>, 'pipe'>,
		Pipeline<BroadcastSubject<Value>> {
	/**
	 * The name of the underlying {@linkcode BroadcastChannel}.
	 */
	readonly name: string;
}

/**
 * @param name The name of the underlying {@linkcode BroadcastChannel}.
 */
export interface BroadcastSubjectConstructor {
	new <Value>(name: string): BroadcastSubject<Value>;
	readonly prototype: BroadcastSubject;
}

export const BroadcastSubject: BroadcastSubjectConstructor = class<Value> {
	/** @internal */
	readonly [Symbol.toStringTag] = this.constructor.name;

	/** @internal */
	readonly #channel: BroadcastChannel;

	/** @internal */
	readonly #delegate = new Subject<Value>();

	/** @internal */
	readonly #pipeline = new Pipeline(this);

	/** @internal */
	constructor(name: string) {
		// Initialization
		this.#channel = new BroadcastChannel(name);

		// Message handling
		fromEvent<MessageEvent<Value>>(this.#channel, 'message').subscribe({
			...this,
			next: (event) => this.#delegate.next(event.data),
			complete: noop,
		});
		fromEvent(this.#channel, 'messageerror').subscribe({
			...this,
			next: (event) => this.error(event),
			complete: noop,
		});

		// Teardown
		const finalize = () => this.#channel.close();
		new Subscriber({ signal: this.signal, finalize });
	}

	/** @internal */
	get name(): string {
		return this.#channel.name;
	}

	/** @internal */
	get signal(): AbortSignal {
		return this.#delegate.signal;
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
		observerOrNext?: Partial<Observer<Value>> | ((value: Value) => void) | null,
	): void {
		this.#delegate.subscribe(observerOrNext);
	}

	/** @internal */
	next(value: Value): void {
		if (!this.signal.aborted) this.#channel.postMessage(value);
	}

	/** @internal */
	error(error: unknown): void {
		this.#delegate.error(error);
	}

	/** @internal */
	complete(): void {
		this.#delegate.complete();
	}

	/** @internal */
	asObservable(): Observable<Value> {
		return this.#delegate.asObservable();
	}
};
