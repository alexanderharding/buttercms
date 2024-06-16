import { Order } from './order';
import { WithFieldsPrefix } from './with-fields-prefix';

export type ContentOptions<
	Fields extends Readonly<Record<keyof unknown, unknown>> = Readonly<
		Record<keyof unknown, unknown>
	>,
> = Readonly<
	Partial<
		| { order: Order<Fields>; page: number; page_size: number; levels: number }
		| WithFieldsPrefix<Fields>
	>
>;
