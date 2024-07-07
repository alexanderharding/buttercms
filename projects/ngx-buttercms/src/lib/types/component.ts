export type Component<
	Type extends string = string,
	Fields extends Readonly<Record<keyof unknown, unknown>> = Readonly<
		Record<keyof unknown, unknown>
	>,
> = Readonly<{ type: Type; fields: Fields }>;
