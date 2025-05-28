import { Observable } from '../../observable';

export function throwError(error: () => unknown): Observable<never> {
	return new Observable((observer) => observer.error(error()));
}
