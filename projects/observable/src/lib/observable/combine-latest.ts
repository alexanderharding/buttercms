import { AnyCatcher } from '../any-catcher';
import { empty } from './empty';
import { from, ObservableInput, ObservedValuesOf } from './from';
import { Observable } from './observable';
import { throwError } from './throw-error';

/**
 * You have passed `any` here, we can't figure out if it is
 * an array or an object, so you're getting `unknown`. Use better types.
 * @param sources Something typed as `any`
 */
export function combineLatest<T extends AnyCatcher>(sources: T): Observable;
/**
 * Combines multiple Observables to create an Observable whose values are
 * calculated from the latest values of each of its input Observables.
 *
 * <span class="informal">Whenever any input Observable emits a value, it
 * computes a formula using the latest values from all the inputs, then emits
 * the output of that formula.</span>
 *
 * ![](combineLatest.png)
 *
 * `combineLatest` combines the values from all the Observables passed in the
 * observables array. This is done by subscribing to each Observable in order and,
 * whenever any Observable emits, collecting an array of the most recent
 * values from each Observable. So if you pass `n` Observables to this operator,
 * the returned Observable will always emit an array of `n` values, in an order
 * corresponding to the order of the passed Observables (the value from the first Observable
 * will be at index 0 of the array and so on).
 *
 * Static version of `combineLatest` accepts an array of Observables. Note that an array of
 * Observables is a good choice, if you don't know beforehand how many Observables
 * you will combine. Passing an empty array will result in an Observable that
 * completes immediately.
 *
 * To ensure the output array always has the same length, `combineLatest` will
 * actually wait for all input Observables to emit at least once,
 * before it starts emitting results. This means if some Observable emits
 * values before other Observables started emitting, all these values but the last
 * will be lost. On the other hand, if some Observable does not emit a value but
 * completes, resulting Observable will complete at the same moment without
 * emitting anything, since it will now be impossible to include a value from the
 * completed Observable in the resulting array. Also, if some input Observable does
 * not emit any value and never completes, `combineLatest` will also never emit
 * and never complete, since, again, it will wait for all streams to emit some
 * value.
 *
 * If at least one Observable was passed to `combineLatest` and all passed Observables
 * emitted something, the resulting Observable will complete when all combined
 * streams complete. So even if some Observable completes, the result of
 * `combineLatest` will still emit values when other Observables do. In case
 * of a completed Observable, its value from now on will always be the last
 * emitted value. On the other hand, if any Observable errors, `combineLatest`
 * will error immediately as well, and all other Observables will be unsubscribed.
 *
 * ## Examples
 *
 * Combine two timer Observables
 *
 * ```ts
 * import { timer, combineLatest } from 'rxjs';
 *
 * const firstTimer = timer(0, 1000); // emit 0, 1, 2... after every second, starting from now
 * const secondTimer = timer(500, 1000); // emit 0, 1, 2... after every second, starting 0,5s from now
 * const combinedTimers = combineLatest([firstTimer, secondTimer]);
 * combinedTimers.subscribe(value => console.log(value));
 * // Logs
 * // [0, 0] after 0.5s
 * // [1, 0] after 1s
 * // [1, 1] after 1.5s
 * // [2, 1] after 2s
 * ```
 *
 * Combine a dictionary of Observables
 *
 * ```ts
 * import { of, delay, startWith, combineLatest } from 'rxjs';
 *
 * const observables = {
 *   a: of(1).pipe(delay(1000), startWith(0)),
 *   b: of(5).pipe(delay(5000), startWith(0)),
 *   c: of(10).pipe(delay(10000), startWith(0))
 * };
 * const combined = combineLatest(observables);
 * combined.subscribe(value => console.log(value));
 * // Logs
 * // { a: 0, b: 0, c: 0 } immediately
 * // { a: 1, b: 0, c: 0 } after 1s
 * // { a: 1, b: 5, c: 0 } after 5s
 * // { a: 1, b: 5, c: 10 } after 10s
 * ```
 *
 * Combine an array of Observables
 *
 * ```ts
 * import { of, delay, startWith, combineLatest } from 'rxjs';
 *
 * const observables = [1, 5, 10].map(
 *   n => of(n).pipe(
 *     delay(n * 1000), // emit 0 and then emit n after n seconds
 *     startWith(0)
 *   )
 * );
 * const combined = combineLatest(observables);
 * combined.subscribe(value => console.log(value));
 * // Logs
 * // [0, 0, 0] immediately
 * // [1, 0, 0] after 1s
 * // [1, 5, 0] after 5s
 * // [1, 5, 10] after 10s
 * ```
 *
 * Use map operator to dynamically calculate the Body-Mass Index
 *
 * ```ts
 * import { of, combineLatest, map } from 'rxjs';
 *
 * const weight = of(70, 72, 76, 79, 75);
 * const height = of(1.76, 1.77, 1.78);
 * const bmi = combineLatest([weight, height]).pipe(
 *   map(([w, h]) => w / (h * h)),
 * );
 * bmi.subscribe(x => console.log('BMI is ' + x));
 *
 * // With output to console:
 * // BMI is 24.212293388429753
 * // BMI is 23.93948099205209
 * // BMI is 23.671253629592222
 * ```
 *
 * @see {@link combineLatestAll}
 * @see {@link merge}
 * @see {@link withLatestFrom}
 *
 * @param args Any number of `ObservableInput`s provided either as an array or as an object
 * to combine with each other. If the last parameter is the function, it will be used to project the
 * values from the combined latest values into a new value on the output Observable.
 * @return An Observable of projected values from the most recent values from each `ObservableInput`,
 * or an array of the most recent values from each `ObservableInput`.
 */
export function combineLatest(sources: null | undefined): Observable<never>;
export function combineLatest(sources: readonly []): Observable<never>;
export function combineLatest<
	const Inputs extends
		| ReadonlyArray<ObservableInput>
		| Readonly<Record<PropertyKey, ObservableInput>>,
>(inputs: Inputs): Observable<ObservedValuesOf<Inputs>>;
export function combineLatest(
	inputs:
		| ReadonlyArray<ObservableInput>
		| Readonly<Record<PropertyKey, ObservableInput>>
		| null
		| undefined,
): Observable<ReadonlyArray<unknown> | Readonly<Record<PropertyKey, unknown>>> {
	const parts = arrayOrObject(inputs);

	if (!parts) {
		return throwError(() => new TypeError('inputs must be an array or object'));
	}

	const { values: sources, keys } = parts;
	const { length } = sources;

	// If no observables are passed, or someone has passed an empty array
	// of observables, or even an empty object POJO, we need to just
	// complete (empty).
	if (length === 0) return empty;

	return new Observable((subscriber) => {
		// A store for the values each observable has emitted so far. We match observable to value on index.
		const values = new Array<unknown>(length);
		// The number of currently active subscriptions, as they complete, we decrement this number to see if
		// we are all done combining values, so we can complete the result.
		let active = length;
		// The number of inner sources that still haven't emitted the first value
		// We need to track this because all sources need to emit one value in order
		// to start emitting values.
		let remainingFirstValues = length;
		// The loop to kick off subscriptions. We're keying everything with the index to relate the observables passed
		// in to the slot in the output array or the key in the array of keys in the output dictionary.
		sources.forEach((input, index) => {
			from(input).subscribe({ ...subscriber, next, complete });

			function next(value: unknown): void {
				const hasFirstValue = index in values;
				// When we get a value, record it in our set of values.
				values[index] = value;
				// If this is our first value, record that.
				if (!hasFirstValue) remainingFirstValues--;
				if (remainingFirstValues) return;
				// We're not waiting for any more
				// first values, so we can emit!
				subscriber.next(keys ? createObject(keys, values) : values);
			}

			function complete(): void {
				if (--active) return;
				// We only complete the result if we have no more active
				// inner observables.
				subscriber.complete();
			}
		});
	});
}

/** @internal */
function createObject(
	keys: ReadonlyArray<string>,
	values: ReadonlyArray<unknown>,
): Readonly<Record<PropertyKey, unknown>> {
	return keys.reduce<Record<PropertyKey, unknown>>(
		(result, key, index) => ((result[key] = values[index]), result),
		{},
	);
}

/** @internal */
function arrayOrObject<T, O extends Readonly<Record<string, T>>>(
	first: T | Array<T> | O | null | undefined,
):
	| Readonly<{ values: ReadonlyArray<T>; keys: null }>
	| Readonly<{ values: ReadonlyArray<T>; keys: ReadonlyArray<string> }>
	| null {
	if (Array.isArray(first)) return { values: first, keys: null };
	if (!isPojo(first)) return null;
	const keys = Object.keys(first);
	return { values: keys.map((key) => first[key]), keys };
}

/** @internal */
function isPojo(obj: unknown): obj is object {
	return (
		!!obj &&
		typeof obj === 'object' &&
		Object.getPrototypeOf(obj) === Object.prototype
	);
}
