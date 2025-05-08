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
		return new Observable<0>((dispatcher) => {
			if (dispatcher.signal.aborted) return;
			const timeout = globalThis.setTimeout(() => dispatcher.next(0), ms);
			dispatcher.signal.addEventListener(
				'abort',
				() => globalThis.clearTimeout(timeout),
				{ signal: dispatcher.signal },
			);
		});
	} catch (error) {
		return throwError(() => error);
	}
}
