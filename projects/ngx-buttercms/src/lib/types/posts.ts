import { Post } from './post';

export type Posts<
	Slug extends string = string,
	AuthorSlug extends string = string,
	TagSlug extends string = string,
	CategorySlug extends string = string,
> = ReadonlyArray<Post<Slug, AuthorSlug, TagSlug, CategorySlug>>;
