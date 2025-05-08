import { Observable } from '../../observable';
import { scan } from '../transformation';
import { UnaryFunction } from '../../pipe';
import { from, type ObservableInput, type ObservedValueOf } from '../creation';

export function reduce<Input extends ObservableInput>(
	accumulator: (
		accumulated: ObservedValueOf<Input>,
		value: ObservedValueOf<Input>,
		index: number,
	) => ObservedValueOf<Input>,
): UnaryFunction<Input, Observable<ObservedValueOf<Input>>>;
export function reduce<In extends ObservableInput, Out>(
	accumulator: (
		accumulated: Out,
		value: ObservedValueOf<In>,
		index: number,
	) => Out,
	seed: Out,
): UnaryFunction<In, Observable<Out>>;
export function reduce(
	accumulator: (accumulated: unknown, value: unknown, index: number) => unknown,
	seed?: unknown,
): UnaryFunction<ObservableInput, Observable> {
	return (source) =>
		new Observable((dispatcher) => {
			let value: unknown;
			let hasValue = false;
			const output = from(source).pipe(scan(accumulator, seed));
			output.subscribe({
				...dispatcher,
				next: (v) => {
					hasValue = true;
					value = v;
				},
				complete: () => {
					if (hasValue) dispatcher.next(value);
					dispatcher.complete();
				},
			});
		});
}
