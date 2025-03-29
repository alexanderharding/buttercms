import { from, ObservableInput, ObservedValueOf } from '../observable/from';
import { Observable } from '../observable/observable';
import { UnaryFunction } from '../pipe/unary-function';

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
		new Observable((subscriber) => {
			let index = 0;
			let hasInnerSubscription = false;
			let isOuterComplete = false;
			from(source).subscribe({
				...subscriber,
				next(outerValue) {
					if (hasInnerSubscription) return;
					hasInnerSubscription = true;
					from(project(outerValue, index++)).subscribe({
						...subscriber,
						complete() {
							hasInnerSubscription = false;
							if (isOuterComplete) subscriber.complete();
						},
					});
				},
				complete() {
					isOuterComplete = true;
					if (!hasInnerSubscription) subscriber.complete();
				},
			});
		});
}
