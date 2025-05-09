import { Observable } from '../../observable/observable';
import { UnaryFunction } from '../../pipe';
import { from, ObservableInput, ObservedValueOf } from '../creation';

export function scan<Input extends ObservableInput, Value>(
	accumulator: (
		acc: ObservedValueOf<Input> | Value,
		value: ObservedValueOf<Input>,
		index: number,
	) => Value,
): UnaryFunction<Input, Observable<ObservedValueOf<Input> | Value>>;
export function scan<Input extends ObservableInput, Value, Seed>(
	accumulator: (
		acc: ObservedValueOf<Input> | Value | Seed,
		value: ObservedValueOf<Input>,
		index: number,
	) => Value,
	seed: Seed,
): UnaryFunction<Input, Observable<ObservedValueOf<Input> | Value | Seed>>;
export function scan(
	...args: [
		accumulator: (acc: unknown, value: unknown, index: number) => unknown,
		seed?: unknown,
	]
): UnaryFunction<ObservableInput, Observable> {
	return (source) =>
		new Observable((observer) => {
			const [accumulator, seed] = args;
			// Whether or not we have state yet. This will only be
			// false before the first value arrives if we didn't get
			// a seed value.
			let hasState = args.length > 1;
			// The state that we're tracking, starting with the seed,
			// if there is one, and then updated by the return value
			// from the accumulator on each emission.
			let accumulated = seed;
			// An index to pass to the accumulator function.
			let index = 0;

			from(source).subscribe({
				...observer,
				next: (value) => {
					// Set the state.
					if (hasState) {
						// We already have state, so we can get the new state from the accumulator.
						// Always increment the index.
						accumulated = accumulator(accumulated, value, index++);
					} else {
						// We didn't have state yet, a seed value was not provided, so
						// we set the state to the first value, and mark that we have state now.
						hasState = true;
						accumulated = value;
					}

					// Send it to the consumer.
					observer.next(accumulated);
				},
			});
		});
}
