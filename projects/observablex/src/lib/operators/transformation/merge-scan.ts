import { from, ObservableInput, ObservedValueOf } from '../creation';
import { Observable } from '../../observable';
import { UnaryFunction } from '../../pipe';
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
		new Observable((observer) => {
			let accumulated = seed;

			const value = from(source).pipe(
				mergeMap(
					(value, index) => accumulator(accumulated, value, index++),
					concurrent,
				),
			);

			value.subscribe({
				...observer,
				next: (value) => observer.next((accumulated = value)),
				finally: () => (accumulated = null!),
			});
		});
}
