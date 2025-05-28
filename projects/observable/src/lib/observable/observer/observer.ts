import type { Notification } from './notification';
import type { Notifications } from './notifications';
import type { Unsubscribable } from '../subscription';

/**
 * The manifestation of a consumer. A type that has handlers for each type of {@linkcode Notification|notification}.
 */
export type Observer<Value = unknown> = Notifications<Value> & Unsubscribable;
