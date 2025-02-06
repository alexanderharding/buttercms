import { ObservableInput, from, InteropObservable } from './input';
import { Observable } from './observable';

export function defer<Value>(
	factory: () => InteropObservable<Value>,
): Observable<Value>;
export function defer<Value>(
	factory: () => ArrayLike<Value>,
): Observable<Value>;
export function defer<Value>(
	factory: () => PromiseLike<Value>,
): Observable<Value>;
export function defer<Value>(
	factory: () => AsyncIterable<Value>,
): Observable<Value>;
export function defer<Value>(factory: () => Iterable<Value>): Observable<Value>;
export function defer<Value>(
	factory: () => Pick<ReadableStream<Value>, 'getReader'>,
): Observable<Value>;
export function defer<Value>(
	factory: () => ObservableInput<Value>,
): Observable<Value>;
export function defer<Value>(
	factory: () => ObservableInput<Value>,
): Observable<Value> {
	return new Observable((subscriber) => from(factory()).subscribe(subscriber));
}
