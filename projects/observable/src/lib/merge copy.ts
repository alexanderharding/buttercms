import { ObservableInput, from } from './from';
import { Observable } from './observable';
import { empty } from './empty';
import { UnaryFunction } from './unary-function';
import { never } from './never';
import { of } from './of';
import { abort } from 'abort-signal-interop';

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

export function timer(due: number): Observable<0> {
	if (due < 0) return empty;
	if (due === 0) return of(0);
	if (due === Infinity) return never;
	return new Observable<0>((subscriber) => {
		if (subscriber.signal.aborted) return;
		const timeout = setTimeout(() => subscriber.next(0), due);
		subscriber.signal.addEventListener('abort', () => clearTimeout(timeout), {
			signal: subscriber.signal,
		});
	}).pipe(take(1));
}

const c = new AbortController();
timer(1000).subscribe({
	next: (value) => console.log(value),
	signal: abort(null),
});

c.abort(null);
