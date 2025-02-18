import { Observer, Subscriber } from 'subscriber';

export class SubscribeEvent<Value = unknown> extends Event {
	readonly subscriber: Subscriber<Value>;
	constructor(subscriber: Subscriber<Value>) {
		super('subscribe');
		this.subscriber = subscriber;
	}
}

export class SubscribeSignal<Value = unknown> extends EventTarget {
	override addEventListener(
		type: 'subscribe',
		listener: ((this: this, value: SubscribeEvent<Value>) => void) | null,
		options?: AddEventListenerOptions | boolean,
	): void {
		super.addEventListener(type, listener, options);
	}

	override removeEventListener(
		type: 'subscribe',
		listener: ((this: this, value: SubscribeEvent<Value>) => void) | null,
		options?: EventListenerOptions | boolean,
	): void {
		super.removeEventListener(type, listener, options);
	}

	override dispatchEvent(event: SubscribeEvent<Value>): boolean {
		return super.dispatchEvent(event);
	}
}

export class SubscribeController<Value = unknown> {
	readonly signal = new SubscribeSignal<Value>();

	subscribe(
		observerOrNext?: ((value: Value) => void) | Partial<Observer<Value>> | null,
	): void {
		this.signal.dispatchEvent(
			new SubscribeEvent<Value>(
				observerOrNext instanceof Subscriber
					? observerOrNext
					: new Subscriber(observerOrNext),
			),
		);
	}
}
