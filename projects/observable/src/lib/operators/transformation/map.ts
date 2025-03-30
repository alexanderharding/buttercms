import { Observable } from '../../observable';
import { from, ObservableInput, ObservedValueOf } from '../creation';
import { UnaryFunction } from '../../pipe';

export function map<In extends ObservableInput, Out>(
	mapFn: (value: ObservedValueOf<In>) => Out,
): UnaryFunction<In, Observable<Out>> {
	return (source) =>
		new Observable((subscriber) =>
			from(source).subscribe({
				...subscriber,
				next: (value) => subscriber.next(mapFn(value)),
			}),
		);
}
