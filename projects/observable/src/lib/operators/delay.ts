import {
	Observable,
	type ObservableInput,
	type ObservedValueOf,
} from '../observable';
import { DateLike, timer } from '../observable/timer';
import type { UnaryFunction } from '../pipe';
import { map } from './map';
import { mergeMap } from './merge-map';
import { take } from './take';

export function delay<In extends ObservableInput>(
	due: number | DateLike,
): UnaryFunction<In, Observable<ObservedValueOf<In>>> {
	return mergeMap((value) =>
		timer(due).pipe(
			take(1),
			map(() => value),
		),
	);
}
