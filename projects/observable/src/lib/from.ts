import { subscribe, Observable, TeardownLogic } from './observable';
import { Observer, Subscriber } from 'subscriber';

/**
 * An object that implements the `InteropObservable` interface.
 */
export interface InteropObservable<Value = unknown> {
	[subscribe](subscriber: Subscriber<Value>): TeardownLogic;
}
export interface Subscribable<Value = unknown> {
	subscribe(observer: Observer<Value>): void;
}

function isSubscribable<Value>(value: unknown): value is Subscribable<Value> {
	return (
		typeof value === 'object' &&
		value !== null &&
		'subscribe' in value &&
		typeof value.subscribe === 'function'
	);
}

export type ObservableInput<Value = unknown> =
	| Subscribable<Value>
	| ArrayLike<Value>
	| PromiseLike<Value>
	| AsyncIterable<Value>
	| Iterable<Value>
	| Pick<ReadableStream<Value>, 'getReader'>;

export type ObservedValuesOf<Inputs extends ReadonlyArray<ObservableInput>> =
	Readonly<{ [K in keyof Inputs]: ObservedValueOf<Inputs[K]> }>;

export type ObservedValueOf<Input extends ObservableInput> =
	Input extends Subscribable<infer T>
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

export function from<const Input extends ObservableInput>(
	input: Input,
): Observable<ObservedValueOf<Input>>;
export function from(value: ObservableInput): Observable {
	if (isSubscribable(value)) return fromSubscribable(value);

	if (isArrayLike(value)) return fromArrayLike(value);

	if (isPromiseLike(value)) return fromPromise(value);

	if (isAsyncIterable(value)) return fromAsyncIterable(value);

	if (isIterable(value)) return fromIterable(value);

	if (isReadableStreamLike(value)) return fromReadableStreamLike(value);

	throw new Error('Invalid input');
}

/**
 * Creates an RxJS Observable from an object that implements `observable` Symbol.
 * @param obj An object that properly implements `observable` Symbol.
 */
export function fromSubscribable<T>(obj: Subscribable<T>): Observable<T>;
export function fromSubscribable(obj: Subscribable): Observable {
	// If an instance of one of our Observables, just return it.
	if (obj instanceof Observable) return obj;
	return new Observable((subscriber) => {
		if (typeof obj.subscribe !== 'function') {
			// Should be caught by observable subscribe function error handling.
			throw new TypeError(
				'Provided object does not correctly implement subscribe method',
			);
		}
		obj.subscribe(subscriber);
	});
}

export function fromReadableStreamLike<T>(
	readableStream: Pick<ReadableStream<T>, 'getReader'>,
) {
	return fromAsyncIterable(readableStreamLikeToAsyncGenerator(readableStream));
}

export async function* readableStreamLikeToAsyncGenerator<T>(
	readableStream: Pick<ReadableStream<T>, 'getReader'>,
): AsyncGenerator<T> {
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

/**
 * Synchronously emits the values of an array like and completes.
 * This is exported because there are creation functions and operators that need to
 * make direct use of the same logic, and there's no reason to make them run through
 * `from` conditionals because we *know* they're dealing with an array.
 * @param array The array to emit values from
 */
export function fromArrayLike<T>(array: ArrayLike<T>): Observable<T> {
	return new Observable<T>((subscriber) => {
		// Loop over the array and emit each value. Note two things here:
		// 1. We're making sure that the subscriber is not closed on each loop.
		//    This is so we don't continue looping over a very large array after
		//    something like a `take`, `takeWhile`, or other synchronous unsubscription
		//    has already unsubscribed.
		// 2. In this form, reentrant code can alter that array we're looping over.
		//    This is a known issue, but considered an edge case. The alternative would
		//    be to copy the array before executing the loop, but this has
		//    performance implications.
		const length = array.length;
		for (let i = 0; i < length; i++) {
			if (subscriber.signal.aborted) return;
			subscriber.next(array[i]);
		}
		subscriber.complete();
	});
}

export function fromPromise<T>(promise: PromiseLike<T>): Observable<T> {
	return new Observable((subscriber) => {
		promise.then(
			(value) => {
				// A side-effect may have closed our subscriber,
				// check before the resolved value is emitted.
				if (subscriber.signal.aborted) return;
				subscriber.next(value);
				subscriber.complete();
			},
			(err) => subscriber.error(err),
		);
	});
}

export function fromAsyncIterable<T>(
	asyncIterable: AsyncIterable<T>,
): Observable<T> {
	return new Observable(
		(subscriber) =>
			void (async () => {
				try {
					for await (const value of asyncIterable) {
						subscriber.next(value);
						// A side-effect may have closed our subscriber,
						// check before the next iteration.
						if (subscriber.signal.aborted) return;
					}
					subscriber.complete();
				} catch (err) {
					subscriber.error(err);
				}
			})(),
	);
}

export function fromIterable<T>(iterable: Iterable<T>): Observable<T> {
	return new Observable((subscriber) => {
		for (const value of iterable) {
			subscriber.next(value);
			// A side-effect may have closed our subscriber,
			// check before the next iteration.
			if (subscriber.signal.aborted) return;
		}
		subscriber.complete();
	});
}

export function isArrayLike<T>(x: unknown): x is ArrayLike<T> {
	return (
		!!x &&
		typeof x === 'object' &&
		'length' in x &&
		typeof x.length === 'number' &&
		typeof x !== 'function'
	);
}

export function isIterable<T>(x: unknown): x is Iterable<T> {
	return (
		!!x &&
		typeof x === 'object' &&
		Symbol.iterator in x &&
		typeof x[Symbol.iterator] === 'function'
	);
}

export function isAsyncIterable<T>(x: unknown): x is AsyncIterable<T> {
	return (
		!!x &&
		typeof x === 'object' &&
		Symbol.asyncIterator in x &&
		typeof x[Symbol.asyncIterator] === 'function'
	);
}

export function isPromiseLike<T>(x: unknown): x is PromiseLike<T> {
	return (
		!!x &&
		(typeof x === 'object' || typeof x === 'function') &&
		'then' in x &&
		typeof x.then === 'function'
	);
}

export function isReadableStreamLike<T>(
	x: unknown,
): x is Pick<ReadableStream<T>, 'getReader'> {
	return (
		!!x &&
		typeof x === 'object' &&
		'getReader' in x &&
		typeof x.getReader === 'function'
	);
}

export function isInteropObservable<T>(x: unknown): x is InteropObservable<T> {
	return (
		!!x &&
		typeof x === 'object' &&
		subscribe in x &&
		typeof x[subscribe] === 'function'
	);
}
