import type { BroadcastChannelConfig } from './broadcast-channel-config';
import { BroadcastChannelSubject } from './broadcast-channel-subject';
import type { DefaultIn } from './default-in';

/**
 * @usage Construct a {@linkcode BroadcastChannelSubject} with a name or configuration.
 */
export function broadcastChannel<Value = DefaultIn>(
	name: string,
): BroadcastChannelSubject<Value, Value>;
export function broadcastChannel<In = DefaultIn, Out = In>(
	config: BroadcastChannelConfig<In, Out>,
): BroadcastChannelSubject<In, Out>;
export function broadcastChannel<In = DefaultIn, Out = In>(
	nameOrConfig: string | BroadcastChannelConfig<In, Out>,
): BroadcastChannelSubject<In, Out>;
export function broadcastChannel<In = DefaultIn, Out = In>(
	nameOrConfig: string | BroadcastChannelConfig<In, Out>,
): BroadcastChannelSubject<In, Out> {
	return new BroadcastChannelSubject<In, Out>(nameOrConfig);
}
