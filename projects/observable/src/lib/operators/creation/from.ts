import { Observable, Subscriber } from '../../observable';
import { throwError } from './throw-error';
import { AnyCatcher } from '../../any-catcher';

/** @public */
export const observable = Symbol('Interop Observable');

/** @public */
export interface InteropObservable<Value = unknown> {
	[observable](): Subscribable<Value>;
}

/** @public */
export interface Subscribable<Value = unknown> {
	subscribe(subscriber: Subscriber<Value>): void;
}

export type ObservableInput<Value = unknown> =
	| InteropObservable<Value>
	| ArrayLike<Value>
	| PromiseLike<Value>
	| AsyncIterable<Value>
	| Iterable<Value>
	| ReadableStreamLike<Value>;

/**
 * Similar to {@linkcode ObservedValueOf} except that it can be used with a record
 * or array of {@linkcode ObservableInput}'s.
 * @public
 */
export type ObservedValuesOf<
	Inputs extends
		| Readonly<Record<PropertyKey, ObservableInput>>
		| ReadonlyArray<ObservableInput>,
> = Readonly<{
	[Key in keyof Inputs]: Inputs[Key] extends ObservableInput
		? ObservedValueOf<Inputs[Key]>
		: unknown;
}>;

/**
 * @public
 */
export type ReadableStreamLike<Value = unknown> = Pick<
	ReadableStream<Value>,
	'getReader'
>;

/**
 * Used by the {@linkcode from} function to resolve the type of an {@linkcode ObservableInput} in the order of priority.
 * @public
 */
export type ObservedValueOf<Input extends ObservableInput> =
	Input extends InteropObservable<infer Value>
		? Value
		: Input extends ArrayLike<infer Value>
			? Value
			: Input extends PromiseLike<infer Value>
				? Value
				: Input extends AsyncIterable<infer Value>
					? Value
					: Input extends Iterable<infer Value>
						? Value
						: Input extends ReadableStreamLike<infer Value>
							? Value
							: never;

/**
 * You have passed `any` here, we can't figure out what type of input you're passing,
 * so you're getting `unknown`. Use better types.
 * @param input Something typed as `any`
 * @public
 */
export function from<Input extends AnyCatcher>(input: Input): Observable;
/**
 * You have passed `null` or `undefined` here, so your going to get an Observable that emits
 * a `TypeError` through the `error` notification. This is unlikely to be what you want.
 * @param input Something typed as `null` or `undefined`
 * @public
 */
export function from(input: null | undefined): Observable<never>;
/**
 * Creates an Observable from an {@linkcode Input|ObservableInput} in the following order of priority:
 * 1. {@linkcode InteropObservable}
 * 2. {@linkcode ArrayLike}
 * 3. {@linkcode PromiseLike}
 * 4. {@linkcode AsyncIterable}
 * 5. {@linkcode Iterable}
 * 6. {@linkcode ReadableStreamLike}
 * @public
 */
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

	// The user has ticked the TSC. We will still return an Observable, but it will
	// emit a `TypeError` through the `error` notification. We use a try/catch
	// so that the thrown error has a stack trace.
	try {
		throw new TypeError('value must be an ObservableInput');
	} catch (error) {
		return throwError(() => error);
	}
}

/** @internal */
function fromReadableStreamLike<Value>(
	readableStream: Pick<ReadableStream<Value>, 'getReader'>,
): Observable<Value> {
	return fromAsyncIterable(readableStreamLikeToAsyncGenerator(readableStream));
}

/** @internal */
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

/** @internal */
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

/** @internal */
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

/** @internal */
function fromAsyncIterable<Value>(
	asyncIterable: AsyncIterable<Value>,
): Observable<Value> {
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

/** @internal */
function fromIterable<Value>(iterable: Iterable<Value>): Observable<Value> {
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

/** @internal */
function fromInteropObservable<Value>(
	interopObservable: InteropObservable<Value>,
): Observable<Value>;
function fromInteropObservable(
	interopObservable: InteropObservable,
): Observable {
	// If an instance of one of our Observables, just return it.
	if (interopObservable instanceof Observable) return interopObservable;
	return new Observable((subscriber) => {
		if (typeof interopObservable[observable] === 'function') {
			return interopObservable[observable]().subscribe(subscriber);
		}
		// Should be caught by observable subscribe function error handling.
		throw new TypeError(
			"Provided object does not correctly implement the 'observable' Symbol",
		);
	});
}

/** @internal */
function isArrayLike<Value>(x: unknown): x is ArrayLike<Value> {
	return (
		!!x &&
		typeof x === 'object' &&
		'length' in x &&
		typeof x.length === 'number' &&
		typeof x !== 'function'
	);
}

/** @internal */
function isIterable<Value>(value: unknown): value is Iterable<Value> {
	return (
		!!value &&
		typeof value === 'object' &&
		Symbol.iterator in value &&
		typeof value[Symbol.iterator] === 'function'
	);
}

/** @internal */
function isAsyncIterable<Value>(value: unknown): value is AsyncIterable<Value> {
	return (
		!!value &&
		typeof value === 'object' &&
		Symbol.asyncIterator in value &&
		typeof value[Symbol.asyncIterator] === 'function'
	);
}

/** @internal */
function isPromiseLike<Value>(value: unknown): value is PromiseLike<Value> {
	return (
		!!value &&
		(typeof value === 'object' || typeof value === 'function') &&
		'then' in value &&
		typeof value.then === 'function'
	);
}

/** @internal */
function isReadableStreamLike<Value>(
	value: unknown,
): value is ReadableStreamLike<Value> {
	return (
		!!value &&
		typeof value === 'object' &&
		'getReader' in value &&
		typeof value.getReader === 'function'
	);
}

/** @internal */
function isInteropObservable<Value>(
	value: unknown,
): value is InteropObservable<Value> {
	return (
		!!value &&
		typeof value === 'object' &&
		observable in value &&
		typeof value[observable] === 'function'
	);
}
