import { empty, Observable } from '../observable';
import { UnaryFunction } from '../pipe';
import { from, ObservableInput, ObservedValueOf, timer } from './creation';
import { take } from './filtering';

export interface RepeatConfig {
	/**
	 * The number of times to repeat the source. Defaults to `Infinity`.
	 */
	readonly count?: number;
	/**
	 * If a `number`, will delay the repeat of the source by that number of milliseconds.
	 * If a function, it will provide the number of times the source has been subscribed to,
	 * and the return value should be a valid observable input that will notify when the source
	 * should be repeated. If the notifier observable is empty, the result will complete.
	 */
	readonly delay?: number | ((count: number) => ObservableInput);
}

export function repeat<T extends ObservableInput>(
	count: number,
): UnaryFunction<T, Observable<ObservedValueOf<T>>>;
export function repeat<T extends ObservableInput>(
	config: RepeatConfig,
): UnaryFunction<T, Observable<ObservedValueOf<T>>>;
export function repeat<T extends ObservableInput>(
	countOrConfig?: number | RepeatConfig,
): UnaryFunction<T, Observable<ObservedValueOf<T>>>;
/**
 * Returns an Observable that will resubscribe to the source stream when the source stream completes.
 *
 * <span class="informal">Repeats all values emitted on the source. It's like {@link retry}, but for non error cases.</span>
 *
 * ![](repeat.png)
 *
 * Repeat will output values from a source until the source completes, then it will resubscribe to the
 * source a specified number of times, with a specified delay. Repeat can be particularly useful in
 * combination with closing operators like {@link take}, {@link takeUntil}, {@link first}, or {@link takeWhile},
 * as it can be used to restart a source again from scratch.
 *
 * Repeat is very similar to {@link retry}, where {@link retry} will resubscribe to the source in the error case, but
 * `repeat` will resubscribe if the source completes.
 *
 * Note that `repeat` will _not_ catch errors. Use {@link retry} for that.
 *
 * - `repeat(0)` returns an empty observable
 * - `repeat()` will repeat forever
 * - `repeat({ delay: 200 })` will repeat forever, with a delay of 200ms between repetitions.
 * - `repeat({ count: 2, delay: 400 })` will repeat twice, with a delay of 400ms between repetitions.
 * - `repeat({ delay: (count) => timer(count * 1000) })` will repeat forever, but will have a delay that grows by one second for each repetition.
 *
 * ## Example
 *
 * Repeat a message stream
 *
 * ```ts
 * import { of, repeat } from 'rxjs';
 *
 * const source = of('Repeat message');
 * const result = source.pipe(repeat(3));
 *
 * result.subscribe(x => console.log(x));
 *
 * // Results
 * // 'Repeat message'
 * // 'Repeat message'
 * // 'Repeat message'
 * ```
 *
 * Repeat 3 values, 2 times
 *
 * ```ts
 * import { interval, take, repeat } from 'rxjs';
 *
 * const source = interval(1000);
 * const result = source.pipe(take(3), repeat(2));
 *
 * result.subscribe(x => console.log(x));
 *
 * // Results every second
 * // 0
 * // 1
 * // 2
 * // 0
 * // 1
 * // 2
 * ```
 *
 * Defining two complex repeats with delays on the same source.
 * Note that the second repeat cannot be called until the first
 * repeat as exhausted it's count.
 *
 * ```ts
 * import { defer, of, repeat } from 'rxjs';
 *
 * const source = defer(() => {
 *    return of(`Hello, it is ${new Date()}`)
 * });
 *
 * source.pipe(
 *    // Repeat 3 times with a delay of 1 second between repetitions
 *    repeat({
 *      count: 3,
 *      delay: 1000,
 *    }),
 *
 *    // *Then* repeat forever, but with an exponential step-back
 *    // maxing out at 1 minute.
 *    repeat({
 *      delay: (count) => timer(Math.min(60000, 2 ^ count * 1000))
 *    })
 * )
 * ```
 *
 * @see {@link repeatWhen}
 * @see {@link retry}
 *
 * @param count The number of times the source Observable items are repeated, a count of 0 will yield
 * an empty Observable.
 */
export function repeat<T extends ObservableInput>(
	countOrConfig?: number | RepeatConfig,
): UnaryFunction<T, Observable<ObservedValueOf<T>>> {
	const { count = Infinity, delay } =
		countOrConfig && typeof countOrConfig === 'object'
			? countOrConfig
			: { count: countOrConfig };
	return (source) => {
		if (count <= 0) return empty;
		return new Observable((observer) => {
			if (observer.signal.aborted) return;

			let soFar = 0;
			let sourceController: AbortController | null;

			observer.signal.addEventListener(
				'abort',
				() => unsubscribeSource(observer.signal.reason),
				{ once: true },
			);

			subscribeToSource();

			function subscribeToSource(): void {
				from(source).subscribe({
					...observer,
					signal: (sourceController = new AbortController()).signal,
					complete: () =>
						++soFar < count ? resubscribe() : observer.complete(),
				});
			}

			function resubscribe(): void {
				unsubscribeSource();
				if (delay == null) return subscribeToSource();
				const notifier =
					typeof delay === 'number' ? timer(delay) : from(delay(soFar));
				notifier.pipe(take(1)).subscribe({
					...observer,
					next: subscribeToSource,
				});
			}

			function unsubscribeSource(reason?: unknown): void {
				sourceController?.abort(reason);
				sourceController = null;
			}
		});
	};
}
