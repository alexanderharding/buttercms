import { Observable } from '../../observable';
import { ObservableInput, ObservedValueOf } from '../creation';
import { UnaryFunction } from '../../pipe';
import { mergeMap } from './merge-map';

export function concatMap<
	Input extends ObservableInput<ObservableInput>,
>(): UnaryFunction<Input, Observable<ObservedValueOf<ObservedValueOf<Input>>>>;
export function concatMap<
	In extends ObservableInput,
	Out extends ObservableInput,
>(
	project: (value: ObservedValueOf<In>, index: number) => Out,
): UnaryFunction<In, Observable<ObservedValueOf<Out>>>;
export function concatMap(
	project?: (value: unknown, index: number) => ObservableInput,
): UnaryFunction<ObservableInput, Observable> {
	return project ? mergeMap(project, 1) : mergeMap(1);
}
