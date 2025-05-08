import { Observable } from './observable';

export function fromFetch(
	input: RequestInfo | URL,
	init?: Omit<RequestInit, 'signal'>,
): Observable<Response> {
	return new Observable<Response>(async (dispatcher) => {
		try {
			const response = await globalThis.fetch(input, {
				...init,
				signal: dispatcher.signal,
			});
			dispatcher.next(response);
			dispatcher.complete();
		} catch (error) {
			dispatcher.error(error);
		}
	});
}
