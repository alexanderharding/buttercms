import { ObservableInput, ObservedValueOf } from '../observable/from';
import { Observable } from '../observable/observable';
import { UnaryFunction } from '../pipe/unary-function';
import { mergeScan } from './merge-scan';

export function concatScan<
	In extends ObservableInput,
	Out extends ObservableInput,
>(
	accumulator: (
		accumulated: ObservedValueOf<Out>,
		value: ObservedValueOf<In>,
		index: number,
	) => Out,
	seed: ObservedValueOf<Out>,
): UnaryFunction<In, Observable<ObservedValueOf<Out>>> {
	return mergeScan(accumulator, seed, 1);
}
