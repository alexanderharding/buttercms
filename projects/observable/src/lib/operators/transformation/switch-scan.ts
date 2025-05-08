import { Observable } from '../../observable';
import { from, ObservableInput, ObservedValueOf } from '../creation';
import type { UnaryFunction } from '../../pipe';
import { switchMap } from './switch-map';

export function switchScan<
	In extends ObservableInput,
	Out extends ObservableInput,
>(
	accumulator: (
		acc: ObservedValueOf<Out>,
		value: ObservedValueOf<In>,
		index: number,
	) => Out,
	seed: ObservedValueOf<Out>,
): UnaryFunction<In, Observable<ObservedValueOf<Out>>> {
	return (source) =>
		new Observable((dispatcher) => {
			let accumulated = seed;

			from(source)
				.pipe(
					switchMap((value, index) => accumulator(accumulated, value, index++)),
				)
				.subscribe({
					...dispatcher,
					next: (value) => dispatcher.next((accumulated = value)),
					finally: () => (accumulated = null!),
				});
		});
}
