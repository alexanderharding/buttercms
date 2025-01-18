import {
	Subject,
	Observable,
	type Observer,
	type SubscriptionLike,
} from 'rxjs';
import type { BroadcastChannelSubjectConfig } from './broadcast-channel-subject-config';
import type { DefaultIn } from './default-in';

/**
 * Wrapper around the {@linkcode BroadcastChannel} object provided by the browser.
 *
 * <span class="informal">{@linkcode Subject} that communicates with other {@linkcode BroadcastChannel} objects</span>
 *
 * {@linkcode BroadcastChannelSubject} constructs an object that can be used to communicate with other
 * {@linkcode BroadcastChannel} objects (which may be in other windows, tabs, workers, or iframes) under the
 * same origin. {@linkcode BroadcastChannelSubject} accepts either a string with the channel name, or a
 * {@linkcode BroadcastChannelSubjectConfig} object for providing additional configuration, such as a
 * transformer function to customize how messages are processed.
 *
 * When {@linkcode BroadcastChannelSubject} is created, it establishes a new {@linkcode BroadcastChannel} connection
 * with the specified name. Any messages posted to this channel by other {@linkcode BroadcastChannel} objects
 * will be emitted as values in the stream. By default, the raw message data is emitted, but you
 * can provide a custom `transformer` function in the config to transform the {@linkcode MessageEvent}
 * before emission.
 *
 * If at any point there is an error in message processing or posting, the stream will error with
 * whatever the BroadcastChannel API has thrown. Note that these errors don't close the underlying
 * channel - subscribers are encouraged to retry to continue receiving messages.
 *
 * By virtue of being a {@linkcode Subject}, {@linkcode BroadcastChannelSubject} allows for both sending and receiving
 * messages. To send a message to other {@linkcode BroadcastChannel} objects, use the `next` method. The value passed
 * to `next` must be {@linkcode structuredClone|cloneable} - if it's not, subscribers to the current {@linkcode BroadcastChannelSubject}
 * will receive an error. The `complete` method closes the underlying channel so it can no longer send or receive messages.
 * The `error` method signals an error to subscribers but doesn't close the channel since it isn't
 * directly affected.
 */
export class BroadcastChannelSubject<In = DefaultIn, Out = In>
	extends Observable<Out>
	implements Observer<In>, SubscriptionLike
{
	readonly [Symbol.toStringTag] = 'BroadcastChannelSubject';

	readonly #channel: BroadcastChannel;
	#output = new Subject<Out>();
	#closed = false;

	constructor(nameOrConfig: string | BroadcastChannelSubjectConfig<In, Out>) {
		super((subscriber) => this.#output.subscribe(subscriber));

		const transformer = ensureTransformer(nameOrConfig);
		this.#channel = new BroadcastChannel(
			typeof nameOrConfig === 'string' ? nameOrConfig : nameOrConfig.name,
		);
		this.#channel.onmessage = (event: MessageEvent<In>) => {
			try {
				this.#output.next(transformer(event));
			} catch (error) {
				this.error(error);
			}
		};
		this.#channel.onmessageerror = (error) => this.error(error);
	}

	/**
	 * The name of the underlying {@linkcode BroadcastChannel}.
	 */
	get name(): string {
		return this.#channel.name;
	}

	/**
	 * Determines if the underlying {@linkcode BroadcastChannel} has been closed and can no longer send or receive messages.
	 * When closed, this {@linkcode BroadcastChannelSubject} is also completed.
	 * @see {@linkcode BroadcastChannel.close}
	 * @see {@linkcode BroadcastChannelSubject.complete}.
	 */
	get closed(): boolean {
		return this.#closed;
	}

	/**
	 * Broadcasts {@linkcode value} to all _other_ open {@linkcode BroadcastChannel}'s under the
	 * same channel name.
	 *
	 * If the {@linkcode value} is not {@linkcode structuredClone|cloneable},  subscribers of this
	 * {@linkcode BroadcastChannelSubject} will receive an {@linkcode DOMException|error} notification instead.
	 *
	 * @see {@linkcode BroadcastChannel.postMessage}
	 * @see {@linkcode BroadcastChannelSubject.error}
	 */
	next(value: In): void {
		try {
			this.#channel.postMessage(value);
		} catch (error) {
			this.error(error);
		}
	}

	/**
	 * Completes this {@linkcode BroadcastChannelSubject} and closes the underlying {@linkcode BroadcastChannel} so it can no
	 * longer send or receive messages.
	 *
	 * It is encouraged to call this method when the {@linkcode BroadcastChannelSubject} is no longer needed so
	 * it can be eligible for garbage collection.
	 * @see {@linkcode BroadcastChannel.close}
	 */
	complete(): void {
		this.#channel.close();
		this.#closed = true;
		this.#output.complete();
	}

	/**
	 * Errors this {@linkcode BroadcastChannelSubject} but doesn't close the underlying {@linkcode BroadcastChannel} since it
	 * isn't directly affected (it _could_ still send/receive messages).
	 *
	 * If the underlying {@linkcode BroadcastChannel} is {@linkcode BroadcastChannelSubject.closed|open}, subscribers are encouraged
	 * to retry so they can continue to receive messages. They do not need to retry to continue to
	 * {@linkcode BroadcastChannelSubject.next|send} messages.
	 */
	error(error: unknown): void {
		(this.closed ? this.#output : this.#resetOutput()).error(error);
	}

	/**
	 * Creates a new Observable with this Subject as the source. You can do this
	 * to create custom Observer-side logic of the Subject and conceal it from
	 * code that uses the Observable.
	 * @return Observable that this Subject casts to.
	 */
	asObservable(): Observable<Out> {
		return new Observable((subscriber) => this.subscribe(subscriber));
	}

	unsubscribe(): void {
		(this.closed ? this.#output : this.#resetOutput()).unsubscribe();
	}

	/** @returns The previous output. */
	#resetOutput(): Subject<Out> {
		const previous = this.#output;
		this.#output = new Subject();
		return previous;
	}
}

// This is a little hacky, but ultimately it's up to the consumer of the BroadcastChannelSubject
// to type `In` and `Out` correctly.
function ensureTransformer<In = DefaultIn, Out = In>(
	nameOrConfig: string | BroadcastChannelSubjectConfig<In, Out>,
): (event: MessageEvent<In>) => Out;
function ensureTransformer(
	nameOrConfig: string | BroadcastChannelSubjectConfig<unknown, unknown>,
): (event: MessageEvent<unknown>) => unknown {
	return typeof nameOrConfig === 'string' || !nameOrConfig.transformer
		? (event) => event.data
		: nameOrConfig.transformer;
}
