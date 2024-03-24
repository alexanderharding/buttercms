export type Order<
  Fields extends Readonly<Record<keyof unknown & string, unknown>> = Readonly<
    Record<keyof unknown & string, unknown>
  >
> = keyof Readonly<{
  [Key in keyof Fields & string as Fields[Key] extends string | number | boolean
    ? `${'-' | ''}${Key}`
    : never]: Fields[Key];
}>;
