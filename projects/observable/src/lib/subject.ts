import { Observer, Subscriber } from 'subscriber';
import { Observable } from './observable';
import { UnaryFunction } from './unary-function';
import { from, ObservableInput } from './from';

/** @internal */
const completeSymbol = Symbol('complete');

/** @internal */
const errorSymbol = Symbol('error');

/**
 * A Subject is a special type of Observable that allows values to be
 * multicasted to many Observers. Subjects are like EventEmitters.
 *
 * Every Subject is an Observable and an Observer. You can subscribe to a
 * Subject, and you can call next to feed values as well as error and complete.
 */
export interface Subject<Value = void>
	extends Observable<Value>,
		AbortController {
	/** @internal */
	readonly [Symbol.toStringTag]: string;
	/**
	 * Flag indicating if this {@linkcode Subject|subject} has any subscribers.
	 */
	readonly observed: boolean;
	/**
	 * The AbortSignal object associated with this {@linkcode Subject|subject}.
	 */
	readonly signal: AbortSignal;
	/**
	 * Multicast an abort to all subscribers of this {@linkcode Subject|subject}.
	 * Has no operation (noop) if this {@linkcode Subject|subject} is already aborted.
	 * @param reason The reason to multicast to all subscribers.
	 */
	abort(reason?: unknown): void;
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
	new (): Subject;
	new <Value = void>(): Subject<Value>;
	readonly prototype: Subject;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const Subject: SubjectConstructor = class {
	/** @internal */
	readonly [Symbol.toStringTag] = this.constructor.name;

	/** @internal */
	readonly #controller = new AbortController();

	/** @internal */
	#thrownError: unknown;

	/**
	 * This is used to track a known array of subscribers, so we don't have to
	 * clone them while iterating to prevent reentrant behaviors.
	 * (for example, what if the subject is subscribed to when nexting to an observer)
	 * @internal
	 */
	#subscribersSnapshot?: ReadonlyArray<Subscriber<void>>;

	/** @internal */
	readonly #subscribers = new Set<Subscriber<void>>();

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

	get observed(): boolean {
		return this.#subscribers.size > 0;
	}

	get signal(): AbortSignal {
		return this.#controller.signal;
	}

	subscribe(
		observerOrNext?: Partial<Observer> | ((value: unknown) => void) | null,
	): void {
		this.#delegate.subscribe(observerOrNext);
	}

	abort(reason?: unknown): void {
		if (this.signal.aborted) return;
		this.#controller.abort(reason);
		(this.#subscribersSnapshot ??= this.#takeSubscriberSnapshot()).forEach(
			(subscriber) => subscriber.abort(reason),
		);
	}

	next(value: undefined): void {
		if (this.signal.aborted) return;
		(this.#subscribersSnapshot ??= this.#takeSubscriberSnapshot()).forEach(
			(subscriber) => subscriber.next(value),
		);
	}

	complete(): void {
		if (this.signal.aborted) return;
		this.#controller.abort(completeSymbol);
		(this.#subscribersSnapshot ??= this.#takeSubscriberSnapshot()).forEach(
			(subscriber) => subscriber.complete(),
		);
	}

	error(error: unknown): void {
		if (this.signal.aborted) return;
		this.#controller.abort(errorSymbol);
		this.#thrownError = error;
		(this.#subscribersSnapshot ??= this.#takeSubscriberSnapshot()).forEach(
			(subscriber) => subscriber.error(error),
		);
	}

	asObservable(): Observable<void> {
		return from<ObservableInput<void>>(this);
	}

	pipe(
		...operations: ReadonlyArray<UnaryFunction<never, never>>
	): Observable<void> {
		return operations.reduce(
			(acc: never, operator) => operator(acc),
			this.asObservable(),
		);
	}

	/** @internal */
	#takeSubscriberSnapshot(): ReadonlyArray<Subscriber<void>> {
		return Array.from(this.#subscribers.values());
	}

	/** @internal */
	#checkFinalizers(subscriber: Subscriber): void {
		if (this.signal.reason === errorSymbol) {
			subscriber.error(this.#thrownError);
		} else if (this.signal.reason === completeSymbol) {
			subscriber.complete();
		} else if (this.signal.aborted) {
			subscriber.abort(this.signal.reason);
		}
	}

	/** @internal */
	#addSubscriber(subscriber: Subscriber): void {
		this.#subscribersSnapshot = undefined;
		this.#subscribers.add(subscriber);
	}

	/** @internal */
	#deleteSubscriber(subscriber: Subscriber): void {
		this.#subscribers.delete(subscriber);
		this.#subscribersSnapshot = undefined;
	}
};
