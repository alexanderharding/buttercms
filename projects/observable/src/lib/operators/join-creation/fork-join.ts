import { AnyCatcher } from '../../any-catcher';
import { empty, Observable } from '../../observable';
import { from, ObservableInput, ObservedValuesOf } from '../creation';
import { throwError } from '../creation';

/**
 * You have passed `any` here, we can't figure out if it is
 * an array or an object, so you're getting `unknown`. Use better types.
 * @param sources Something typed as `any`
 */
export function forkJoin<T extends AnyCatcher>(sources: T): Observable;
/**
 * Accepts an `Array` of {@link ObservableInput} or a dictionary `Object` of {@link ObservableInput} and returns
 * an {@link Observable} that emits either an array of values in the exact same order as the passed array,
 * or a dictionary of values in the same shape as the passed dictionary.
 *
 * <span class="informal">Wait for Observables to complete and then combine last values they emitted;
 * complete immediately if an empty array is passed.</span>
 *
 * ![](forkJoin.png)
 *
 * `forkJoin` is an operator that takes any number of input observables which can be passed either as an array
 * or a dictionary of input observables. If no input observables are provided (e.g. an empty array is passed),
 * then the resulting stream will complete immediately.
 *
 * `forkJoin` will wait for all passed observables to emit and complete and then it will emit an array or an object with last
 * values from corresponding observables.
 *
 * If you pass an array of `n` observables to the operator, then the resulting
 * array will have `n` values, where the first value is the last one emitted by the first observable,
 * second value is the last one emitted by the second observable and so on.
 *
 * If you pass a dictionary of observables to the operator, then the resulting
 * objects will have the same keys as the dictionary passed, with their last values they have emitted
 * located at the corresponding key.
 *
 * That means `forkJoin` will not emit more than once and it will complete after that. If you need to emit combined
 * values not only at the end of the lifecycle of passed observables, but also throughout it, try out {@link combineLatest}
 * or {@link zip} instead.
 *
 * In order for the resulting array to have the same length as the number of input observables, whenever any of
 * the given observables completes without emitting any value, `forkJoin` will complete at that moment as well
 * and it will not emit anything either, even if it already has some last values from other observables.
 * Conversely, if there is an observable that never completes, `forkJoin` will never complete either,
 * unless at any point some other observable completes without emitting a value, which brings us back to
 * the previous case. Overall, in order for `forkJoin` to emit a value, all given observables
 * have to emit something at least once and complete.
 *
 * If any given observable errors at some point, `forkJoin` will error as well and immediately unsubscribe
 * from the other observables.
 *
 * Optionally `forkJoin` accepts a `resultSelector` function, that will be called with values which normally
 * would land in the emitted array. Whatever is returned by the `resultSelector`, will appear in the output
 * observable instead. This means that the default `resultSelector` can be thought of as a function that takes
 * all its arguments and puts them into an array. Note that the `resultSelector` will be called only
 * when `forkJoin` is supposed to emit a result.
 *
 * ## Examples
 *
 * Use `forkJoin` with a dictionary of observable inputs
 *
 * ```ts
 * import { forkJoin, of, timer } from 'rxjs';
 *
 * const observable = forkJoin({
 *   foo: of(1, 2, 3, 4),
 *   bar: Promise.resolve(8),
 *   baz: timer(4000)
 * });
 * observable.subscribe({
 *  next: value => console.log(value),
 *  complete: () => console.log('This is how it ends!'),
 * });
 *
 * // Logs:
 * // { foo: 4, bar: 8, baz: 0 } after 4 seconds
 * // 'This is how it ends!' immediately after
 * ```
 *
 * Use `forkJoin` with an array of observable inputs
 *
 * ```ts
 * import { forkJoin, of, timer } from 'rxjs';
 *
 * const observable = forkJoin([
 *   of(1, 2, 3, 4),
 *   Promise.resolve(8),
 *   timer(4000)
 * ]);
 * observable.subscribe({
 *  next: value => console.log(value),
 *  complete: () => console.log('This is how it ends!'),
 * });
 *
 * // Logs:
 * // [4, 8, 0] after 4 seconds
 * // 'This is how it ends!' immediately after
 * ```
 *
 * @see {@link combineLatest}
 * @see {@link zip}
 *
 * @param args Any number of `ObservableInput`s provided either as an array or as an object
 * passed directly to the operator.
 * @return Observable emitting either an array of last values emitted by passed Observables
 * or value from project function.
 */
export function forkJoin(sources: null | undefined): Observable<never>;
export function forkJoin(sources: readonly []): Observable<never>;
export function forkJoin<const Inputs extends Readonly<Record<never, never>>>(
	inputs: Inputs,
): Observable<never>;
export function forkJoin<
	const Inputs extends
		| ReadonlyArray<ObservableInput>
		| Readonly<Record<PropertyKey, ObservableInput>>,
>(inputs: Inputs): Observable<ObservedValuesOf<Inputs>>;
export function forkJoin(
	inputs:
		| ReadonlyArray<ObservableInput>
		| Readonly<Record<PropertyKey, ObservableInput>>
		| null
		| undefined,
): Observable<ReadonlyArray<unknown> | Readonly<Record<PropertyKey, unknown>>> {
	const parts = arrayOrObject(inputs);

	if (!parts) {
		return throwError(
			() => new TypeError('sources must be an array or object'),
		);
	}

	const { args: normalizedInputs, keys } = parts;

	if (normalizedInputs.length === 0) {
		// If no observables are passed, or someone has passed an empty array
		// of observables, or even an empty object POJO, we need to just
		// complete (EMPTY), but we have to honor the scheduler provided if any.
		return empty;
	}

	return new Observable((subscriber) => {
		const { length } = normalizedInputs;
		// A store for the values each observable has emitted so far. We match observable to value on index.
		const values = new Array<unknown>(length);
		// The number of inner sources that still haven't emitted the first value
		// We need to track this because all sources need to emit one value in order
		// to start emitting values.
		let remainingEmissions = length;
		// The number of inner sources that still haven't completed
		// We need to track this because all sources need to complete in order
		// to emit the final value.
		let remainingCompletions = length;
		// The loop to kick off subscription. We're keying everything with it's index to relate the observables passed
		// in to the slot in the output array or the key in the array of keys in the output dictionary.
		normalizedInputs.forEach((input, index) => {
			from(input).subscribe({ ...subscriber, next, complete, finalize });

			function next(value: unknown): void {
				const hasValue = index in values;
				// When we get a value, record it in our set of values.
				values[index] = value;
				// If this is our first value, record that.
				if (!hasValue) remainingEmissions--;
			}

			function complete(): void {
				remainingCompletions--;
			}

			function finalize(): void {
				const hasValue = index in values;
				if (remainingCompletions && hasValue) return;

				if (remainingEmissions === 0) {
					subscriber.next(keys ? createObject(keys, values) : values);
					subscriber.complete();
					return;
				}

				subscriber.error(new Error('No elements in sequence'));
			}
		});
	});
}

function createObject(
	keys: ReadonlyArray<string>,
	values: ReadonlyArray<unknown>,
): Readonly<Record<PropertyKey, unknown>> {
	return keys.reduce<Record<PropertyKey, unknown>>(
		(result, key, i) => ((result[key] = values[i]), result),
		{},
	);
}

function arrayOrObject<T, O extends Readonly<Record<string, T>>>(
	first: T | Array<T> | O | null | undefined,
):
	| Readonly<{ args: ReadonlyArray<T>; keys: null }>
	| Readonly<{ args: ReadonlyArray<T>; keys: ReadonlyArray<string> }>
	| null {
	if (Array.isArray(first)) return { args: first, keys: null };
	if (!isPojo(first)) return null;
	const keys = Object.keys(first);
	return { args: keys.map((key) => first[key]), keys };
}

function isPojo(obj: unknown): obj is object {
	return (
		!!obj &&
		typeof obj === 'object' &&
		Object.getPrototypeOf(obj) === Object.prototype
	);
}
