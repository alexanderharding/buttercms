import { Subject } from './subject/subject';
import { Observable } from './observable/observable';
import { Pipeline } from './pipe/pipeline';
import { UnaryFunction } from './pipe';
import { Observer } from './observable';

export type WebSocketSubject<Value = unknown> = Omit<Subject<Value>, 'pipe'> &
	Pipeline<WebSocketSubject<Value>>;

/**
 * @param name The name of the underlying {@linkcode BroadcastChannel}.
 */
export interface WebSocketSubjectConstructor {
	new <Value = unknown>(
		url: string,
		protocols?: string | Array<string>,
	): WebSocketSubject<Value>;
	readonly prototype: WebSocketSubject;
}

export const WebSocketSubject: WebSocketSubjectConstructor = class<Value> {
	/** @internal */
	readonly [Symbol.toStringTag] = 'WebSocketSubject';

	/** @internal */
	readonly #socket: WebSocket;

	/** @internal */
	readonly #delegate = new Subject<Value>();

	/** @internal */
	readonly #pipeline = new Pipeline(this);

	constructor(url: string | URL, protocols?: string | Array<string>) {
		this.#socket = new WebSocket(url, protocols);
		this.#socket.onmessage = (event: MessageEvent<Value>) =>
			this.#delegate.next(event.data);
		this.#socket.onclose = () => this.complete();
		this.#socket.onerror = (event) => this.error(event);
	}

	get signal(): AbortSignal {
		return this.#delegate.signal;
	}

	get url(): string {
		return this.#socket.url;
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

	get bufferedAmount(): number {
		return this.#socket.bufferedAmount;
	}

	get extensions(): string {
		return this.#socket.extensions;
	}

	get protocol(): string {
		return this.#socket.protocol;
	}

	get binaryType(): string {
		return this.#socket.binaryType;
	}

	set binaryType(value: BinaryType) {
		this.#socket.binaryType = value;
	}

	subscribe(observerOrNext?: Partial<Observer> | UnaryFunction | null): void {
		this.#delegate.subscribe(observerOrNext);
	}

	next(value: string | ArrayBufferLike | Blob | ArrayBufferView): void {
		this.#socket.send(value);
	}

	error(error: unknown): void {
		this.#socket.close(1002);
		this.#delegate.error(error);
	}

	complete(): void {
		this.#socket.close(1000);
		this.#delegate.complete();
	}

	asObservable(): Observable {
		return new Observable((subscriber) => this.subscribe(subscriber));
	}

	pipe(...operations: []) {
		return this.#pipeline.pipe(...operations);
	}
};
