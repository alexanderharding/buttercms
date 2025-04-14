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
		new Observable((subscriber) => {
			let isUnsubscribe = true;
			tapObserver.subscribe?.();
			from(source).subscribe({
				signal: subscriber.signal,
				next(value) {
					tapObserver.next?.(value);
					subscriber.next(value);
				},
				error(error) {
					isUnsubscribe = false;
					tapObserver.error?.(error);
					subscriber.error(error);
				},
				complete() {
					isUnsubscribe = false;
					tapObserver.complete?.();
					subscriber.complete();
				},
				finalize() {
					if (isUnsubscribe) tapObserver.unsubscribe?.();
					tapObserver.finalize?.();
				},
			} satisfies Observer<ObservedValueOf<T>>);
		});
}
