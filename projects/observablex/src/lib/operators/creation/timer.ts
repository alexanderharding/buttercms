import { empty, never, Observable } from '../../observable';
import { of } from './of';
import { throwError } from './throw-error';

export interface DateLike {
	getTime(): number;
}

/**
 * Creates an Observable that emits a successful execution code (0) after a specific due time or date.
 */
export function timer(due: number | DateLike): Observable<0> {
	try {
		// The try catch wrapper is to handle the due.getTime() case,
		// where due is a DateLike object.
		const ms = typeof due === 'number' ? due : due.getTime() - Date.now();
		if (ms < 0) return empty;
		if (ms === 0) return of(0);
		if (ms === Infinity) return never;
		return new Observable<0>((observer) => {
			if (observer.signal.aborted) return;
			const timeout = globalThis.setTimeout(() => observer.next(0), ms);
			observer.signal.addEventListener(
				'abort',
				() => globalThis.clearTimeout(timeout),
				{ signal: observer.signal },
			);
		});
	} catch (error) {
		return throwError(() => error);
	}
}
