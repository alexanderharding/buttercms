import { ObservableInput, from, ObservedValueOf } from './from';
import { Observable } from './observable';
import { concatMap } from 'rxjs';
import { UnaryFunction } from './unary-function';

export function concatMap<
	In extends ObservableInput,
	Out extends ObservableInput,
>(
	mapFn: (value: ObservedValueOf<In>) => Out,
): UnaryFunction<In, Observable<ObservedValueOf<Out>>> {
	return (source) =>
		new Observable((subscriber) => {
			if (subscriber.signal.aborted) return;
			let queue: Array<ObservedValueOf<In>> = [];
			subscriber.signal.addEventListener('abort', () => (queue = []));
			from(source).subscribe({
				...subscriber,
				next: (value) => {
					if (queue.length) queue.push(value);
					else from(mapFn(value)).subscribe(subscriber);
				},
				complete: () => {
					// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
					if (queue.length) from(mapFn(queue.shift()!)).subscribe(subscriber);
					else subscriber.complete();
				},
			});
		});
}
