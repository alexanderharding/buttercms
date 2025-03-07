import { ObservableInput, ObservedValueOf, from } from './from';
import { Observable } from './observable';
import { empty } from './empty';
import { UnaryFunction } from './unary-function';
import { never } from './never';
import { of } from './of';
import { Subscriber } from 'subscriber';
import { asyncScheduler } from 'rxjs';

export function take<Value>(
	count: number,
): UnaryFunction<ObservableInput<Value>, Observable<Value>> {
	return (source) => {
		// If we are taking no values, that's empty.
		if (count <= 0) return empty;

		return new Observable((subscriber) => {
			let seen = 0;
			from(source).subscribe({
				...subscriber,
				next: (value) => {
					// Increment the number of values we have seen,
					// then check it against the allowed count to see
					// if we are still letting values through.
					if (++seen > count) return;
					subscriber.next(value);
					// If we have met or passed our allowed count,
					// we need to complete. We have to do <= here,
					// because re-entrant code will increment `seen` twice.
					if (count <= seen) subscriber.complete();
				},
			});
		});
	};
}

export function fromEventListener<T extends Event>(
	target: Pick<EventTarget, 'addEventListener'>,
	type: string,
): Observable<T>;
export function fromEventListener(
	target: Pick<EventTarget, 'addEventListener'>,
	type: string,
): Observable<Event> {
	return new Observable((subscriber) =>
		target.addEventListener(type, (event) => subscriber.next(event), {
			signal: subscriber.signal,
		}),
	);
}

export function timer(due: number | Date): Observable<0> {
	const ms = typeof due === 'number' ? due : due.getTime() - Date.now();
	if (ms < 0) return empty;
	if (ms === 0) return of(0);
	if (ms === Infinity) return never;
	return new Observable<0>((subscriber) => {
		if (subscriber.signal.aborted) return;
		const { signal } = subscriber;
		const timeout = globalThis.setTimeout(() => subscriber.next(0), ms);
		fromEventListener(signal, 'abort').subscribe({
			next: () => globalThis.clearTimeout(timeout),
			error: (error) => subscriber.error(error),
			signal,
		});
	});
}
