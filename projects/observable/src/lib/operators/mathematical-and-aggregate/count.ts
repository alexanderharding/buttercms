import { Observable } from '../../observable';
import type { ObservableInput, ObservedValueOf } from '../creation';
import { UnaryFunction } from '../../pipe';
import { reduce } from './reduce';

export function count<Input extends ObservableInput>(
	predicate: (value: ObservedValueOf<Input>, index: number) => boolean = () =>
		true,
): UnaryFunction<Input, Observable<number>> {
	return reduce(
		(count, value, index) => (predicate(value, index) ? count + 1 : count),
		0,
	);
}
