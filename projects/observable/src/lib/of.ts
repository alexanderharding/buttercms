import { from } from './from';
import { Observable } from './observable';

export function of<const Values extends ReadonlyArray<unknown>>(
	...values: Values
): Observable<Values[number]> {
	return from(values);
}
