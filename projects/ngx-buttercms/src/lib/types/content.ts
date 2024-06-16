import { Collections } from './collections';

export type Content<
	Fields extends Readonly<Record<keyof unknown, unknown>> = Readonly<
		Record<keyof unknown, unknown>
	>,
	Type extends string = string,
> = Readonly<Record<Type, Collections<Fields>>>;
