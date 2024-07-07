import { Component } from './component';

export type Components<
	Type extends string = string,
	Fields extends Readonly<Record<keyof unknown, unknown>> = Readonly<
		Record<keyof unknown, unknown>
	>,
> = ReadonlyArray<Component<Type, Fields>>;
