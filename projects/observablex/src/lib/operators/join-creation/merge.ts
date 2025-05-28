import { Observable } from '../../observable';
import { from, ObservableInput, ObservedValuesOf } from '../creation';
import { mergeMap } from '../transformation';

export function merge<Inputs extends ReadonlyArray<ObservableInput>>(
	...inputs: Inputs
): Observable<ObservedValuesOf<Inputs>[number]> {
	return from(inputs).pipe(mergeMap());
}
