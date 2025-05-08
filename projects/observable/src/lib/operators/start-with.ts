import { from, ObservableInput, ObservedValueOf } from '../observable/from';
import { Observable } from '../observable/observable';
import { UnaryFunction } from '../pipe/unary-function';

export function startWith<A extends ObservableInput, B extends ObservableInput>(
	input: B,
): UnaryFunction<A, Observable<ObservedValueOf<A> | ObservedValueOf<B>>> {
	return (source) =>
		new Observable((dispatcher) =>
			from(input).subscribe({
				...dispatcher,
				complete: () => from(source).subscribe(dispatcher),
			}),
		);
}
