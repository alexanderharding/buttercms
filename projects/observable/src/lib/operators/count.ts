import { ObservableInput, ObservedValueOf } from '../observable/from';
import { Observable } from '../observable/observable';
import { reduce } from './reduce';
import { UnaryFunction } from '../pipe/unary-function';

export function count<Input extends ObservableInput>(
	predicate: (value: ObservedValueOf<Input>, index: number) => boolean = () =>
		true,
): UnaryFunction<Input, Observable<number>> {
	return reduce(
		(count, value, index) => (predicate(value, index) ? count + 1 : count),
		0,
	);
}
