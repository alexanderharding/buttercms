import { Observable } from 'rxjs';
import { Injectable, inject } from '@angular/core';
import {
	Post,
	PostSearchOptions,
	Posts,
	PostsOptions,
	PaginatedResponse,
	Response,
} from '../types';
import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { httpParameterCodec as encoder } from '../constants';
import { requestMarker } from '../constants';

@Injectable({ providedIn: 'root' })
export class PostService {
	readonly #http = inject(HttpClient);

	get<
		Slug extends string = string,
		AuthorSlug extends string = string,
		TagSlug extends string = string,
		CategorySlug extends string = string,
	>(
		options?: PostsOptions<AuthorSlug, CategorySlug, TagSlug>,
	): Observable<
		PaginatedResponse<Posts<Slug, AuthorSlug, TagSlug, CategorySlug>>
	>;
	get<
		Slug extends string = string,
		AuthorSlug extends string = string,
		TagSlug extends string = string,
		CategorySlug extends string = string,
	>(
		slug: Slug,
	): Observable<Response<Post<Slug, AuthorSlug, TagSlug, CategorySlug>>>;
	get(
		slugOrOptions?: string | PostsOptions,
	): Observable<Response<Post> | PaginatedResponse<Posts>> {
		let url = `/posts/`;
		let options: PostsOptions | undefined;
		typeof slugOrOptions === 'string'
			? (url += `${slugOrOptions}/`)
			: (options = slugOrOptions);
		return this.#http.get<Response<Post> | PaginatedResponse<Posts>>(url, {
			params: new HttpParams({ fromObject: options, encoder }),
			context: new HttpContext().set(requestMarker, void 0),
		});
	}

	search<
		Slug extends string = string,
		AuthorSlug extends string = string,
		TagSlug extends string = string,
		CategorySlug extends string = string,
	>(
		query: string,
		options?: PostSearchOptions,
	): Observable<Response<Posts<Slug, AuthorSlug, TagSlug, CategorySlug>>> {
		return this.#http.get<
			Response<Posts<Slug, AuthorSlug, TagSlug, CategorySlug>>
		>('/posts/search/', {
			params: new HttpParams({ fromObject: { ...options, query }, encoder }),
			context: new HttpContext().set(requestMarker, void 0),
		});
	}
}
