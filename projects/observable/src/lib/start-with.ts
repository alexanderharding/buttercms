import { from, ObservableInput, ObservedValueOf } from './from';
import { Observable } from './observable';
import { UnaryFunction } from './unary-function';

export function startWith<A extends ObservableInput, B extends ObservableInput>(
	input: B,
): UnaryFunction<A, Observable<ObservedValueOf<A> | ObservedValueOf<B>>> {
	return (source) =>
		new Observable((subscriber) =>
			from(input).subscribe({
				...subscriber,
				complete: () => from(source).subscribe(subscriber),
			}),
		);
}
