import { Observable } from './observable';

interface AddEventListenerOptionsLike {
	readonly signal: AbortSignal;
}

interface EventTargetLike<T extends Event = Event> {
	addEventListener(
		type: string,
		listener: (event: T) => unknown,
		options: AddEventListenerOptionsLike,
	): void;
}

export function fromEvent<T extends Event>(
	target: EventTargetLike<T>,
	type: string,
): Observable<T> {
	return new Observable((subscriber) =>
		target.addEventListener(type, (event) => subscriber.next(event), {
			signal: subscriber.signal,
		}),
	);
}
