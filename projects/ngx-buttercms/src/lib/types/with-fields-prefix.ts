/**
 * @description This is a complex utility type that is meant to support a niche feature. Do NOT use directly.
 */
type FlatKeys<
	T,
	Prefix extends string = '',
	Depth extends number = 9,
> = Depth extends 0
	? never
	: T extends Readonly<Record<PropertyKey, any>>
		? {
				[K in keyof T]-?: FlatKeys<
					T[K],
					`${Prefix}${Prefix extends '' ? '' : '.'}${K & string}`,
					Prev[Depth]
				>;
			}[keyof T]
		: Prefix;

/**
 * @description This is a complex utility type that is meant to support a niche feature. Do NOT use directly.
 */
type FlatValue<Type, Key> = Key extends `${infer I}.${infer J}`
	? I extends keyof Type
		? FlatValue<NonNullable<Type[I]>, J>
		: never
	: Key extends keyof Type
		? Type[Key]
		: never;

export type WithFieldsPrefix<
	Type extends Readonly<Record<keyof unknown, unknown>> = Readonly<
		Record<keyof unknown, unknown>
	>,
> = {
	[Key in FlatKeys<Type> as Key extends string
		? `fields.${Key}`
		: never]: FlatValue<NonNullable<Type>, Key>;
} extends infer O
	? O extends Record<string, never>
		? never
		: O
	: never;

/**
 * @description Utility type for decrementing depth. Do NOT use directly.
 */
type Prev = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, ...ReadonlyArray<0>];
