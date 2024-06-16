import { AbstractBuilder } from '@shared/testing';
import { Author } from '../types';

export class AuthorBuilder extends AbstractBuilder<Author> {
	constructor() {
		super({
			bio: chance.paragraph(),
			email: chance.email(),
			facebook_url: chance.url(),
			first_name: chance.first(),
			instagram_url: chance.url(),
			last_name: chance.last(),
			linkedin_url: chance.url(),
			pinterest_url: chance.url(),
			profile_image: chance.url(),
			slug: chance.guid(),
			title: chance.sentence(),
			twitter_handle: chance.twitter(),
		});
	}
}
