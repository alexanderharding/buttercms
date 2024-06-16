import { ArrayBuilder } from '@shared/testing';
import { Author } from '../types';
import { AuthorBuilder } from './author';

export class AuthorsBuilder extends ArrayBuilder<Author> {
	constructor() {
		super(AuthorBuilder);
	}
}
