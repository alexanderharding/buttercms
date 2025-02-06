import { Subscriber } from 'subscriber';
import { ObservableInput, from, InteropObservable } from './input';
import { Observable } from './observable';
import { UnaryFunction } from './unary-function';

export function toPromise<T>(
	map: (value: T) => InteropObservable<T>,
): UnaryFunction<InteropObservable<T>, Promise<T>>;
export function toPromise<T>(
	map: (value: T) => InteropObservable<T>,
): UnaryFunction<ArrayLike<T>, Promise<T>>;
export function toPromise<T>(
	map: (value: T) => InteropObservable<T>,
): UnaryFunction<PromiseLike<T>, Promise<T>>;
export function toPromise<T>(
	map: (value: T) => InteropObservable<T>,
): UnaryFunction<AsyncIterable<T>, Promise<T>>;
export function toPromise<T>(
	map: (value: T) => InteropObservable<T>,
): UnaryFunction<Iterable<T>, Promise<T>>;
export function toPromise<T>(
	map: (value: T) => InteropObservable<T>,
): UnaryFunction<ObservableInput<T>, Promise<T>>;

export function toPromise<T>(
	map: (value: T) => ArrayLike<T>,
): UnaryFunction<InteropObservable<T>, Promise<T>>;
export function toPromise<T>(
	map: (value: T) => ArrayLike<T>,
): UnaryFunction<ArrayLike<T>, Promise<T>>;
export function toPromise<T>(
	map: (value: T) => ArrayLike<T>,
): UnaryFunction<PromiseLike<T>, Promise<T>>;
export function toPromise<T>(
	map: (value: T) => ArrayLike<T>,
): UnaryFunction<AsyncIterable<T>, Promise<T>>;
export function toPromise<T>(
	map: (value: T) => ArrayLike<T>,
): UnaryFunction<Iterable<T>, Promise<T>>;
export function toPromise<T>(
	map: (value: T) => ArrayLike<T>,
): UnaryFunction<ObservableInput<T>, Promise<T>>;

export function toPromise<T>(
	map: (value: T) => PromiseLike<T>,
): UnaryFunction<InteropObservable<T>, Promise<T>>;
export function toPromise<T>(
	map: (value: T) => PromiseLike<T>,
): UnaryFunction<ArrayLike<T>, Promise<T>>;
export function toPromise<T>(
	map: (value: T) => PromiseLike<T>,
): UnaryFunction<PromiseLike<T>, Promise<T>>;
export function toPromise<T>(
	map: (value: T) => PromiseLike<T>,
): UnaryFunction<AsyncIterable<T>, Promise<T>>;
export function toPromise<T>(
	map: (value: T) => PromiseLike<T>,
): UnaryFunction<Iterable<T>, Promise<T>>;
export function toPromise<T>(
	map: (value: T) => PromiseLike<T>,
): UnaryFunction<ObservableInput<T>, Promise<T>>;

export function toPromise<T>(
	map: (value: T) => AsyncIterable<T>,
): UnaryFunction<InteropObservable<T>, Promise<T>>;
export function toPromise<T>(
	map: (value: T) => AsyncIterable<T>,
): UnaryFunction<ArrayLike<T>, Promise<T>>;
export function toPromise<T>(
	map: (value: T) => AsyncIterable<T>,
): UnaryFunction<PromiseLike<T>, Promise<T>>;
export function toPromise<T>(
	map: (value: T) => AsyncIterable<T>,
): UnaryFunction<AsyncIterable<T>, Promise<T>>;
export function toPromise<T>(
	map: (value: T) => AsyncIterable<T>,
): UnaryFunction<Iterable<T>, Promise<T>>;
export function toPromise<T>(
	map: (value: T) => AsyncIterable<T>,
): UnaryFunction<ObservableInput<T>, Promise<T>>;

export function toPromise<T>(
	map: (value: T) => Iterable<T>,
): UnaryFunction<InteropObservable<T>, Promise<T>>;
export function toPromise<T>(
	map: (value: T) => Iterable<T>,
): UnaryFunction<ArrayLike<T>, Promise<T>>;
export function toPromise<T>(
	map: (value: T) => Iterable<T>,
): UnaryFunction<PromiseLike<T>, Promise<T>>;
export function toPromise<T>(
	map: (value: T) => Iterable<T>,
): UnaryFunction<AsyncIterable<T>, Promise<T>>;
export function toPromise<T>(
	map: (value: T) => Iterable<T>,
): UnaryFunction<Iterable<T>, Promise<T>>;
export function toPromise<T>(
	map: (value: T) => Iterable<T>,
): UnaryFunction<ObservableInput<T>, Promise<T>>;

export function toPromise<T>(
	map: (value: T) => ObservableInput<T>,
): UnaryFunction<InteropObservable<T>, Promise<T>>;
export function toPromise<T>(
	map: (value: T) => ObservableInput<T>,
): UnaryFunction<ArrayLike<T>, Promise<T>>;
export function toPromise<T>(
	map: (value: T) => ObservableInput<T>,
): UnaryFunction<PromiseLike<T>, Promise<T>>;
export function toPromise<T>(
	map: (value: T) => ObservableInput<T>,
): UnaryFunction<AsyncIterable<T>, Promise<T>>;
export function toPromise<T>(
	map: (value: T) => ObservableInput<T>,
): UnaryFunction<Iterable<T>, Promise<T>>;
export function toPromise<T>(
	map: (value: T) => ObservableInput<T>,
): UnaryFunction<ObservableInput<T>, Promise<T>>;

export function toPromise<T>(): UnaryFunction<ObservableInput<T>, Promise<T>> {
	return async (source) =>
		new Promise((resolve, reject) => {
			from(source).subscribe({ next: resolve, error: reject });
		});
}
