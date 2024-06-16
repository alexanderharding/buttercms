import { Order } from './order';
import { WithFieldsPrefix } from './with-fields-prefix';

export type PagesOptions<
	Fields extends Readonly<Record<keyof unknown, unknown>> = Readonly<
		Record<keyof unknown, unknown>
	>,
> = Readonly<
	Partial<
		| { page_size: number; levels: number; order: Order<Fields>; page: number }
		| WithFieldsPrefix<Fields>
	>
>;
