import { Collection } from './collection';

export type Collections<
	Fields extends Readonly<Record<keyof unknown, unknown>> = Readonly<
		Record<keyof unknown, unknown>
	>,
> = ReadonlyArray<Collection<Fields>>;
