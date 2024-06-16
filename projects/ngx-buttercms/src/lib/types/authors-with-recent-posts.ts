import { AuthorWithRecentPosts } from './author-with-recent-posts';

export type AuthorsWithRecentPosts<
	Slug extends string = string,
	PostSlug extends string = string,
	TagSlug extends string = string,
	CategorySlug extends string = string,
> = ReadonlyArray<AuthorWithRecentPosts<Slug, PostSlug, TagSlug, CategorySlug>>;
