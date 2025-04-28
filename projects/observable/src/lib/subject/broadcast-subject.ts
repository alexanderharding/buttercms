import { Subject } from './subject';
import { Observable, type Observer } from '../observable';
import { Pipeline, type UnaryFunction } from '../pipe';
import { observable, Subscribable, InteropObservable } from '../operators';

/**
 * @usage A variant of {@linkcode Subject} where the `next` notification can only multicast {@linkcode structuredClone|structured cloneable} values and to _other_ {@linkcode BroadcastSubject|subjects} of the same name, even if they are defined in another browsing context (ie. another browser tab).
 * @public
 */
export interface BroadcastSubject<Value = void>
	extends InteropObservable<Value>,
		Pipeline<BroadcastSubject<Value>> {
	/**
	 * @property
	 * @readonly
	 * @public
	 */
	readonly name: string;
	/**
	 * @property
	 * @readonly
	 * @public
	 */
	readonly [Symbol.toStringTag]: string;
	/**
	 * @usage Determining if/when this {@linkcode BroadcastSubject|subject} has been aborted and is no longer accepting new notifications.
	 * @property
	 * @readonly
	 * @public
	 */
	readonly signal: AbortSignal;
	/**
	 * @usage Multicast a {@linkcode structuredClone|structured clone} of the {@linkcode value} to all _other_ {@linkcode BroadcastSubject|subjects} of the same name, even if they are defined in another browsing context (ie. another browser tab). Subscribers of this {@linkcode BroadcastSubject|subject} will not receive this value unless it is received from another {@linkcode BroadcastSubject|subject} of the same name. Has no operation (noop) if this {@linkcode BroadcastSubject|subject} is already aborted.
	 * @param value The {@linkcode value} to multicast to all _other_ {@linkcode BroadcastSubject|subjects} of the same name.
	 * @method
	 * @public
	 */
	next(value: Value): void;
	/**
	 * @usage Abort this {@linkcode BroadcastSubject|subject} and multicast a complete notification to all {@linkcode Subscriber|subscribers} of _this_ {@linkcode BroadcastSubject|subject}. Any future {@linkcode Subscriber|subscribers} will be immediately completed (unless they are already aborted). Has no operation (noop) if this {@linkcode BroadcastSubject|subject} is already aborted.
	 * @method
	 * @public
	 */
	complete(): void;
	/**
	 * @usage Abort this {@linkcode BroadcastSubject|subject} and multicast an {@linkcode error} to all {@linkcode Subscriber|subscribers} of _this_ {@linkcode BroadcastSubject|subject}. Any future {@linkcode Subscriber|subscribers} will be immediately notified of the {@linkcode error} (unless they are already aborted). Has no operation (noop) if this {@linkcode BroadcastSubject|subject} is already aborted.
	 * @param error The {@linkcode error} to multicast to all {@linkcode Subscriber|subscribers} of _this_ {@linkcode BroadcastSubject|subject}.
	 * @method
	 * @public
	 */
	error(error: unknown): void;
	/**
	 * @usage Create a new {@linkcode Observable|observable} with this {@linkcode BroadcastSubject|subject} as the source. You can do this to create custom Observer-side logic of this {@linkcode BroadcastSubject|subject} and conceal it from code that uses the {@linkcode Observable|observable}.
	 * @returns An {@linkcode Observable|observable} that this {@linkcode BroadcastSubject|subject} casts to.
	 * @method
	 * @public
	 */
	asObservable(): Observable<Value>;
	/**
	 * @usage Observing all notifications from _this_ {@linkcode BroadcastSubject|subject} except for `next`, which is only received from _other_ {@linkcode BroadcastSubject|subjects} of the same name.
	 * @param observerOrNext Either an {@linkcode Observer} with some or all callback methods, or the `next` handler that is called for each value emitted from the subscribed {@linkcode BroadcastSubject|subject}.
	 * @method
	 * @public
	 */
	subscribe(
		observerOrNext: Partial<Observer<Value>> | UnaryFunction<Value>,
	): void;
}

export interface BroadcastSubjectConstructor {
	new <Value>(name: string): BroadcastSubject<Value>;
	readonly prototype: BroadcastSubject;
}

/**
 * @usage A fixed UUID that is used to prefix the name of the underlying {@linkcode BroadcastChannel}. This ensures that our {@linkcode BroadcastSubject|subjects} only communicates with other {@linkcode BroadcastSubject|subjects} from the same origin.
 * @constant
 * @internal
 */
const namePrefix = '652ff2f3-bed7-4700-8c2e-ed53efbbcf30';

export const BroadcastSubject: BroadcastSubjectConstructor = class {
	/**
	 * @internal
	 * @readonly
	 * @public
	 */
	readonly name: string;

	/**
	 * @internal
	 * @readonly
	 * @public
	 */
	readonly [Symbol.toStringTag] = 'BroadcastSubject';

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
	[observable](): Subscribable {
		return this;
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
		try {
			if (!this.signal.aborted) this.#channel.postMessage(value);
		} catch (error) {
			this.error(error);
		}
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
