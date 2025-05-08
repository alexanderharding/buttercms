import { Observable } from '../../observable';
import { from, ObservableInput, ObservedValueOf } from '../creation';
import { UnaryFunction } from '../../pipe';

export function map<In extends ObservableInput, Out>(
	mapFn: (value: ObservedValueOf<In>) => Out,
): UnaryFunction<In, Observable<Out>> {
	return (source) =>
		new Observable((dispatcher) =>
			from(source).subscribe({
				...dispatcher,
				next: (value) => dispatcher.next(mapFn(value)),
			}),
		);
}
