import { Observable } from '../observable/observable';
import { ObservableInput, from, ObservedValueOf } from '../observable/from';
import { UnaryFunction } from '../pipe/unary-function';
import { Subscriber } from 'subscriber';
import { scan } from './scan';
import { switchMap } from './switch-map';
import { pipe } from '../pipe/pipe';

export function switchScan<Value extends ObservableInput>(
	accumulator: (
		acc: ObservedValueOf<Value>,
		value: ObservedValueOf<Value>,
		index: number,
	) => Value,
): UnaryFunction<Value, Observable<ObservedValueOf<Value>>>;
export function switchScan<
	In extends ObservableInput,
	Out extends ObservableInput,
>(
	accumulator: (
		acc: ObservedValueOf<Out>,
		value: ObservedValueOf<In>,
		index: number,
	) => ObservedValueOf<Out>,
	seed?: ObservedValueOf<Out>,
): UnaryFunction<ObservableInput, Observable>;
export function switchScan(
	accumulator: (acc: unknown, value: unknown, index: number) => unknown,
	seed?: unknown,
): UnaryFunction<ObservableInput, Observable> {
	return pipe(
		switchMap((value: ObservableInput) => value),
		scan(accumulator, seed),
	);
}
