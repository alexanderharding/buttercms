import { Author } from './author';
import { Categories } from './categories';
import { Tags } from './tags';

export type Post<
	Slug extends string = string,
	AuthorSlug extends string = string,
	TagSlug extends string = string,
	CategorySlug extends string = string,
> = Readonly<
	{
		status: 'published' | 'draft';
		created: string;
		updated: string;
		published: string;
		title: string;
		slug: Slug;
		summary: string;
		seo_title: string;
		meta_description: string;
		featured_image: string;
		featured_image_alt: string;
		url: string;
		author: Author<AuthorSlug>;
		tags: Tags<TagSlug, Slug, AuthorSlug, CategorySlug>;
		categories: Categories<CategorySlug, Slug, AuthorSlug, TagSlug>;
	} & Partial<{ body: string }>
>;
