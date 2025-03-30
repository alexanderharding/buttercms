import {
	from,
	Observable,
	type ObservableInput,
	type ObservedValueOf,
} from '../observable';
import type { UnaryFunction } from '../pipe';
import { map } from './map';
import { mergeMap } from './merge-map';
import { take } from './take';

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
