import { Observable } from '../../observable';
import { from, ObservableInput, ObservedValueOf } from '../creation';
import { UnaryFunction } from '../../pipe';

export function map<In extends ObservableInput, Out>(
	mapFn: (value: ObservedValueOf<In>) => Out,
): UnaryFunction<In, Observable<Out>> {
	return (source) =>
		new Observable((observer) =>
			from(source).subscribe({
				...observer,
				next: (value) => observer.next(mapFn(value)),
			}),
		);
}
