import { mergeMap } from './transformation';
import { Observable } from '../observable';
import { UnaryFunction } from '../pipe';
import { ObservableInput, ObservedValueOf, of } from './creation';

export function mergeWith<
	T1 extends ObservableInput,
	T2 extends ObservableInput,
>(
	input: T2,
): UnaryFunction<T1, Observable<ObservedValueOf<T1> | ObservedValueOf<T2>>> {
	return (source) => of(source, input).pipe(mergeMap());
}
