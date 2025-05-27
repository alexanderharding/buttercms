import { Complete } from './complete';
import { Error } from './error';
import { Finally } from './finally';
import { Next } from './next';
import { Notification } from './notification';

/**
 * Object interface that implements all {@linkcode Notification|notifications}.
 */
export type Notifications<Value = unknown> = Next<Value> &
	Error &
	Complete &
	Finally;
