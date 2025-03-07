import { ObservableInput, ObservedValueOf } from './from';
import { mergeMap } from './merge-map';
import { Observable } from './observable';
import { of } from './of';
import { UnaryFunction } from './unary-function';

export function mergeWith<
	T1 extends ObservableInput,
	T2 extends ObservableInput,
>(
	input: T2,
): UnaryFunction<T1, Observable<ObservedValueOf<T1> | ObservedValueOf<T2>>> {
	return (source) => of(source, input).pipe(mergeMap());
}
