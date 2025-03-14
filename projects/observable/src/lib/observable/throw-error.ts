import { Observable } from './observable';

export function throwError(error: () => unknown): Observable<never> {
	return new Observable((subscriber) => subscriber.error(error()));
}
