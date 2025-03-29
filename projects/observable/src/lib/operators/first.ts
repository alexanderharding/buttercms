import { Observable, ObservableInput, ObservedValueOf } from '../observable';
import { pipe, UnaryFunction } from '../pipe';
import { filter } from './filter';
import { take } from './take';
import { throwIfEmpty } from './throw-if-empty';

export function first<Input extends ObservableInput>(
	predicate: (value: ObservedValueOf<Input>, index: number) => boolean = () =>
		true,
): UnaryFunction<Input, Observable<ObservedValueOf<Input>>> {
	return pipe(filter(predicate), take(1), throwIfEmpty());
}
