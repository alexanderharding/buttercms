export type Order<
	Fields extends Readonly<Record<keyof unknown, unknown>> = Readonly<
		Record<keyof unknown, unknown>
	>,
> = keyof Readonly<{
	[Key in keyof Fields & string as Fields[Key] extends string | number | boolean
		? `${'-' | ''}${Key}`
		: never]: Fields[Key];
}>;
