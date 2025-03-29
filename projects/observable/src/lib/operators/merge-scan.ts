import { ObservableInput, from, ObservedValueOf } from '../observable/from';
import { Observable } from '../observable/observable';
import { UnaryFunction } from '../pipe/unary-function';
import { mergeMap } from './merge-map';

export function mergeScan<
	In extends ObservableInput,
	Out extends ObservableInput,
>(
	accumulator: (
		accumulated: ObservedValueOf<Out>,
		value: ObservedValueOf<In>,
		index: number,
	) => Out,
	seed: ObservedValueOf<Out>,
	concurrent?: number,
): UnaryFunction<In, Observable<ObservedValueOf<Out>>> {
	return (source) =>
		new Observable((subscriber) => {
			let accumulated = seed;

			const value = from(source).pipe(
				mergeMap(
					(value, index) => accumulator(accumulated, value, index++),
					concurrent,
				),
			);

			value.subscribe({
				...subscriber,
				next: (value) => subscriber.next((accumulated = value)),
				finalize: () => (accumulated = null!),
			});
		});
}
