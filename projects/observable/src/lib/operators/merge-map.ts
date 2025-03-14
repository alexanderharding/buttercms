import { ObservableInput, from, ObservedValueOf } from '../observable/from';
import { Observable } from '../observable/observable';
import { UnaryFunction } from '../pipe/unary-function';

export function mergeMap<
	In extends ObservableInput<ObservableInput>,
>(): UnaryFunction<In, Observable<ObservedValueOf<ObservedValueOf<In>>>>;
export function mergeMap<
	In extends ObservableInput,
	Out extends ObservableInput,
>(
	mapFn: (value: ObservedValueOf<In>) => Out,
): UnaryFunction<In, Observable<ObservedValueOf<Out>>>;
export function mergeMap<
	In extends ObservableInput,
	Out extends ObservableInput,
>(
	mapFn: (value: ObservedValueOf<In>) => Out = (value) => value as Out,
): UnaryFunction<In, Observable<ObservedValueOf<Out>>> {
	return (source) =>
		new Observable((subscriber) =>
			from(source).subscribe({
				...subscriber,
				next: (value) => from(mapFn(value)).subscribe(subscriber),
			}),
		);
}
