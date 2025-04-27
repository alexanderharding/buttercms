import type { UnaryFunction } from '../../pipe';
import { from, type ObservableInput, type ObservedValueOf } from '../creation';

/** @internal */
const noValue = Symbol('noValue');

export function asPromise<Input extends ObservableInput>(): UnaryFunction<
	Input,
	Promise<ObservedValueOf<Input>>
> {
	return async (source) =>
		new Promise((resolve, reject) => {
			let output: ObservedValueOf<Input> | typeof noValue = noValue;
			from(source).subscribe({
				next: (value) => (output = value),
				error: reject,
				complete: () => {
					if (output !== noValue) resolve(output);
				},
				finally: () => (output = noValue),
			});
		});
}
