import { RecentPosts } from './recent-posts';

export type Tag<
	Slug extends string = string,
	PostSlug extends string = string,
	AuthorSlug extends string = string,
	CategorySlug extends string = string,
> = Readonly<{ name: string; slug: Slug }> &
	Partial<RecentPosts<PostSlug, AuthorSlug, Slug, CategorySlug>>;
