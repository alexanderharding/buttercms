import { Page } from './page';

export type Pages<
  Fields extends Readonly<Record<keyof unknown & string, unknown>> = Readonly<
    Record<keyof unknown & string, unknown>
  >,
  Type extends string = string,
  Slug extends string = string
> = ReadonlyArray<Page<Fields, Type, Slug>>;
