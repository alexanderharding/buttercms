import { Observable } from '../../observable';
import { ObservableInput, ObservedValueOf } from '../creation';
import { UnaryFunction } from '../../pipe';
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
