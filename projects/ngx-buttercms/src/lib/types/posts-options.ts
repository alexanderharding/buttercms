export type PostsOptions<
	AuthorSlug extends string = string,
	CategorySlug extends string = string,
	TagSlug extends string = string,
> = Readonly<
	Partial<{
		tag_slug: TagSlug;
		exclude_body: boolean;
		page: number;
		page_size: number;
		author_slug: AuthorSlug;
		category_slug: CategorySlug;
	}>
>;
