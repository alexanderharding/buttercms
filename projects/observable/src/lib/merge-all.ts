import { ObservableInput, from, ObservedValueOf } from './from';
import { Observable } from './observable';
import { UnaryFunction } from './unary-function';

export function mergeAll<
	In extends ObservableInput<ObservableInput>,
>(): UnaryFunction<In, Observable<ObservedValueOf<ObservedValueOf<In>>>> {
	return (source) =>
		new Observable((subscriber) =>
			from(source).subscribe({
				...subscriber,
				next: (value) => from(value).subscribe(subscriber),
			}),
		);
}
