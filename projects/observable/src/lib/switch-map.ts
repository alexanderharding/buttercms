import { Observable } from './observable';
import { ObservableInput, from, ObservedValueOf } from './from';
import { UnaryFunction } from './unary-function';

export function switchMap<
	In extends ObservableInput,
	Out extends ObservableInput,
>(
	mapFn: (value: ObservedValueOf<In>) => Out,
): UnaryFunction<In, Observable<ObservedValueOf<Out>>> {
	return (source) =>
		new Observable((subscriber) => {
			if (subscriber.signal.aborted) return;

			let controller: AbortController | null;
			subscriber.signal.addEventListener('abort', () => setController(null), {
				signal: subscriber.signal,
			});

			from(source).subscribe({
				...subscriber,
				next: (value) => {
					controller = setController(new AbortController());
					controller.signal.addEventListener(
						'abort',
						() => (controller = null),
						{ signal: controller.signal },
					);
					from(mapFn(value)).subscribe({
						...subscriber,
						signal: controller.signal,
					});
				},
			});

			function setController<Value extends AbortController | null>(
				value: Value,
			): Value {
				controller?.abort();
				controller = value;
				return value;
			}
		});
}
