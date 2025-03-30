import { Observable } from '../../observable';

export interface AddEventListenerOptionsLike {
	readonly signal: AbortSignal;
}

export interface EventTargetLike<E extends Event = Event> {
	addEventListener(
		type: string,
		listener: (event: E) => unknown,
		options: AddEventListenerOptionsLike,
	): void;
}

export function fromEvent<E extends Event>(
	target: EventTargetLike<E>,
	type: string,
): Observable<E> {
	return new Observable((subscriber) =>
		target.addEventListener(type, (event) => subscriber.next(event), {
			signal: subscriber.signal,
		}),
	);
}
