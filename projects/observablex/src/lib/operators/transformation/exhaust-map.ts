import { Observable } from '../../observable';
import { from, ObservableInput, ObservedValueOf } from '../creation';
import { UnaryFunction } from '../../pipe';

export function exhaustMap<
	Input extends ObservableInput<ObservableInput>,
>(): UnaryFunction<Input, Observable<ObservedValueOf<ObservedValueOf<Input>>>>;
export function exhaustMap<
	In extends ObservableInput,
	Out extends ObservableInput,
>(
	project: (value: ObservedValueOf<In>, index: number) => Out,
): UnaryFunction<In, Observable<ObservedValueOf<Out>>>;
export function exhaustMap(
	project: (value: unknown, index: number) => ObservableInput = (
		value: ObservableInput,
	) => value,
): UnaryFunction<ObservableInput, Observable> {
	return (source) =>
		new Observable((observer) => {
			let index = 0;
			let hasInnerSubscription = false;
			let isOuterComplete = false;
			from(source).subscribe({
				...observer,
				next(outerValue) {
					if (hasInnerSubscription) return;
					hasInnerSubscription = true;
					from(project(outerValue, index++)).subscribe({
						...observer,
						complete() {
							hasInnerSubscription = false;
							if (isOuterComplete) observer.complete();
						},
					});
				},
				complete() {
					isOuterComplete = true;
					if (!hasInnerSubscription) observer.complete();
				},
			});
		});
}
