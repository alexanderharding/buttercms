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
	return new Observable((dispatcher) =>
		target.addEventListener(type, (event) => dispatcher.next(event), {
			signal: dispatcher.signal,
		}),
	);
}
