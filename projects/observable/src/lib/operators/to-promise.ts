import { ObservableInput, from, ObservedValueOf } from '../observable';
import { UnaryFunction } from '../pipe/unary-function';

/** @internal */
const noValue = Symbol('noValue');

export function toPromise<Input extends ObservableInput>(): UnaryFunction<
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
				finalize: () => (output = noValue),
			});
		});
}
