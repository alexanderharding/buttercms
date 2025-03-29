import { Observable } from './observable';

export function fromFetch(
	input: RequestInfo | URL,
	init?: Omit<RequestInit, 'signal'>,
): Observable<Response> {
	return new Observable<Response>(async (subscriber) => {
		try {
			const response = await globalThis.fetch(input, {
				...init,
				signal: subscriber.signal,
			});
			subscriber.next(response);
			subscriber.complete();
		} catch (error) {
			subscriber.error(error);
		}
	});
}
