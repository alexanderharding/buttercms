import { Observer, Subscriber } from 'subscriber';
import { observable, Observable } from './observable';
import { Subscription } from 'subscription';
import { UnaryFunction } from './unary-function';
import { TeardownLogic } from 'rxjs';

/**
 * A Subject is a special type of Observable that allows values to be
 * multicasted to many Observers. Subjects are like EventEmitters.
 *
 * Every Subject is an Observable and an Observer. You can subscribe to a
 * Subject, and you can call next to feed values as well as error and complete.
 */
export interface Subject<Value = void> extends Observable<Value> {
	/** @internal */
	readonly [Symbol.toStringTag]: string;
	/**
	 * Flag indicating if {@linkcode Subject|this subject} has been closed and is no longer accepting new values.
	 */
	readonly closed: boolean;
	/**
	 * Flag indicating if {@linkcode Subject|this subject} has any subscribers.
	 */
	readonly observed: boolean;
	/**
	 * Multicast a value to all subscribers of the Subject.
	 * Has no operation (noop) if the Subject is closed.
	 * @param value The value to multicast to all subscribers.
	 */
	next(value: Value): void;
	/**
	 * Multicast a completion notification to all subscribers of the Subject and close it.
	 * Any future subscribers will be immediately completed (unless they are already closed).
	 * Has no operation (noop) if the Subject is closed.
	 */
	complete(): void;
	/**
	 * Multicast an error to all subscribers of the Subject and close it.
	 * Any future subscribers will be immediately notified of the error (unless they are already closed).
	 * Has no operation (noop) if the Subject is closed.
	 * @param error The error to multicast to all subscribers.
	 */
	error(error: unknown): void;
	/**
	 * Creates a new Observable with this Subject as the source. You can do this
	 * to create custom Observer-side logic of the Subject and conceal it from
	 * code that uses the Observable.
	 * @return Observable that this Subject casts to.
	 */
	asObservable(): Observable<Value>;
	/**
	 * Unsubscribes the Subject (closes it) and all subscribers.
	 * Any future subscriber will be immediately unsubscribed.
	 */
	unsubscribe(): void;
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

	[observable](subscriber: Subscriber<void>): TeardownLogic {
		return this.subscribe(subscriber);
	}

	/** @internal */
	#closed = false;

	/** @internal */
	#hasError = false;

	/** @internal */
	#hasComplete = false;

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
		if (this.#hasError) {
			subscriber.error(this.#thrownError);
		} else if (this.#hasComplete) {
			subscriber.complete();
		} else if (this.closed) {
			subscriber.unsubscribe();
		}

		if (subscriber.closed) return;

		this.#subscribersSnapshot = undefined;
		this.#subscribers.add(subscriber);
		subscriber.add(() => this.#subscribers.delete(subscriber));
		subscriber.add(() => (this.#subscribersSnapshot = undefined));
	});

	get observed(): boolean {
		return this.#subscribers.size > 0;
	}

	get closed(): boolean {
		return this.#closed;
	}

	next(value: undefined): void {
		if (this.closed) return;
		(this.#subscribersSnapshot ??= this.#takeSubscriberSnapshot()).forEach(
			(subscriber) => subscriber.next(value),
		);
	}

	complete(): void {
		if (this.closed) return;
		this.#closed = true;
		this.#hasComplete = true;
		(this.#subscribersSnapshot ??= this.#takeSubscriberSnapshot()).forEach(
			(subscriber) => subscriber.complete(),
		);
	}

	error(error: unknown): void {
		if (this.closed) return;
		this.#closed = true;
		this.#hasError = true;
		this.#thrownError = error;
		(this.#subscribersSnapshot ??= this.#takeSubscriberSnapshot()).forEach(
			(subscriber) => subscriber.error(error),
		);
	}

	subscribe(
		observerOrNext?: Partial<Observer> | ((value: unknown) => void) | null,
	): Subscription {
		return this.#delegate.subscribe(observerOrNext);
	}

	unsubscribe(): void {
		if (this.closed) return;
		this.#closed = true;
		(this.#subscribersSnapshot ??= this.#takeSubscriberSnapshot()).forEach(
			(subscriber) => subscriber.unsubscribe(),
		);
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

	/** @internal */
	#takeSubscriberSnapshot(): ReadonlyArray<Subscriber<void>> {
		return Array.from(this.#subscribers.values());
	}
};
