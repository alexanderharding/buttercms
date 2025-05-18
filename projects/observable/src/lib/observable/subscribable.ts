import { ConsumerObserver } from './consumer-observer';

export interface Subscribable<Value = unknown> {
	/**
	 * [Glossary](https://jsr.io/@xander/observable#subscribe)
	 */
	subscribe(
		observerOrNext?:
			| Partial<ConsumerObserver<Value>>
			| ((value: Value) => unknown)
			| null,
	): void;
}
