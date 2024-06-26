export type Page<
	Fields extends Readonly<Record<keyof unknown, unknown>> = Readonly<
		Record<keyof unknown, unknown>
	>,
	Type extends string = string,
	Slug extends string = string,
> = Readonly<{
	page_type: Type;
	slug: Slug;
	name: string;
	published: string;
	updated: string;
	fields: Fields;
}>;
