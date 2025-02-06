import { ObservableInput, from, InteropObservable } from './input';
import { Observable } from './observable';
import { UnaryFunction } from './unary-function';
import { concatMap as rxConcatMap } from 'rxjs/operators';

export function concatMap<T, R>(
	map: (value: T) => InteropObservable<R>,
): UnaryFunction<InteropObservable<T>, Observable<R>>;
export function concatMap<T, R>(
	map: (value: T) => InteropObservable<R>,
): UnaryFunction<ArrayLike<T>, Observable<R>>;
export function concatMap<T, R>(
	map: (value: T) => InteropObservable<R>,
): UnaryFunction<PromiseLike<T>, Observable<R>>;
export function concatMap<T, R>(
	map: (value: T) => InteropObservable<R>,
): UnaryFunction<AsyncIterable<T>, Observable<R>>;
export function concatMap<T, R>(
	map: (value: T) => InteropObservable<R>,
): UnaryFunction<Iterable<T>, Observable<R>>;
export function concatMap<T, R>(
	map: (value: T) => InteropObservable<R>,
): UnaryFunction<ObservableInput<T>, Observable<R>>;

export function concatMap<T, R>(
	map: (value: T) => ArrayLike<R>,
): UnaryFunction<InteropObservable<T>, Observable<R>>;
export function concatMap<T, R>(
	map: (value: T) => ArrayLike<R>,
): UnaryFunction<ArrayLike<T>, Observable<R>>;
export function concatMap<T, R>(
	map: (value: T) => ArrayLike<R>,
): UnaryFunction<PromiseLike<T>, Observable<R>>;
export function concatMap<T, R>(
	map: (value: T) => ArrayLike<R>,
): UnaryFunction<AsyncIterable<T>, Observable<R>>;
export function concatMap<T, R>(
	map: (value: T) => ArrayLike<R>,
): UnaryFunction<Iterable<T>, Observable<R>>;
export function concatMap<T, R>(
	map: (value: T) => ArrayLike<R>,
): UnaryFunction<ObservableInput<T>, Observable<R>>;

export function concatMap<T, R>(
	map: (value: T) => PromiseLike<R>,
): UnaryFunction<InteropObservable<T>, Observable<R>>;
export function concatMap<T, R>(
	map: (value: T) => PromiseLike<R>,
): UnaryFunction<ArrayLike<T>, Observable<R>>;
export function concatMap<T, R>(
	map: (value: T) => PromiseLike<R>,
): UnaryFunction<PromiseLike<T>, Observable<R>>;
export function concatMap<T, R>(
	map: (value: T) => PromiseLike<R>,
): UnaryFunction<AsyncIterable<T>, Observable<R>>;
export function concatMap<T, R>(
	map: (value: T) => PromiseLike<R>,
): UnaryFunction<Iterable<T>, Observable<R>>;
export function concatMap<T, R>(
	map: (value: T) => PromiseLike<R>,
): UnaryFunction<ObservableInput<T>, Observable<R>>;

export function concatMap<T, R>(
	map: (value: T) => AsyncIterable<R>,
): UnaryFunction<InteropObservable<T>, Observable<R>>;
export function concatMap<T, R>(
	map: (value: T) => AsyncIterable<R>,
): UnaryFunction<ArrayLike<T>, Observable<R>>;
export function concatMap<T, R>(
	map: (value: T) => AsyncIterable<R>,
): UnaryFunction<PromiseLike<T>, Observable<R>>;
export function concatMap<T, R>(
	map: (value: T) => AsyncIterable<R>,
): UnaryFunction<AsyncIterable<T>, Observable<R>>;
export function concatMap<T, R>(
	map: (value: T) => AsyncIterable<R>,
): UnaryFunction<Iterable<T>, Observable<R>>;
export function concatMap<T, R>(
	map: (value: T) => AsyncIterable<R>,
): UnaryFunction<ObservableInput<T>, Observable<R>>;

export function concatMap<T, R>(
	map: (value: T) => Iterable<R>,
): UnaryFunction<InteropObservable<T>, Observable<R>>;
export function concatMap<T, R>(
	map: (value: T) => Iterable<R>,
): UnaryFunction<ArrayLike<T>, Observable<R>>;
export function concatMap<T, R>(
	map: (value: T) => Iterable<R>,
): UnaryFunction<PromiseLike<T>, Observable<R>>;
export function concatMap<T, R>(
	map: (value: T) => Iterable<R>,
): UnaryFunction<AsyncIterable<T>, Observable<R>>;
export function concatMap<T, R>(
	map: (value: T) => Iterable<R>,
): UnaryFunction<Iterable<T>, Observable<R>>;
export function concatMap<T, R>(
	map: (value: T) => Iterable<R>,
): UnaryFunction<ObservableInput<T>, Observable<R>>;

export function concatMap<T, R>(
	map: (value: T) => ObservableInput<R>,
): UnaryFunction<InteropObservable<T>, Observable<R>>;
export function concatMap<T, R>(
	map: (value: T) => ObservableInput<R>,
): UnaryFunction<ArrayLike<T>, Observable<R>>;
export function concatMap<T, R>(
	map: (value: T) => ObservableInput<R>,
): UnaryFunction<PromiseLike<T>, Observable<R>>;
export function concatMap<T, R>(
	map: (value: T) => ObservableInput<R>,
): UnaryFunction<AsyncIterable<T>, Observable<R>>;
export function concatMap<T, R>(
	map: (value: T) => ObservableInput<R>,
): UnaryFunction<Iterable<T>, Observable<R>>;
export function concatMap<T, R>(
	map: (value: T) => ObservableInput<R>,
): UnaryFunction<ObservableInput<T>, Observable<R>>;

export function concatMap<T, R>(
	map: (value: T) => ObservableInput<R>,
): UnaryFunction<ObservableInput<T>, Observable<R>> {
	return (source) =>
		new Observable((subscriber) =>
			from(source).subscribe({
				...subscriber,
				next: (value) => subscriber.add(from(map(value)).subscribe(subscriber)),
			}),
		);
}
