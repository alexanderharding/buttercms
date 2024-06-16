import { Author } from './author';

export type Authors<Slug extends string = string> = ReadonlyArray<Author<Slug>>;
