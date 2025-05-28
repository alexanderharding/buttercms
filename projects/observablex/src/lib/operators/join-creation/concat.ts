import { ObservableInput, ObservedValuesOf, from } from '../creation';
import { Observable } from '../../observable/observable';
import { concatMap } from '../transformation';

export function concat<Inputs extends ReadonlyArray<ObservableInput>>(
	...inputs: Inputs
): Observable<ObservedValuesOf<Inputs>[number]> {
	return from(inputs).pipe(concatMap());
}
