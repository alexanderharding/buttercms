import { Notifiable } from './notifiable';
import { Unsubscribable } from './unsubscribable';

/**
 * [Glossary](https://jsr.io/@xander/observable#consumerobserver)
 */
export type ConsumerObserver<Value = unknown> = Notifiable<Value> &
	Unsubscribable;
