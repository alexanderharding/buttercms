import {
	from,
	Observable,
	type Observer,
	type ObservableInput,
	type ObservedValueOf,
} from '../observable';
import type { UnaryFunction } from '../pipe';

export function tap<In extends ObservableInput>(
	observerOrNext:
		| Partial<Observer<ObservedValueOf<In>>>
		| ((value: ObservedValueOf<In>) => void),
): UnaryFunction<In, Observable<ObservedValueOf<In>>> {
	return (source) =>
		new Observable((subscriber) => {
			const normalizedSource = from(source);
			normalizedSource.subscribe(observerOrNext);
			normalizedSource.subscribe(subscriber);
		});
}
