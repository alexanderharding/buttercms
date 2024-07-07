import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { httpParameterCodec as encoder } from '../constants';
import { Observable } from 'rxjs';
import {
	Author,
	AuthorOptions,
	Authors,
	Response,
	AuthorsWithRecentPosts,
} from '../types';
import { requestMarker } from '../constants';

@Injectable({ providedIn: 'root' })
export class AuthorService {
	readonly #http = inject(HttpClient);

	get<Slug extends string = string>(): Observable<Response<Authors<Slug>>>;
	get<
		Slug extends string = string,
		PostSlug extends string = string,
		TagSlug extends string = string,
		CategorySlug extends string = string,
	>(
		options: AuthorOptions,
	): Observable<
		Response<AuthorsWithRecentPosts<Slug, PostSlug, TagSlug, CategorySlug>>
	>;
	get<Slug extends string = string>(
		slug: Slug,
	): Observable<Response<Author<Slug>>>;
	get<
		Slug extends string = string,
		PostSlug extends string = string,
		TagSlug extends string = string,
		CategorySlug extends string = string,
	>(
		slug: Slug,
		options: AuthorOptions,
	): Observable<
		Response<AuthorsWithRecentPosts<Slug, PostSlug, TagSlug, CategorySlug>>
	>;
	get(
		slugOrOptions?: string | AuthorOptions,
		options?: Partial<AuthorOptions>,
	): Observable<Response<Author | Authors>> {
		let url = `/authors/`;
		typeof slugOrOptions === 'string'
			? (url += `${slugOrOptions}/`)
			: (options = { ...options, ...slugOrOptions });
		return this.#http.get<Response<Author | Authors>>(url, {
			params: new HttpParams({ fromObject: options, encoder }),
			context: new HttpContext().set(requestMarker, void 0),
		});
	}
}
