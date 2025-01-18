import type { BroadcastChannelSubject } from './broadcast-channel-subject';
import type { DefaultIn } from './default-in';

/**
 * A function that transforms a {@linkcode MessageEvent} into an {@linkcode Out|output value}.
 */
export type TransformFn<In = DefaultIn, Out = In> = (
	this: BroadcastChannelSubject<In, Out>,
	event: MessageEvent<In>,
) => Out;
