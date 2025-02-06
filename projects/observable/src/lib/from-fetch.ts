import { ObservableInput, from } from './input';
import { Observable } from './observable';

export function abortable<T>(
	factory: (signal: AbortSignal) => Observable<T>,
): Observable<T> {
	return new Observable((subscriber) => {
		const controller = new AbortController();
		subscriber.add(() => controller.abort());
		return factory(controller.signal).subscribe(subscriber);
	});
}

const r = abortable((signal) =>
	from(fetch('https://jsonplaceholder.typicode.com/todos/1', { signal })),
);
