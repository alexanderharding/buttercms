import { ConsumerObserver } from './consumer-observer';

/**
 * [Glossary](https://jsr.io/@xander/observable#subscribe)
 */
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
