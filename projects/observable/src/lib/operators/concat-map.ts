import { ObservableInput, from, ObservedValueOf } from '../observable/from';
import { Observable } from '../observable/observable';
import { UnaryFunction } from '../pipe/unary-function';

export function concatMap<
	In extends ObservableInput,
	Out extends ObservableInput,
>(
	mapFn: (value: ObservedValueOf<In>) => Out,
): UnaryFunction<In, Observable<ObservedValueOf<Out>>> {
	return (source) =>
		new Observable((subscriber) => {
			const queue: Array<ObservedValueOf<In>> = [];
			from(source).subscribe({
				...subscriber,
				next: (value) => {
					if (queue.length) queue.push(value);
					else from(mapFn(value)).subscribe(subscriber);
				},
				complete: () => {
					const value = queue.shift();
					if (value !== void 0) from(mapFn(value)).subscribe(subscriber);
					else subscriber.complete();
				},
				finalize: () => (queue.length = 0),
			});
		});
}
