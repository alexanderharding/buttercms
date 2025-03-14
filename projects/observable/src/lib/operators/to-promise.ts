import {
	ObservableInput,
	from,
	ObservedValueOf,
	isPromiseLike,
} from '../observable/from';
import { take } from '../observable/from-event';
import { UnaryFunction } from '../pipe/unary-function';

export function toFirstValue<Input extends ObservableInput>(): UnaryFunction<
	Input,
	PromiseLike<ObservedValueOf<Input>>
> {
	return (source) => {
		if (isPromiseLike<ObservedValueOf<Input>>(source)) return source;
		return new Promise((next, error) =>
			from(source).pipe(take(1)).subscribe({ next, error }),
		);
	};
}

const noValue = Symbol('noValue');

export function toPromise<Input extends ObservableInput>(): UnaryFunction<
	Input,
	PromiseLike<ObservedValueOf<Input>>
> {
	return (source) => {
		if (isPromiseLike<ObservedValueOf<Input>>(source)) return source;
		return new Promise((resolve, reject) => {
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
	};
}

export function toLastValue<Input extends ObservableInput>(): UnaryFunction<
	Input,
	PromiseLike<ObservedValueOf<Input>>
> {
	return (source) => {
		if (isPromiseLike<ObservedValueOf<Input>>(source)) return source;
		return new Promise((next, error) =>
			from(source).pipe(take(1)).subscribe({ next, error }),
		);
	};
}
