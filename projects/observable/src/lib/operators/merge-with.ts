import { ObservableInput, ObservedValueOf } from '../observable/from';
import { mergeMap } from './merge-map';
import { Observable } from '../observable/observable';
import { of } from '../observable/of';
import { UnaryFunction } from '../pipe/unary-function';

export function mergeWith<
	T1 extends ObservableInput,
	T2 extends ObservableInput,
>(
	input: T2,
): UnaryFunction<T1, Observable<ObservedValueOf<T1> | ObservedValueOf<T2>>> {
	return (source) => of(source, input).pipe(mergeMap());
}
