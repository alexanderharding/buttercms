import { ObservableInput, from, InteropObservable } from './input';
import { Observable } from './observable';
import { empty } from './empty';
import { UnaryFunction } from './unary-function';
import { fromFetch } from 'rxjs/fetch';

export function take<T>(
	count: number,
): UnaryFunction<InteropObservable<T>, Observable<T>>;
export function take<T>(
	count: number,
): UnaryFunction<ArrayLike<T>, Observable<T>>;
export function take<T>(
	count: number,
): UnaryFunction<PromiseLike<T>, Observable<T>>;
export function take<T>(
	count: number,
): UnaryFunction<AsyncIterable<T>, Observable<T>>;
export function take<T>(
	count: number,
): UnaryFunction<Iterable<T>, Observable<T>>;
export function take<T>(
	count: number,
): UnaryFunction<ObservableInput<T>, Observable<T>>;
export function take<T>(
	count: number,
): UnaryFunction<ObservableInput<T>, Observable<T>> {
	return (source) => {
		// If we are taking no values, that's empty.
		if (count <= 0) return empty;

		return new Observable((subscriber) => {
			let seen = 0;
			return from(source).subscribe({
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
