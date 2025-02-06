import { identity } from 'rxjs';
import { mergeMap } from './merge-map';
import { ObservableInput, from } from './input';
import { Observable } from './observable';

export function merge<T>(
	...sources: ReadonlyArray<ObservableInput<T>>
): Observable<T> {
	return from(sources).pipe(mergeMap(identity));
}
