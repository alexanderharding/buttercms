import { Observable, empty, ObservableInput, from } from '../observable';
import { UnaryFunction } from '../pipe';

/**
 * A pipeable operator that completes the returned {@linkcode Observable} after a
 * {@linkcode count|specified number} of `next` notifications have been pushed.
 */
export function take<Value>(
	count: number,
): UnaryFunction<ObservableInput<Value>, Observable<Value>> {
	return (source) => {
		// If we are taking no values, that's empty.
		if (count <= 0) return empty;

		return new Observable((subscriber) => {
			let seen = 0;
			from(source).subscribe({
				...subscriber,
				next: (value) => {
					// Increment the number of values we have seen,
					// then check it against the allowed count to see
					// if we are still letting values through.
					if (++seen > count) return;
					subscriber.next(value);
					// If we have met or passed our allowed count,
					// we need to complete. We have to do <= here,
					// because reentrant code will increment `seen` twice.
					if (count <= seen) subscriber.complete();
				},
			});
		});
	};
}
