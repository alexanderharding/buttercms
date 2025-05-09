import { Observable, Observer } from '../../observable';
import type { UnaryFunction } from '../../pipe';
import { from, ObservableInput, ObservedValueOf } from '../creation';

export interface TapObserver<T> extends Omit<Observer<T>, 'signal'> {
	/**
	 * The callback that `tap` operator invokes at the moment when the source Observable
	 * gets subscribed to.
	 */
	subscribe(): unknown;
	/**
	 * The callback that `tap` operator invokes when an explicit
	 * {@link guide/glossary-and-semantics#unsubscription unsubscribe} happens. It won't get invoked on
	 * `error` or `complete` events.
	 */
	unsubscribe(): unknown;
}

export function tap<T extends ObservableInput>(
	observerOrNext:
		| Omit<Partial<TapObserver<ObservedValueOf<T>>>, 'signal'>
		| ((value: ObservedValueOf<T>) => unknown),
): UnaryFunction<T, Observable<ObservedValueOf<T>>> {
	const tapObserver =
		typeof observerOrNext === 'function'
			? { next: observerOrNext }
			: observerOrNext;

	return (source) =>
		new Observable((observer) => {
			let isUnsubscribe = true;
			tapObserver.subscribe?.();
			from(source).subscribe({
				signal: observer.signal,
				next(value) {
					tapObserver.next?.(value);
					observer.next(value);
				},
				error(error) {
					isUnsubscribe = false;
					tapObserver.error?.(error);
					observer.error(error);
				},
				complete() {
					isUnsubscribe = false;
					tapObserver.complete?.();
					observer.complete();
				},
				finally() {
					if (isUnsubscribe) tapObserver.unsubscribe?.();
					tapObserver.finally?.();
				},
			} satisfies Observer<ObservedValueOf<T>>);
		});
}
