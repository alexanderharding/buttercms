import { Observable } from '../../observable';
import type { ObservableInput, ObservedValueOf } from '../creation';
import { pipe, UnaryFunction } from '../../pipe';
import { filter } from './filter';
import { take } from './take';
import { throwIfEmpty } from './throw-if-empty';

export function first<Input extends ObservableInput>(
	predicate: (value: ObservedValueOf<Input>, index: number) => boolean = () =>
		true,
): UnaryFunction<Input, Observable<ObservedValueOf<Input>>> {
	return pipe(filter(predicate), take(1), throwIfEmpty());
}
