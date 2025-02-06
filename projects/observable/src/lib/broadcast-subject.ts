import { noop } from 'rxjs';
import { Subject } from './subject';
import { observable, Observable } from './observable';
import { Subscription, TeardownLogic } from 'subscription';
import { Observer, Subscriber } from 'subscriber';
import { UnaryFunction } from './unary-function';
import { Subscribable } from './subscribable';

/** @internal */
// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
type Default = void;

/**
 * Wrapper around the {@linkcode BroadcastChannel} object provided by the browser.

 *
 * <span class="informal">{@linkcode Subject} that communicates with other {@linkcode BroadcastChannel} objects</span>
 *
 * {@linkcode BroadcastSubject} constructs an object that can be used to communicate with other
 * {@linkcode BroadcastChannel} objects (which may be in other windows, tabs, workers, or iframes) under the
 * same origin. {@linkcode BroadcastSubject} accepts either a string with the channel name, or a
 * {@linkcode BroadcastSubjectConfig} object for providing additional configuration, such as a
 * transform function to customize how messages are processed.
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
export type BroadcastSubject<Value = Default> = Subject<Value> &
	Readonly<{
		/**
		 * The name of the underlying {@linkcode BroadcastChannel}.
		 */
		name: string;
	}>;

/**
 * @param name The name of the underlying {@linkcode BroadcastChannel}.
 */
export interface BroadcastSubjectConstructor {
	new (name: string): BroadcastSubject;
	new <Value = Default>(name: string): BroadcastSubject<Value>;
	readonly prototype: BroadcastSubject;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const BroadcastSubject: BroadcastSubjectConstructor = class {
	/** @internal */
	readonly [Symbol.toStringTag] = 'BroadcastSubject';

	/** @internal */
	readonly #channel: BroadcastChannel;

	/** @internal */
	readonly #delegate = new Subject();

	constructor(name: string) {
		this.#channel = new BroadcastChannel(name);
		this.#channel.onmessage = (event: MessageEvent<void>) =>
			this.#delegate.next(event.data);
		this.#channel.onmessageerror = (event) => this.#delegate.error(event);
		this.subscribe({ error: noop }).add(() => this.#channel.close());
	}

	get name(): string {
		return this.#channel.name;
	}

	get observed(): boolean {
		return this.#delegate.observed;
	}

	get closed(): boolean {
		return this.#delegate.closed;
	}

	[observable](subscriber: Subscriber<void>): TeardownLogic {
		return this.subscribe(subscriber);
	}

	next(value: undefined): void {
		if (!this.closed) this.#channel.postMessage(value);
	}

	error(error: unknown): void {
		this.#delegate.error(error);
	}

	complete(): void {
		this.#delegate.complete();
	}

	subscribe(
		observerOrNext?: Partial<Observer<void>> | ((value: undefined) => void),
	): Subscription {
		return this.#delegate.subscribe(observerOrNext);
	}

	unsubscribe(): void {
		this.#delegate.unsubscribe();
	}

	asObservable(): Observable<void> {
		return new Observable((subscriber) => this.subscribe(subscriber));
	}

	pipe(
		...operations: ReadonlyArray<UnaryFunction<never, never>>
	): Observable<void> {
		return operations.reduce(
			(acc: never, operator) => operator(acc),
			this.asObservable(),
		);
	}
};
