import { Observable } from '../../observable';
import type { UnaryFunction } from '../../pipe';
import { map, mergeMap } from '../transformation';
import { from, type ObservableInput, type ObservedValueOf } from '../creation';
import { take } from '../filtering';

export function delayWhen<T extends ObservableInput>(
	delayDurationSelector: (
		value: ObservedValueOf<T>,
		index: number,
	) => ObservableInput,
): UnaryFunction<T, Observable<ObservedValueOf<T>>> {
	return mergeMap((value, index) =>
		from(delayDurationSelector(value, index)).pipe(
			take(1),
			map(() => value),
		),
	);
}
