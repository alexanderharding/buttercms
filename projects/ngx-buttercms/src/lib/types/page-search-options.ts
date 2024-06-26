export type PageSearchOptions<Type extends string = string> = Readonly<
	Partial<{
		page: number;
		page_type: Type;
		locale: string;
		levels: number;
		page_size: number;
	}>
>;
