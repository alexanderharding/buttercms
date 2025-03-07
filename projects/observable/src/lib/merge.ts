import { ObservableInput, ObservedValuesOf, from } from './from';
import { Observable } from './observable';
import { mergeMap } from './merge-map';

export function merge<Inputs extends ReadonlyArray<ObservableInput>>(
	...inputs: Inputs
): Observable<ObservedValuesOf<Inputs>[number]> {
	return from(inputs).pipe(mergeMap());
}
