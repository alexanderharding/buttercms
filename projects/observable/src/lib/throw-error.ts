import { Observable } from './observable';

export function throwError<T>(error: () => Error): Observable<T> {
	return new Observable<T>((subscriber) => {
		subscriber.error(error());
	});
}
