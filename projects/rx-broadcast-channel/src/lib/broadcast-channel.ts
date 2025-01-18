import { BroadcastChannelSubject } from './broadcast-channel-subject';
import type { BroadcastChannelSubjectConfig } from './broadcast-channel-subject-config';
import type { DefaultIn } from './default-in';

/**
 * @usage Construct a {@linkcode BroadcastChannelSubject} with a name or configuration.
 */
export function broadcastChannel<Value = DefaultIn>(
	name: string,
): BroadcastChannelSubject<Value, Value>;
export function broadcastChannel<In = DefaultIn, Out = In>(
	config: BroadcastChannelSubjectConfig<In, Out>,
): BroadcastChannelSubject<In, Out>;
export function broadcastChannel<In = DefaultIn, Out = In>(
	nameOrConfig: string | BroadcastChannelSubjectConfig<In, Out>,
): BroadcastChannelSubject<In, Out>;
export function broadcastChannel<In = DefaultIn, Out = In>(
	nameOrConfig: string | BroadcastChannelSubjectConfig<In, Out>,
): BroadcastChannelSubject<In, Out> {
	return new BroadcastChannelSubject<In, Out>(nameOrConfig);
}
