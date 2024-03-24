export type PaginationMeta = Readonly<{
	next_page: number | null;
	previous_page: number | null;
	count: number;
}>;
