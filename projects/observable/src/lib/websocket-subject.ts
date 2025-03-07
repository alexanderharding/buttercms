import { Subject } from './subject';
import { Observable } from './observable';
import { Observer } from 'subscriber';
import { UnaryFunction } from './unary-function';

export type WebSocketSubject<Value = unknown> = Subject<Value>;

/**
 * @param name The name of the underlying {@linkcode BroadcastChannel}.
 */
export interface WebSocketSubjectConstructor {
	new (url: string): WebSocketSubject;
	new <Value = unknown>(url: string): WebSocketSubject<Value>;
	readonly prototype: WebSocketSubject;
}

export const WebSocketSubject: WebSocketSubjectConstructor = class {
	/** @internal */
	readonly [Symbol.toStringTag] = 'WebSocketSubject';

	/** @internal */
	readonly #socket: WebSocket;

	/** @internal */
	readonly #delegate = new Subject<unknown>();

	constructor(url: string | URL, protocols?: string | Array<string>) {
		this.#socket = new WebSocket(url, protocols);
		this.#socket.onmessage = (event) => this.#delegate.next(event.data);
		this.#socket.onclose = () => this.complete();
		this.#socket.onerror = (event) => this.error(event);
	}

	get signal(): AbortSignal {
		return this.#delegate.signal;
	}

	get connecting(): boolean {
		return this.#socket.readyState === WebSocket.CONNECTING;
	}

	get closing(): boolean {
		return this.#socket.readyState === WebSocket.CLOSING;
	}

	get closed(): boolean {
		return this.#socket.readyState === WebSocket.CLOSED;
	}

	subscribe(
		observerOrNext?: Partial<Observer> | ((value: unknown) => void),
	): void {
		this.#delegate.subscribe(observerOrNext);
	}

	abort(reason?: unknown): void {
		this.#delegate.abort(reason);
		this.#socket.close(1000, typeof reason === 'string' ? reason : undefined);
	}

	next(value: string | ArrayBufferLike | Blob | ArrayBufferView): void {
		// TODO: Buffer input values while socket is opening/connecting
		this.#socket.send(value);
	}

	error(error: unknown): void {
		this.#delegate.error(error);
		this.#socket.close(1002);
	}

	complete(): void {
		this.#delegate.complete();
		this.#socket.close(1000);
	}

	asObservable(): Observable {
		return new Observable((subscriber) => this.subscribe(subscriber));
	}

	pipe(...operations: ReadonlyArray<UnaryFunction<never, never>>): Observable {
		return operations.reduce(
			(acc: never, operator) => operator(acc),
			this.asObservable(),
		);
	}
};
