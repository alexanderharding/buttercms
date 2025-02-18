import { mergeMap } from './merge-map';
import { ObservableInput, ObservedValuesOf, from } from './from';
import { Observable } from './observable';

export function merge<Inputs extends ReadonlyArray<ObservableInput>>(
	...inputs: Inputs
): Observable<ObservedValuesOf<Inputs>[number]>;
export function merge(...inputs: ReadonlyArray<ObservableInput>): Observable {
	return from(inputs).pipe(mergeMap((value) => value));
}
