import { Order, WithFieldsPrefix } from '../../../shared';

export type PagesParams<
  Fields extends Readonly<Record<keyof unknown & string, unknown>> = Readonly<
    Record<keyof unknown & string, unknown>
  >
> = Readonly<
  Partial<
    | { page_size: number; levels: number; order: Order<Fields>; page: number }
    | WithFieldsPrefix<Fields>
  >
>;
