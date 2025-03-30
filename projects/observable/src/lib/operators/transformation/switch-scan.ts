import { Observable } from '../../observable';
import { ObservableInput, ObservedValueOf } from '../creation';
import { Pipeline, type UnaryFunction } from '../../pipe';
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
		new Observable((subscriber) => {
			let accumulated = seed;

			const value = new Pipeline(source).pipe(
				switchMap((value, index) => accumulator(accumulated, value, index++)),
			);

			value.subscribe({
				...subscriber,
				next: (value) => subscriber.next((accumulated = value)),
				finalize: () => (accumulated = null!),
			});
		});
}
