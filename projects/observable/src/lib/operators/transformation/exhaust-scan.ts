import { Observable } from '../../observable';
import { ObservableInput, ObservedValueOf } from '../creation';
import { Pipeline } from '../../pipe';
import { UnaryFunction } from '../../pipe';
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
		new Observable((dispatcher) => {
			let accumulated = seed;

			const value = new Pipeline(source).pipe(
				exhaustMap((value, index) => accumulator(accumulated, value, index++)),
			);

			value.subscribe({
				...dispatcher,
				next: (value) => dispatcher.next((accumulated = value)),
				finally: () => (accumulated = null!),
			});
		});
}
