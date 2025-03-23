import { subscribe, Observable } from './observable';
import { throwError } from './throw-error';
import { AnyCatcher } from '../any-catcher';
import { UnaryFunction } from '../pipe';
import { Observer } from './subscriber';

export interface InteropObservable<Value = unknown> {
	[subscribe](
		observerOrNext?: Partial<Observer<Value>> | UnaryFunction<Value> | null,
	): void;
}

export type ObservableInput<Value = unknown> =
	| InteropObservable<Value>
	| ArrayLike<Value>
	| PromiseLike<Value>
	| AsyncIterable<Value>
	| Iterable<Value>
	| Pick<ReadableStream<Value>, 'getReader'>;

export type ObservedValuesOf<
	Inputs extends
		| Readonly<Record<PropertyKey, ObservableInput>>
		| ReadonlyArray<ObservableInput>,
> = Readonly<{
	[Key in keyof Inputs]: Inputs[Key] extends ObservableInput
		? ObservedValueOf<Inputs[Key]>
		: never;
}>;

export type ObservedValueOf<Input extends ObservableInput> =
	Input extends InteropObservable<infer T>
		? T
		: Input extends ArrayLike<infer T>
			? T
			: Input extends PromiseLike<infer T>
				? T
				: Input extends AsyncIterable<infer T>
					? T
					: Input extends Iterable<infer T>
						? T
						: Input extends Pick<ReadableStream<infer T>, 'getReader'>
							? T
							: never;

export function from<Input extends AnyCatcher>(input: Input): Observable;
export function from(input: null | undefined): Observable<never>;
export function from<const Input extends ObservableInput>(
	input: Input,
): Observable<ObservedValueOf<Input>>;
export function from(value: ObservableInput | null | undefined): Observable {
	if (isInteropObservable(value)) return fromInteropObservable(value);

	if (isArrayLike(value)) return fromArrayLike(value);

	if (isPromiseLike(value)) return fromPromise(value);

	if (isAsyncIterable(value)) return fromAsyncIterable(value);

	if (isIterable(value)) return fromIterable(value);

	if (isReadableStreamLike(value)) return fromReadableStreamLike(value);

	return throwError(() => new TypeError('value must be an ObservableInput'));
}

function fromReadableStreamLike<Value>(
	readableStream: Pick<ReadableStream<Value>, 'getReader'>,
): Observable<Value> {
	return fromAsyncIterable(readableStreamLikeToAsyncGenerator(readableStream));
}

async function* readableStreamLikeToAsyncGenerator<Value>(
	readableStream: Pick<ReadableStream<Value>, 'getReader'>,
): AsyncGenerator<Value> {
	const reader = readableStream.getReader();
	try {
		while (true) {
			const { value, done } = await reader.read();
			if (done) return;
			yield value;
		}
	} finally {
		reader.releaseLock();
	}
}

function fromArrayLike<Value>(array: ArrayLike<Value>): Observable<Value> {
	return new Observable<Value>((subscriber) => {
		// Loop over the array and emit each value. Note two things here:
		// 1. We're making sure that the subscriber is not aborted on each loop.
		//    This is so we don't continue looping over a very large array after
		//    something like a `take`, `takeWhile`, or other synchronous unsubscription
		//    has already unsubscribed.
		// 2. In this form, reentrant code can alter that array we're looping over.
		//    This is a known issue, but considered an edge case. The alternative would
		//    be to copy the array before executing the loop, but this has
		//    performance implications.
		const length = array.length;
		for (let i = 0; i < length && !subscriber.signal.aborted; i++) {
			subscriber.next(array[i]);
		}
		subscriber.complete();
	});
}

function fromPromise<Value>(promise: PromiseLike<Value>): Observable<Value> {
	return new Observable(async (subscriber) => {
		try {
			const value = await promise;
			// A side-effect may have aborted our subscriber,
			// check before the resolved value is emitted.
			if (subscriber.signal.aborted) return;
			subscriber.next(value);
			subscriber.complete();
		} catch (error) {
			subscriber.error(error);
		}
	});
}

function fromAsyncIterable<T>(asyncIterable: AsyncIterable<T>): Observable<T> {
	return new Observable(async (subscriber) => {
		try {
			for await (const value of asyncIterable) {
				subscriber.next(value);
				// A side-effect may have aborted our subscriber,
				// check before the next iteration.
				if (subscriber.signal.aborted) return;
			}
			subscriber.complete();
		} catch (err) {
			subscriber.error(err);
		}
	});
}

function fromIterable<T>(iterable: Iterable<T>): Observable<T> {
	return new Observable((subscriber) => {
		for (const value of iterable) {
			subscriber.next(value);
			// A side-effect may have aborted our subscriber,
			// check before the next iteration.
			if (subscriber.signal.aborted) return;
		}
		subscriber.complete();
	});
}

function fromInteropObservable<Value>(
	interopObservable: InteropObservable<Value>,
): Observable<Value>;
function fromInteropObservable(
	interopObservable: InteropObservable,
): Observable {
	// If an instance of one of our Observables, just return it.
	if (interopObservable instanceof Observable) return interopObservable;
	return new Observable((subscriber) => {
		if (typeof interopObservable[subscribe] === 'function') {
			return interopObservable[subscribe](subscriber);
		}
		// Should be caught by observable subscribe function error handling.
		throw new TypeError(
			"Provided object does not correctly implement the 'subscribe' Symbol",
		);
	});
}

function isArrayLike<Value>(x: unknown): x is ArrayLike<Value> {
	return (
		!!x &&
		typeof x === 'object' &&
		'length' in x &&
		typeof x.length === 'number' &&
		typeof x !== 'function'
	);
}

function isIterable<Value>(value: unknown): value is Iterable<Value> {
	return (
		!!value &&
		typeof value === 'object' &&
		Symbol.iterator in value &&
		typeof value[Symbol.iterator] === 'function'
	);
}

function isAsyncIterable<Value>(value: unknown): value is AsyncIterable<Value> {
	return (
		!!value &&
		typeof value === 'object' &&
		Symbol.asyncIterator in value &&
		typeof value[Symbol.asyncIterator] === 'function'
	);
}

function isPromiseLike<Value>(value: unknown): value is PromiseLike<Value> {
	return (
		!!value &&
		(typeof value === 'object' || typeof value === 'function') &&
		'then' in value &&
		typeof value.then === 'function'
	);
}

function isReadableStreamLike<Value>(
	value: unknown,
): value is Pick<ReadableStream<Value>, 'getReader'> {
	return (
		!!value &&
		typeof value === 'object' &&
		'getReader' in value &&
		typeof value.getReader === 'function'
	);
}

function isInteropObservable<Value>(
	value: unknown,
): value is InteropObservable<Value> {
	return (
		!!value &&
		typeof value === 'object' &&
		subscribe in value &&
		typeof value[subscribe] === 'function'
	);
}
