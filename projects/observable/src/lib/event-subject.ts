import { Observer, Subscriber } from 'subscriber';
import { subscribe, Observable } from './observable';
import { Subscription } from 'subscription';
import { UnaryFunction } from './unary-function';
import { noop, TeardownLogic } from 'rxjs';
import { Subject } from './subject';

export type EventSubject<Value extends Event = Event> = Subject<Value>;

export interface EventSubjectConstructor {
	new (
		target: EventTarget,
		type: string,
		options?: Readonly<Partial<{ passive: boolean }>>,
	): EventSubject;
	new <Value extends Event = Event>(
		target: EventTarget,
		type: string,
		options?: Readonly<Partial<{ passive: boolean }>>,
	): EventSubject<Value>;
	readonly prototype: EventSubject;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const EventSubject: EventSubjectConstructor = class {
	/** @internal */
	readonly [Symbol.toStringTag] = this.constructor.name;

	/** @internal */
	readonly #output = new Subject<Event>();
	readonly #target: EventTarget;

	constructor(
		target: EventTarget,
		type: string,
		options?: Readonly<Partial<{ passive: boolean }>>,
	) {
		this.#target = target;
		const controller = new AbortController();
		target.addEventListener(type, (event) => this.#output.next(event), {
			...options,
			signal: controller.signal,
		});
		this.subscribe({ error: noop }).add(() => controller.abort());
	}

	get observed(): boolean {
		return this.#output.observed;
	}

	get closed(): boolean {
		return this.#output.closed;
	}

	[subscribe](subscriber: Subscriber<Event>): TeardownLogic {
		return this.subscribe(subscriber);
	}

	subscribe(
		observerOrNext?: Partial<Observer<Event>> | ((value: Event) => void) | null,
	): Subscription {
		return this.#output.subscribe(observerOrNext);
	}

	next(value: Event): void {
		this.#target.dispatchEvent(value);
	}

	complete(): void {
		this.#output.complete();
	}

	error(error: unknown): void {
		this.#output.error(error);
	}

	unsubscribe(): void {
		this.#output.unsubscribe();
	}

	asObservable(): Observable<Event> {
		return this.#output.asObservable();
	}

	pipe(
		...operations: ReadonlyArray<UnaryFunction<never, never>>
	): Observable<Event> {
		return operations.reduce(
			(acc: never, operator) => operator(acc),
			this.asObservable(),
		);
	}
};
