import {
	from,
	Observable,
	type Observer,
	type ObservableInput,
	type ObservedValueOf,
} from '../../observable';
import type { UnaryFunction } from '../../pipe';

export function tap<T extends ObservableInput>(
	observerOrNext:
		| Omit<Partial<Observer<ObservedValueOf<T>>>, 'signal'>
		| ((value: ObservedValueOf<T>) => void),
): UnaryFunction<T, Observable<ObservedValueOf<T>>> {
	return (source) =>
		new Observable((subscriber) => {
			const normalizedSource = from(source);
			normalizedSource.subscribe(observerOrNext);
			normalizedSource.subscribe(subscriber);
		});
}
