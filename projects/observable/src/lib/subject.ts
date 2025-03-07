import { Observer, Subscriber } from 'subscriber';
import { Observable, subscribe } from './observable';
import { Pipeline } from './pipeline';

/**
 * A Subject is a special type of Observable that allows values to be
 * multicasted to many Observers. Subjects are like EventEmitters.
 *
 * Every Subject is an Observable and an Observer. You can subscribe to a
 * Subject, and you can call next to feed values as well as error and complete.
 */
export interface Subject<Value = void>
	extends Omit<Observable<Value>, 'pipe'>,
		Pipeline<Subject<Value>> {
	/** @internal */
	readonly [Symbol.toStringTag]: string;
	readonly signal: AbortSignal;
	/**
	 * Multicast a value to all subscribers of this {@linkcode Subject|subject}.
	 * Has no operation (noop) if this {@linkcode Subject|subject} is already aborted.
	 * @param value The value to multicast to all subscribers.
	 */
	next(value: Value): void;
	/**
	 * Multicast a completion notification to all subscribers of this {@linkcode Subject|subject} and abort it.
	 * Any future subscribers will be immediately completed (unless they are already aborted).
	 * Has no operation (noop) if this {@linkcode Subject|subject} is already aborted.
	 */
	complete(): void;
	/**
	 * Multicast an error to all subscribers of this {@linkcode Subject|subject} and abort it.
	 * Any future subscribers will be immediately notified of the error (unless they are already aborted).
	 * Has no operation (noop) if this {@linkcode Subject|subject} is already aborted.
	 * @param error The error to multicast to all subscribers.
	 */
	error(error: unknown): void;
	/**
	 * Creates a new Observable with this {@linkcode Subject|subject} as the source. You can do this
	 * to create custom Observer-side logic of this {@linkcode Subject|subject} and conceal it from
	 * code that uses the Observable.
	 * @return Observable that this {@linkcode Subject|subject} casts to.
	 */
	asObservable(): Observable<Value>;
}

export interface SubjectConstructor {
	new <Value>(signal?: AbortSignal): Subject<Value>;
	readonly prototype: Subject;
}

export const Subject: SubjectConstructor = class {
	/** @internal */
	readonly [Symbol.toStringTag] = this.constructor.name;

	/** @internal */
	readonly #controller = new AbortController();

	/** @internal */
	readonly signal = this.#controller.signal;

	/** @internal */
	#thrownError: unknown;

	/** @internal */
	#hasError = false;

	/** @internal */
	#hasComplete = false;

	/**
	 * This is used to track a known array of subscribers, so we don't have to
	 * clone them while iterating to prevent reentrant behaviors.
	 * (for example, what if the subject is subscribed to when nexting to an observer)
	 * @internal
	 */
	#subscribersSnapshot?: ReadonlyArray<Subscriber>;

	/** @internal */
	readonly #subscribers = new Set<Subscriber>();

	/** @internal */
	readonly #delegate = new Observable((subscriber) => {
		this.#checkFinalizers(subscriber);
		if (subscriber.signal.aborted) return;
		this.#addSubscriber(subscriber);
		subscriber.signal.addEventListener(
			'abort',
			() => this.#deleteSubscriber(subscriber),
			{ signal: subscriber.signal },
		);
	});

	/** @internal */
	readonly #pipeline = new Pipeline(this);

	/** @internal */
	constructor() {
		new Subscriber({
			signal: this.signal,
			finalize: () => {
				this.#subscribers.clear();
				this.#subscribersSnapshot = undefined;
			},
		});
	}

	/** @internal */
	get #closed(): boolean {
		return this.signal.aborted || this.#hasError || this.#hasComplete;
	}

	/** @internal */
	[subscribe](
		observerOrNext?: ((value: unknown) => void) | Partial<Observer> | null,
	): void {
		this.subscribe(observerOrNext);
	}

	/** @internal */
	subscribe(
		observerOrNext?: Partial<Observer> | ((value: unknown) => void) | null,
	): void {
		this.#delegate.subscribe(observerOrNext);
	}

	/** @internal */
	next(value: unknown): void {
		if (this.#closed) return;
		(this.#subscribersSnapshot ??= this.#takeSubscriberSnapshot()).forEach(
			(subscriber) => subscriber.next(value),
		);
	}

	/** @internal */
	complete(): void {
		if (this.#closed) return;
		this.#hasComplete = true;
		(this.#subscribersSnapshot ??= this.#takeSubscriberSnapshot()).forEach(
			(subscriber) => subscriber.complete(),
		);
		this.#controller.abort();
	}

	/** @internal */
	error(error: unknown): void {
		if (this.#closed) return;
		this.#hasError = true;
		this.#thrownError = error;
		(this.#subscribersSnapshot ??= this.#takeSubscriberSnapshot()).forEach(
			(subscriber) => subscriber.error(error),
		);
		this.#controller.abort();
	}

	/** @internal */
	pipe(...operations: []): this {
		return this.#pipeline.pipe(...operations);
	}

	/** @internal */
	asObservable(): Observable {
		return this.#delegate;
	}

	/** @internal */
	#takeSubscriberSnapshot(): ReadonlyArray<Subscriber> {
		return Array.from(this.#subscribers.values());
	}

	/** @internal */
	#checkFinalizers(subscriber: Subscriber): void {
		if (this.#hasError) {
			subscriber.error(this.#thrownError);
		} else if (this.#hasComplete) {
			subscriber.complete();
		}
	}

	/** @internal */
	#addSubscriber(subscriber: Subscriber): void {
		this.#subscribersSnapshot = undefined;
		this.#subscribers.add(subscriber);
	}

	/** @internal */
	#deleteSubscriber(subscriber: Subscriber): void {
		this.#subscribersSnapshot = undefined;
		this.#subscribers.delete(subscriber);
	}
};
