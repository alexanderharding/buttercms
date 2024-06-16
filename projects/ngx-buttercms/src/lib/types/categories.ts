import { Category } from './category';

export type Categories<
	Slug extends string = string,
	PostSlug extends string = string,
	AuthorSlug extends string = string,
	TagSlug extends string = string,
> = ReadonlyArray<Category<Slug, PostSlug, AuthorSlug, TagSlug>>;
