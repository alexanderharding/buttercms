import { Posts } from './posts';

export type RecentPosts<
	Slug extends string = string,
	AuthorSlug extends string = string,
	TagSlug extends string = string,
	CategorySlug extends string = string,
> = Readonly<{ recent_posts: Posts<Slug, AuthorSlug, TagSlug, CategorySlug> }>;
