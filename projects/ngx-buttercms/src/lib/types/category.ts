import { RecentPosts } from './recent-posts';

export type Category<
	Slug extends string = string,
	PostSlug extends string = string,
	AuthorSlug extends string = string,
	TagSlug extends string = string,
> = Readonly<{ name: string; slug: Slug }> &
	Partial<RecentPosts<PostSlug, AuthorSlug, TagSlug, Slug>>;
