import { Completable } from './completable';
import { Errorable } from './errorable';
import { Finalizable } from './finalizable';
import { Nextable } from './nextable';

/**
 * [Glossary](https://jsr.io/@xander/observable#notification)
 */
export type Notifiable<Value> = Nextable<Value> &
	Errorable &
	Completable &
	Finalizable;
