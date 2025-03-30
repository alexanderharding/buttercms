import { Observable } from '../../observable';
import {
	type ObservableInput,
	type ObservedValueOf,
	type DateLike,
	timer,
} from '../creation';
import type { UnaryFunction } from '../../pipe';
import { map, mergeMap } from '../transformation';
import { take } from '../filtering';

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
