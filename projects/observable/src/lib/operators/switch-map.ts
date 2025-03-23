import {
	Observable,
	Subscriber,
	type ObservableInput,
	from,
	type ObservedValueOf,
} from '../observable';
import type { UnaryFunction } from '../pipe';

export function switchMap<
	In extends ObservableInput,
	Out extends ObservableInput,
>(
	mapFn: (value: ObservedValueOf<In>) => Out,
): UnaryFunction<In, Observable<ObservedValueOf<Out>>> {
	return (source) =>
		new Observable((subscriber) => {
			let controller: AbortController | null;

			from(source).subscribe({ ...subscriber, next });

			new Subscriber({
				signal: subscriber.signal,
				finalize: () => setController(null),
			});

			function next(value: ObservedValueOf<In>): void {
				const { signal } = setController(new AbortController());
				from(mapFn(value)).subscribe({ ...subscriber, signal });
			}

			function setController<Value extends AbortController | null>(
				value: Value,
			): Value {
				controller?.abort();
				controller = value;
				return value;
			}
		});
}
