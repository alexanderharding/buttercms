import { EventSubject } from './event-subject';
import { ObservableInput, ObservedValueOf, from } from './from';
import { Observable } from './observable';
import { Subject } from './subject';
import { fromEventPattern } from 'rxjs';

export function abortable<Input extends ObservableInput>(
	factory: (signal: AbortSignal) => Input,
): Observable<ObservedValueOf<Input>> {
	return new Observable((subscriber) => {
		const controller = new AbortController();
		subscriber.add(from(factory(controller.signal)).subscribe(subscriber));
		subscriber.add(() => controller.abort());
	});
}

window.addEventListener('devicemotion', () => {});

export interface EventTargetLike<T extends Event = Event> {
	addEventListener(
		type: unknown,
		listener: (ev: T) => unknown,
		options?: Readonly<Partial<{ passive: boolean; signal: AbortSignal }>>,
	): unknown;
}

const e = abortable((signal) => {
	const subject = new Subject<DeviceMotionEvent>();
	window.addEventListener('devicemotion', (event) => subject.next(event), {
		signal,
	});
	return subject.asObservable();
});

const e = fromEvent(window, 'devicemotion');

document.createElement('img').addEventListener('load', (event) => {});

export function fromEvent<
	Type extends keyof WindowEventMap = keyof WindowEventMap,
>(
	target: typeof globalThis,
	type: Type,
	options?: Readonly<Partial<{ passive: boolean }>>,
): Observable<WindowEventMap[Type]>;
export function fromEvent<
	Type extends keyof HTMLElementEventMap = keyof HTMLElementEventMap,
>(
	target: HTMLInputElement,
	type: Type,
	options?: Readonly<Partial<{ passive: boolean }>>,
): Observable<HTMLElementEventMap[Type]>;
export function fromEvent<
	Type extends keyof HTMLElementEventMap = keyof HTMLElementEventMap,
>(
	target: HTMLElement,
	type: Type,
	options?: Readonly<Partial<{ passive: boolean }>>,
): Observable<HTMLElementEventMap[Type]>;
export function fromEvent<T extends Event = Event>(
	target: EventTarget,
	type: string,
	options?: Readonly<Partial<{ passive: boolean }>>,
): Observable<T>;
export function fromEvent<T extends Event = Event>(
	target: EventTarget,
	type: string,
	options?: Readonly<Partial<{ passive: boolean }>>,
): Observable<T> {
	return new EventSubject<T>(target, type, options).asObservable();
}
