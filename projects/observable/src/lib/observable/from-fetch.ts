import { Observable } from './observable';

export function fromFetch(
	input: RequestInfo | URL,
	init?: Omit<RequestInit, 'signal'>,
): Observable<Response> {
	return new Observable<Response>(async (observer) => {
		try {
			const response = await globalThis.fetch(input, {
				...init,
				signal: observer.signal,
			});
			observer.next(response);
			observer.complete();
		} catch (error) {
			observer.error(error);
		}
	});
}
