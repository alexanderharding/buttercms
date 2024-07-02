import { fakeAsync } from '@angular/core/testing';
import { Injector, runInInjectionContext } from '@angular/core';
import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { requestMarker } from '../constants';
import { PostService } from './post.service';
import { httpParameterCodec as encoder } from '../constants';
import {
	PaginatedResponse,
	Post,
	PostSearchOptions,
	Posts,
	PostsOptions,
	Response,
} from '../types';
import { of } from 'rxjs';

describe(PostService.name, () => {
	describe(PostService.prototype.get.name, () => {
		it(`should call ${HttpClient.prototype.get.name} method on ${HttpClient.name} once with correct value when the options are supplied`, fakeAsync(() => {
			// Arrange
			const postMock = createPostMock();
			const optionsMock: PostsOptions = {
				author_slug: 'author_slug',
				category_slug: 'category_slug',
			};
			const responseMock: Response<Post> = { data: postMock };
			const httpMock = jasmine.createSpyObj<HttpClient>(HttpClient.name, [
				'get',
			]);
			const injector = Injector.create({
				providers: [{ provide: HttpClient, useValue: httpMock }],
			});
			const service = runInInjectionContext(injector, () => new PostService());
			httpMock.get.and.returnValue(of(responseMock));

			// Act
			service.get(optionsMock);

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
				author_slug: 'author_slug',
				category_slug: 'category_slug',
			};
			const responseMock: PaginatedResponse<Posts> = {
				data: postsMock,
				meta: { count: 20, next_page: 3, previous_page: 1 },
			};
			const httpMock = jasmine.createSpyObj<HttpClient>(HttpClient.name, [
				'get',
			]);
			const injector = Injector.create({
				providers: [{ provide: HttpClient, useValue: httpMock }],
			});
			const service = runInInjectionContext(injector, () => new PostService());
			httpMock.get.and.returnValue(of(responseMock));

			// Act
			let response: PaginatedResponse<Posts> | undefined;
			service
				.get(optionsMock)
				.subscribe((value) => (response = value))
				.unsubscribe();

			// Assert
			expect(response).toEqual(responseMock);
		}));

		it(`should call ${HttpClient.prototype.get.name} method on ${HttpClient.name} once with correct value when the slug is supplied`, fakeAsync(() => {
			// Arrange
			const postMock = createPostMock();
			const responseMock: Response<Post> = { data: postMock };
			const slugMock = 'slug';
			const httpMock = jasmine.createSpyObj<HttpClient>(HttpClient.name, [
				'get',
			]);
			const injector = Injector.create({
				providers: [{ provide: HttpClient, useValue: httpMock }],
			});
			const service = runInInjectionContext(injector, () => new PostService());
			httpMock.get.and.returnValue(of(responseMock));

			// Act
			service.get(slugMock);

			// Assert
			expect(httpMock.get).toHaveBeenCalledOnceWith(`/posts/${slugMock}/`, {
				params: new HttpParams({ fromObject: {}, encoder }),
				context: new HttpContext().set(requestMarker, void 0),
			});
		}));

		it(`should emit correct value when the slug is supplied`, fakeAsync(() => {
			// Arrange
			const postMock = createPostMock();
			const responseMock: Response<Post> = { data: postMock };
			const slugMock = 'slug';
			const httpMock = jasmine.createSpyObj<HttpClient>(HttpClient.name, [
				'get',
			]);
			const injector = Injector.create({
				providers: [{ provide: HttpClient, useValue: httpMock }],
			});
			const service = runInInjectionContext(injector, () => new PostService());
			httpMock.get.and.returnValue(of(responseMock));

			// Act
			let response: Response<Post> | undefined;
			service
				.get(slugMock)
				.subscribe((value) => (response = value))
				.unsubscribe();

			// Assert
			expect(response).toEqual(responseMock);
		}));
	});

	describe(PostService.prototype.search.name, () => {
		it('should call get method on HttpClient once with correct value when the query arg is supplied and return correct value', fakeAsync(() => {
			// Arrange
			const postsMock = Array.from({ length: 3 }, createPostMock);
			const responseMock: Response<Posts> = { data: postsMock };
			const queryMock = 'query';
			const httpMock = jasmine.createSpyObj<HttpClient>(HttpClient.name, [
				'get',
			]);
			const injector = Injector.create({
				providers: [{ provide: HttpClient, useValue: httpMock }],
			});
			const service = runInInjectionContext(injector, () => new PostService());
			httpMock.get.and.returnValue(of(responseMock));

			// Act
			let response: Response<Posts> | undefined;
			service
				.search(queryMock)
				.subscribe((value) => (response = value))
				.unsubscribe();

			// Assert
			expect(httpMock.get).toHaveBeenCalledOnceWith(`/posts/search/`, {
				params: new HttpParams({ fromObject: { query: queryMock }, encoder }),
				context: new HttpContext().set(requestMarker, void 0),
			});
			expect(response).toEqual(responseMock);
		}));

		it('should call get method on HttpClient once with correct value when the query and options args are supplied and return correct value', fakeAsync(() => {
			// Arrange
			const postsMock = Array.from({ length: 3 }, createPostMock);
			const optionsMock: PostSearchOptions = {
				page: 2,
			};
			const responseMock: Response<Posts> = { data: postsMock };
			const queryMock = 'query';
			const httpMock = jasmine.createSpyObj<HttpClient>(HttpClient.name, [
				'get',
			]);
			const injector = Injector.create({
				providers: [{ provide: HttpClient, useValue: httpMock }],
			});
			const service = runInInjectionContext(injector, () => new PostService());
			httpMock.get.and.returnValue(of(responseMock));

			// Act
			let response: Response<Posts> | undefined;
			service
				.search(queryMock, optionsMock)
				.subscribe((value) => (response = value))
				.unsubscribe();

			// Assert
			expect(httpMock.get).toHaveBeenCalledOnceWith(`/posts/search/`, {
				params: new HttpParams({
					fromObject: { ...optionsMock, query: queryMock },
					encoder,
				}),
				context: new HttpContext().set(requestMarker, void 0),
			});
			expect(response).toEqual(responseMock);
		}));
	});
});

function createPostMock(): Post {
	return {
		author: {
			bio: 'bio',
			email: 'example@example.com',
			first_name: 'first_name',
			facebook_url: 'https://www.example.com',
			instagram_url: 'https://www.example.com',
			last_name: 'last_name',
			linkedin_url: 'https://www.example.com',
			pinterest_url: 'https://www.example.com',
			profile_image: 'https://www.example.com',
			slug: 'slug',
			title: 'title',
			twitter_handle: 'twitter_handle',
		},
		categories: [],
		created: new Date().toISOString(),
		featured_image: 'https://www.example.com',
		slug: 'slug',
		tags: [],
		featured_image_alt: 'featured_image_alt',
		title: 'title',
		meta_description: 'meta_description',
		published: new Date().toISOString(),
		seo_title: 'seo_title',
		status: 'published',
		summary: 'summary',
		updated: new Date().toISOString(),
		url: 'https://www.example.com',
	};
}
