import { Author } from './author';
import { RecentPosts } from './recent-posts';

export type AuthorWithRecentPosts<
	Slug extends string = string,
	PostSlug extends string = string,
	TagSlug extends string = string,
	CategorySlug extends string = string,
> = Author<Slug> & RecentPosts<PostSlug, Slug, TagSlug, CategorySlug>;
