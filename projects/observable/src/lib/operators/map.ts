import { Observable } from '../observable/observable';
import { ObservableInput, ObservedValueOf, from } from '../observable/from';
import { UnaryFunction } from '../pipe/unary-function';

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
