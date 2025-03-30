import { Observable } from '../../observable';
import type { UnaryFunction } from '../../pipe';
import { from, ObservableInput, ObservedValueOf } from '../creation';

export function switchMap<
	In extends ObservableInput,
	Out extends ObservableInput,
>(
	project: (value: ObservedValueOf<In>, index: number) => Out,
): UnaryFunction<In, Observable<ObservedValueOf<Out>>> {
	return (source) =>
		new Observable((subscriber) => {
			let controller: AbortController | null;
			let index = 0;
			let isOuterComplete = false;
			let hasInnerSubscription = false;

			from(source).subscribe({
				...subscriber,
				next: outerNext,
				complete: outerComplete,
				finalize: () => setController(null),
			});

			function outerNext(value: ObservedValueOf<In>): void {
				const { signal } = setController(new AbortController());
				hasInnerSubscription = true;
				from(project(value, index++)).subscribe({
					...subscriber,
					signal,
					complete() {
						hasInnerSubscription = false;
						checkComplete();
					},
				});
			}

			function outerComplete(): void {
				isOuterComplete = true;
				checkComplete();
			}

			function setController<Value extends AbortController | null>(
				value: Value,
			): Value {
				controller?.abort();
				controller = value;
				return value;
			}

			// We only complete the result if the source is complete AND we don't have an active inner subscription.
			// This is called both when the source completes and when the inners complete.
			function checkComplete(): void {
				if (isOuterComplete && !hasInnerSubscription) subscriber.complete();
			}
		});
}
