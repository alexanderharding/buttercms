import type { DefaultIn } from './default-in';
import type { TransformFn } from './transform-fn';

export interface BroadcastChannelSubjectConfig<In = DefaultIn, Out = In> {
	/**
	 * The name of the underlying {@linkcode BroadcastChannel}.
	 */
	readonly name: string;
	/**
	 * A function that transforms a {@linkcode MessageEvent} into an {@linkcode Out|output value}.
	 * @default (event) => event.data
	 */
	readonly transform?: TransformFn<In, Out>;
}

/** @internal */
const defaultTransform: TransformFn<unknown, unknown> = ({ data }) => data;

/** @internal */
// This is a little hacky, but ultimately it's up to the consumer of the BroadcastChannelSubject
// to type `In` and `Out` correctly.
export function normalize<In = DefaultIn, Out = In>(
	nameOrConfig: string | BroadcastChannelSubjectConfig<In, Out>,
): Required<BroadcastChannelSubjectConfig<In, Out>>;
export function normalize(
	nameOrConfig: string | BroadcastChannelSubjectConfig<unknown, unknown>,
): Required<BroadcastChannelSubjectConfig<unknown, unknown>> {
	const base = { transform: defaultTransform };
	return typeof nameOrConfig === 'string'
		? { name: nameOrConfig, ...base }
		: { ...base, ...nameOrConfig };
}
