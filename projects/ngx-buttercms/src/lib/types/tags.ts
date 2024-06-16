import { Tag } from './tag';

export type Tags<
	Slug extends string = string,
	PostSlug extends string = string,
	AuthorSlug extends string = string,
	CategorySlug extends string = string,
> = ReadonlyArray<Tag<Slug, PostSlug, AuthorSlug, CategorySlug>>;
