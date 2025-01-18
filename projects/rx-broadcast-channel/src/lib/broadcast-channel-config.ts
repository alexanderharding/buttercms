export interface BroadcastChannelConfig<In = void, Out = In> {
	/**
	 * The name of the underlying {@linkcode BroadcastChannel}.
	 */
	readonly name: string;
	/**
	 * A function that transforms the {@linkcode MessageEvent} into an {@linkcode Out|output value}.
	 * @default (event) => event.data
	 */
	readonly transformer?: (event: MessageEvent<In>) => Out;
}
