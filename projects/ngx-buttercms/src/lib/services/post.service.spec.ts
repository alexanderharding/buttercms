import { fakeAsync } from '@angular/core/testing';
import { Injector, runInInjectionContext } from '@angular/core';
import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { requestMarker } from '../constants';
import { PostService } from './post.service';
import {
	PaginatedResponse,
	Post,
	PostSearchOptions,
	Posts,
	PostsOptions,
	Response,
} from '../types';
import { httpParameterCodec as encoder } from '@shared/http-client-interop';
import { provide } from '@shared/dependency-injection-interop';
import { autoMocker, observableReader } from '@shared/testing';

describe(PostService.name, () => {
	describe(PostService.prototype.get.name, () => {
		it(`should call get method on ${HttpClient.name} once with correct value when the options are supplied`, fakeAsync(() => {
			// Arrange
			const postMock = createPostMock();
			const optionsMock: PostsOptions = {
				author_slug: chance.string(),
				category_slug: chance.string(),
			};
			const expected: Response<Post> = { data: postMock };
			const httpMock = autoMocker.mock(HttpClient);
			const injector = Injector.create({
				providers: [provide(HttpClient).useValue(httpMock)],
			});
			const service = runInInjectionContext(injector, () => new PostService());
			autoMocker.withReturnObservable(httpMock.get, expected);

			// Act
			observableReader.readNextSynchronously(service.get(optionsMock));

			// Assert
			expect(httpMock.get).toHaveBeenCalledOnceWith(`/posts/`, {
				params: new HttpParams({ fromObject: optionsMock, encoder }),
				context: new HttpContext().set(requestMarker, void 0),
			});
		}));

		it(`should emit correct value when the options are supplied`, fakeAsync(() => {
			// Arrange
			const postsMock = Array.from({ length: 3 }, createPostMock);
			const optionsMock: PostsOptions = {
				author_slug: chance.string(),
				category_slug: chance.string(),
			};
			const expected: PaginatedResponse<Posts> = {
				data: postsMock,
				meta: {
					count: chance.integer(),
					next_page: chance.integer(),
					previous_page: chance.integer(),
				},
			};
			const httpMock = autoMocker.mock(HttpClient);
			const injector = Injector.create({
				providers: [provide(HttpClient).useValue(httpMock)],
			});
			const service = runInInjectionContext(injector, () => new PostService());
			autoMocker.withReturnObservable(httpMock.get, expected);

			// Act
			const actual = observableReader.readNextSynchronously(
				service.get(optionsMock),
			);

			// Assert
			expect(actual).toEqual(expected);
		}));

		it(`should call get method on ${HttpClient.name} once with correct value when the slug is supplied`, fakeAsync(() => {
			// Arrange
			const postMock = createPostMock();
			const expected: Response<Post> = { data: postMock };
			const slugMock = chance.string();
			const httpMock = autoMocker.mock(HttpClient);
			const injector = Injector.create({
				providers: [provide(HttpClient).useValue(httpMock)],
			});
			const service = runInInjectionContext(injector, () => new PostService());
			autoMocker.withReturnObservable(httpMock.get, expected);

			// Act
			observableReader.readNextSynchronously(service.get(slugMock));

			// Assert
			expect(httpMock.get).toHaveBeenCalledOnceWith(`/posts/${slugMock}/`, {
				params: new HttpParams({ fromObject: {}, encoder }),
				context: new HttpContext().set(requestMarker, void 0),
			});
		}));

		it(`should emit correct value when the slug is supplied`, fakeAsync(() => {
			// Arrange
			const postMock = createPostMock();
			const expected: Response<Post> = { data: postMock };
			const slugMock = chance.string();
			const httpMock = autoMocker.mock(HttpClient);
			const injector = Injector.create({
				providers: [provide(HttpClient).useValue(httpMock)],
			});
			const service = runInInjectionContext(injector, () => new PostService());
			autoMocker.withReturnObservable(httpMock.get, expected);

			// Act
			const actual = observableReader.readNextSynchronously(
				service.get(slugMock),
			);

			// Assert
			expect(actual).toEqual(expected);
		}));
	});

	describe(PostService.prototype.search.name, () => {
		it('should call get method on HttpClient once with correct value when the query arg is supplied and return correct value', fakeAsync(() => {
			// Arrange
			const postsMock = Array.from({ length: 3 }, createPostMock);
			const expected: PaginatedResponse<Posts> = {
				data: postsMock,
				meta: {
					count: chance.integer(),
					next_page: chance.integer(),
					previous_page: chance.integer(),
				},
			};
			const queryMock = chance.string();
			const httpMock = autoMocker.mock(HttpClient);
			const injector = Injector.create({
				providers: [provide(HttpClient).useValue(httpMock)],
			});
			const service = runInInjectionContext(injector, () => new PostService());
			autoMocker.withReturnObservable(httpMock.get, expected);

			// Act
			const actual = observableReader.readNextSynchronously(
				service.search(queryMock),
			);

			// Assert
			expect(httpMock.get).toHaveBeenCalledOnceWith(`/posts/search/`, {
				params: new HttpParams({ fromObject: { query: queryMock }, encoder }),
				context: new HttpContext().set(requestMarker, void 0),
			});
			expect(actual).toEqual(expected);
		}));

		it('should call get method on HttpClient once with correct value when the query and options args are supplied and return correct value', fakeAsync(() => {
			// Arrange
			const postsMock = Array.from({ length: 3 }, createPostMock);
			const optionsMock: PostSearchOptions = {
				page: chance.integer(),
			};
			const expected: PaginatedResponse<Posts> = {
				data: postsMock,
				meta: {
					count: chance.integer(),
					next_page: chance.integer(),
					previous_page: chance.integer(),
				},
			};
			const queryMock = chance.string();
			const httpMock = autoMocker.mock(HttpClient);
			const injector = Injector.create({
				providers: [provide(HttpClient).useValue(httpMock)],
			});
			const service = runInInjectionContext(injector, () => new PostService());
			autoMocker.withReturnObservable(httpMock.get, expected);

			// Act
			const actual = observableReader.readNextSynchronously(
				service.search(queryMock, optionsMock),
			);

			// Assert
			expect(httpMock.get).toHaveBeenCalledOnceWith(`/posts/search/`, {
				params: new HttpParams({
					fromObject: { ...optionsMock, query: queryMock },
					encoder,
				}),
				context: new HttpContext().set(requestMarker, void 0),
			});
			expect(actual).toEqual(expected);
		}));
	});
});

function createPostMock(): Post {
	return {
		author: {
			bio: chance.string(),
			email: chance.string(),
			first_name: chance.string(),
			facebook_url: chance.url(),
			instagram_url: chance.url(),
			last_name: chance.string(),
			linkedin_url: chance.url(),
			pinterest_url: chance.url(),
			profile_image: chance.url(),
			slug: chance.string(),
			title: chance.string(),
			twitter_handle: chance.string(),
		},
		categories: [],
		created: chance.date().toISOString(),
		featured_image: chance.url(),
		slug: chance.string(),
		tags: [],
		featured_image_alt: chance.string(),
		title: chance.string(),
		meta_description: chance.string(),
		published: chance.date().toISOString(),
		seo_title: chance.string(),
		status: chance.pickone(['published', 'draft']),
		summary: chance.string(),
		updated: chance.date().toISOString(),
		url: chance.url(),
	};
}
