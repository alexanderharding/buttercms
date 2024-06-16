export type Author<Slug extends string = string> = Readonly<{
	first_name: string;
	last_name: string;
	email: string;
	slug: Slug;
	bio: string;
	title: string;
	linkedin_url: string;
	facebook_url: string;
	pinterest_url: string;
	instagram_url: string;
	twitter_handle: string;
	profile_image: string;
}>;
