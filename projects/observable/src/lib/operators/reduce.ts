import { from, ObservableInput, ObservedValueOf } from '../observable/from';
import { Observable } from '../observable/observable';
import { scan } from './scan';
import { UnaryFunction } from '../pipe/unary-function';

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
		new Observable((subscriber) => {
			let value: unknown;
			let hasValue = false;
			const output = from(source).pipe(scan(accumulator, seed));
			output.subscribe({
				...subscriber,
				next: (v) => {
					hasValue = true;
					value = v;
				},
				complete: () => {
					if (hasValue) subscriber.next(value);
					subscriber.complete();
				},
			});
		});
}
