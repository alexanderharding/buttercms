import { empty } from './empty';
import { fromEvent } from './from-event';
import { never } from './never';
import { noop } from '../noop';
import { Observable } from './observable';
import { of } from './of';
import { throwError } from './throw-error';

interface DateLike {
	getTime(): number;
}

/**
 * Creates an Observable that emits a successful execution code (0) after a specific time interval.
 */
export function timer(due: number | DateLike): Observable<0> {
	try {
		// The try catch wrapper is to handle the due.getTime() case,
		// where due is a DateLike object
		const ms = typeof due === 'number' ? due : due.getTime() - Date.now();
		if (ms < 0) return empty;
		if (ms === 0) return of(0);
		if (ms === Infinity) return never;
		return new Observable<0>((subscriber) => {
			if (subscriber.signal.aborted) return;
			const timeout = globalThis.setTimeout(() => subscriber.next(0), ms);
			fromEvent(subscriber.signal, 'abort').subscribe({
				...subscriber,
				next: () => globalThis.clearTimeout(timeout),
				complete: noop,
			});
		});
	} catch (error) {
		return throwError(() => error);
	}
}
