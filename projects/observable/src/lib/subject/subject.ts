import { Observable, ConsumerObserver, ProducerObserver } from '../observable';
import { observable } from '../interop';

/**
 * [Glossary](https://jsr.io/@xander/observable#subject)
 * @example
 * Basic usage
 * ```ts
 * import { Subject } from '@xander/observable';
 *
 * const subject = new Subject<number>();
 *
 * subject.subscribe((value) => console.log(value));
 *
 * subject.next(1);
 *
 * // console output:
 * // 1
 *
 * subject.subscribe((value) => console.log(value));
 *
 * subject.next(2);
 *
 * // console output:
 * // 2
 * // 2
 * ```
 * @example
 * Create custom `producer`-side logic of the `Subject` and conceal it from code that uses the `Observable`.
 * ```ts
 * import { Subject, Observable } from '@xander/observable';
 *
 * class AuthenticationService {
 *   readonly #loggedInNotifier = new Subject<void>();
 *   readonly loggedInNotifier = Observable.from(this.#loggedInNotifier);
 *
 *   login(): void {
 *     this.#loggedInNotifier.next();
 *   }
 * }
 * ```
 */
export type Subject<Value = unknown> = Observable<Value> &
	ProducerObserver<Value>;

/**
 * Object interface for a {@linkcode Subject} factory.
 */
export interface SubjectConstructor {
	new (): Subject;
	new <Value>(): Subject<Value>;
	readonly prototype: Subject;
}

/**
 * Flag indicating that an error is not set.
 */
const noError = Symbol('Flag indicating that an error is not set.');

export const Subject: SubjectConstructor = class {
	readonly [Symbol.toStringTag] = 'Subject';
	readonly #controller = new AbortController();
	readonly signal = this.#controller.signal;
	#error: unknown = noError;
	/**
	 * Tracking a known array of observers, so we don't have to clone them while iterating to prevent reentrant
	 * behaviors. (for example, what if this {@linkcode Subject} is subscribed to when nexting to an observer)
	 */
	#observersSnapshot?: ReadonlyArray<ProducerObserver>;
	readonly #observers = new Map<symbol, ProducerObserver>();
	readonly #delegate = new Observable((observer) => {
		// Check if this subject has finalized so we can notify the observer immediately.
		if (this.#error !== noError) observer.error(this.#error);
		else if (this.signal.aborted) observer.complete();

		// If the observer is already aborted then there's nothing to do.
		// This could be because the observer was aborted before it passed to this subject
		// or from this subject being in a finalized state.
		if (observer.signal.aborted) return;

		// Use a unique symbol to identify the observer since it is allowed for the same
		// observer to be added multiple times.
		const key = Symbol('Subject producer observer');

		// Add the observer to the observers Map so it can begin to receive push notifications.
		this.#observers.set(key, observer);

		// Reset the observers snapshot since it is now stale.
		this.#observersSnapshot = undefined;

		// Remove the observer from the observers Map when it's at the end of it's lifecycle.
		observer.signal.addEventListener(
			'abort',
			() => this.#observers.delete(key),
			{ signal: observer.signal },
		);
	});

	constructor() {
		// Free up memory whenever this subject is at the end of it's lifecycle.
		this.signal.addEventListener(
			'abort',
			() => {
				this.#observers.clear();
				this.#observersSnapshot = undefined;
			},
			{ signal: this.signal },
		);
	}

	[observable](): Observable {
		return this.#delegate;
	}

	next(value: unknown): void {
		// If this subject has been aborted there is nothing to do.
		if (this.signal.aborted) return;

		// Multicast this notification.
		this.#ensureObserversSnapshot().forEach((observer) => observer.next(value));
	}

	complete(): void {
		// If this subject has been aborted there is nothing to do.
		if (this.signal.aborted) return;

		// Get the observers snapshot before aborting because they will be cleared.
		const observers = this.#ensureObserversSnapshot();

		// Abort this subject before pushing this notification in-case of reentrant code.
		this.#controller.abort();

		// Multicast this notification.
		observers.forEach((observer) => observer.complete());
	}

	error(error: unknown): void {
		// If this subject has been aborted there is nothing to do.
		if (this.signal.aborted) return;

		// Set the finalization state before aborting in-case of reentrant code.
		this.#error = error;

		// Get the observers snapshot before aborting because they will be cleared.
		const observers = this.#ensureObserversSnapshot();

		// Abort this subject before pushing the error notification in-case of reentrant code.
		this.#controller.abort();

		// Multicast this notification.
		observers.forEach((observer) => observer.error(error));
	}

	subscribe(
		observerOrNext?:
			| Partial<ConsumerObserver>
			| ((value: unknown) => unknown)
			| null,
	): void {
		this.#delegate.subscribe(observerOrNext);
	}

	#ensureObserversSnapshot(): ReadonlyArray<ProducerObserver> {
		return (this.#observersSnapshot ??= this.#takeObserversSnapshot());
	}

	#takeObserversSnapshot(): ReadonlyArray<ProducerObserver> {
		return Array.from(this.#observers.values());
	}
};
