import type { Observer } from '../observer';
import { observable } from '../interop';
import { Observable } from '../observable';
import type { SubjectConstructor } from './subject-constructor';

/**
 * A special type of {@linkcode Observable|observable} that can multicast notifications
 * ({@linkcode Subject.next|next}, {@linkcode Subject.error|error}, and {@linkcode Subject.complete|complete}) to many consumers. Unlike a
 * regular {@linkcode Observable|observable} which creates a new producer for each {@linkcode Subject.subscribe|subscription}, a
 * {@linkcode Subject|subject} shares a single producer across all {@linkcode Subject.subscribe|subscriptions}.
 * The {@linkcode Subject|subject} itself acts as both an {@linkcode Observer|observer} (from the producer's perspective) and an {@linkcode Observable|observable},
 * allowing values to be pushed through it directly via {@linkcode Subject.next|next}, {@linkcode Subject.error|error}, and {@linkcode Subject.complete|complete} methods.
 * If the {@linkcode Subject|subject} has already pushed a terminal notification ({@linkcode Subject.error|error} or {@linkcode Subject.complete|complete}),
 * any new consumers will immediately receive that same terminal notification upon {@linkcode Subject.subscribe|subscription}.
 */
export type Subject<Value = unknown> = Observable<Value> &
	Omit<Observer<Value>, 'finally'>;

/**
 * Flag indicating that an error is not set.
 */
const noError = Symbol('Flag indicating that an error is not set.');

/**
 *
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
 * Create custom producer-side logic of the `Subject` and conceal it from code that uses the `Observable`.
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
export const Subject: SubjectConstructor = class {
	readonly [Symbol.toStringTag] = 'Subject';
	readonly #controller = new AbortController();
	readonly signal = this.#controller.signal;
	#error: unknown = noError;
	/**
	 * Tracking a known array of observers, so we don't have to clone them while iterating to prevent reentrant
	 * behaviors. (for example, what if this {@linkcode Subject} is subscribed to when nexting to an observer)
	 */
	#observersSnapshot?: ReadonlyArray<Omit<Observer, 'finally'>>;
	readonly #observers = new Map<symbol, Omit<Observer, 'finally'>>();
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
			() => {
				// Remove the observer from the observers Map since it can no longer receive push notifications.
				this.#observers.delete(key);
				// Reset the observers snapshot since it is now stale.
				this.#observersSnapshot = undefined;
			},
			{ once: true },
		);
	});

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

		// Abort this subject before pushing this notification in-case of reentrant code.
		this.#controller.abort();

		// Multicast this notification.
		this.#ensureObserversSnapshot().forEach((observer) => observer.complete());

		// Run finalization logic.
		this.#finally();
	}

	error(error: unknown): void {
		// If this subject has been aborted there is nothing to do.
		if (this.signal.aborted) return;

		// Set the finalization state before aborting in-case of reentrant code.
		this.#error = error;

		// Abort this subject before pushing the error notification in-case of reentrant code.
		this.#controller.abort();

		// Multicast this notification.
		this.#ensureObserversSnapshot().forEach((observer) =>
			observer.error(error),
		);

		// Run finalization logic.
		this.#finally();
	}

	subscribe(
		observerOrNext?: Partial<Observer> | ((value: unknown) => unknown) | null,
	): void {
		this.#delegate.subscribe(observerOrNext);
	}

	#ensureObserversSnapshot(): ReadonlyArray<Omit<Observer, 'finally'>> {
		return (this.#observersSnapshot ??= this.#takeObserversSnapshot());
	}

	#takeObserversSnapshot(): ReadonlyArray<Omit<Observer, 'finally'>> {
		return Array.from(this.#observers.values());
	}

	#finally(): void {
		this.#observers.clear();
		this.#observersSnapshot = undefined;
	}
};
