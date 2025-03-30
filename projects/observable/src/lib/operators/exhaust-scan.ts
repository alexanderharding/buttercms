import { ObservableInput, ObservedValueOf } from '../observable/from';
import { Observable } from '../observable/observable';
import { Pipeline } from '../pipe';
import { UnaryFunction } from '../pipe/unary-function';
import { exhaustMap } from './exhaust-map';

export function exhaustScan<
	In extends ObservableInput,
	Out extends ObservableInput,
>(
	accumulator: (
		accumulated: ObservedValueOf<Out>,
		value: ObservedValueOf<In>,
		index: number,
	) => Out,
	seed: ObservedValueOf<Out>,
): UnaryFunction<In, Observable<ObservedValueOf<Out>>> {
	return (source) =>
		new Observable((subscriber) => {
			let accumulated = seed;

			const value = new Pipeline(source).pipe(
				exhaustMap((value, index) => accumulator(accumulated, value, index++)),
			);

			value.subscribe({
				...subscriber,
				next: (value) => subscriber.next((accumulated = value)),
				finalize: () => (accumulated = null!),
			});
		});
}
