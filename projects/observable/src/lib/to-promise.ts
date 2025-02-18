import { ObservableInput, from, ObservedValueOf, isPromiseLike } from './from';
import { UnaryFunction } from './unary-function';

export function toFirstValue<Input extends ObservableInput>(): UnaryFunction<
	Input,
	PromiseLike<ObservedValueOf<Input>>
> {
	return (source) => {
		if (isPromiseLike<ObservedValueOf<Input>>(source)) return source;
		return new Promise((resolve, reject) => {
			from(source).subscribe({ next: resolve, error: reject });
		});
	};
}

export function toLastValue<Input extends ObservableInput>(): UnaryFunction<
	Input,
	PromiseLike<ObservedValueOf<Input>>
> {
	return (source) => {
		if (isPromiseLike<ObservedValueOf<Input>>(source)) return source;
		return new Promise((resolve, reject) => {
			let output: ObservedValueOf<Input> | undefined;
			from(source).subscribe({
				next: (value) => (output = value),
				error: reject,
				complete: () => {
					if (output) resolve(output);
					output = undefined;
				},
			});
		});
	};
}
