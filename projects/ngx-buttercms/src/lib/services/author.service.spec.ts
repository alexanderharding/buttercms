import { AuthorService } from './author.service';
import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Injector, runInInjectionContext } from '@angular/core';
import { requestMarker } from '../constants';
import {
	Author,
	Authors,
	AuthorsWithRecentPosts,
	RecentPosts,
	Response,
} from '../types';
import { fakeAsync } from '@angular/core/testing';
import { httpParameterCodec as encoder } from '../constants';
import { of } from 'rxjs';
import { provide } from 'ngx-dependency-injection-interop';

describe(AuthorService.name, () => {
	describe(AuthorService.prototype.get.name, () => {
		it(`should call ${HttpClient.prototype.get.name} method on ${HttpClient.name} once with correct value when no arguments are provided`, fakeAsync(() => {
			// Arrange
			const httpMock = jasmine.createSpyObj<HttpClient>(HttpClient.name, [
				'get',
			]);
			const injector = Injector.create({
				providers: [provide(HttpClient).useValue(httpMock)],
			});
			const service = runInInjectionContext(
				injector,
				() => new AuthorService(),
			);
			httpMock.get.and.returnValue(of(undefined));

			// Act
			service.get();

			// Assert
			expect(httpMock.get).toHaveBeenCalledOnceWith('/authors/', {
				params: new HttpParams({ fromObject: {}, encoder }),
				context: new HttpContext().set(requestMarker, void 0),
			});
		}));

		it(`should emit correct value when no arguments are provided`, fakeAsync(() => {
			// Arrange
			const responseMock: Response<Authors> = {
				data: Array.from({ length: 20 }, createAuthorMock),
			};
			const httpMock = jasmine.createSpyObj<HttpClient>(HttpClient.name, [
				'get',
			]);
			const injector = Injector.create({
				providers: [provide(HttpClient).useValue(httpMock)],
			});
			const service = runInInjectionContext(
				injector,
				() => new AuthorService(),
			);
			httpMock.get.and.returnValue(of(responseMock));

			// Act
			let response: Response<Authors> | undefined;
			service
				.get()
				.subscribe((value) => (response = value))
				.unsubscribe();

			// Assert
			expect(response).toEqual(responseMock);
		}));

		it(`should call ${HttpClient.prototype.get.name} method on ${HttpClient.name} once with correct value when options are provided`, fakeAsync(() => {
			// Arrange
			const httpMock = jasmine.createSpyObj<HttpClient>(HttpClient.name, [
				'get',
			]);
			const injector = Injector.create({
				providers: [provide(HttpClient).useValue(httpMock)],
			});
			const service = runInInjectionContext(
				injector,
				() => new AuthorService(),
			);
			httpMock.get.and.returnValue(of(undefined));

			// Act
			service.get({ include: 'recent_posts' });

			// Assert
			expect(httpMock.get).toHaveBeenCalledOnceWith('/authors/', {
				params: new HttpParams({
					fromObject: { include: 'recent_posts' },
					encoder,
				}),
				context: new HttpContext().set(requestMarker, void 0),
			});
		}));

		it(`should emit correct value when options are provided`, fakeAsync(() => {
			// Arrange
			const responseMock: Response<AuthorsWithRecentPosts> = { data: [] };
			const httpMock = jasmine.createSpyObj<HttpClient>(HttpClient.name, [
				'get',
			]);
			const injector = Injector.create({
				providers: [provide(HttpClient).useValue(httpMock)],
			});
			const service = runInInjectionContext(
				injector,
				() => new AuthorService(),
			);
			httpMock.get.and.returnValue(of(responseMock));

			// Act
			let response: Response<AuthorsWithRecentPosts> | undefined;
			service
				.get({ include: 'recent_posts' })
				.subscribe((value) => (response = value))
				.unsubscribe();

			// Assert
			expect(response).toEqual(responseMock);
		}));

		it(`should call ${HttpClient.prototype.get.name} method on ${HttpClient.name} once with correct value when slug is provided`, fakeAsync(() => {
			// Arrange
			const slugMock = 'slug';
			const httpMock = jasmine.createSpyObj<HttpClient>(HttpClient.name, [
				'get',
			]);
			const injector = Injector.create({
				providers: [provide(HttpClient).useValue(httpMock)],
			});
			const service = runInInjectionContext(
				injector,
				() => new AuthorService(),
			);
			httpMock.get.and.returnValue(of(undefined));

			// Act
			service.get(slugMock);

			// Assert
			expect(httpMock.get).toHaveBeenCalledOnceWith(`/authors/${slugMock}/`, {
				params: new HttpParams({ fromObject: {}, encoder }),
				context: new HttpContext().set(requestMarker, void 0),
			});
		}));

		it(`should emit correct value when slug is provided`, fakeAsync(() => {
			// Arrange
			const slugMock = 'slug';
			const responseMock: Response<Author> = { data: createAuthorMock() };
			const httpMock = jasmine.createSpyObj<HttpClient>(HttpClient.name, [
				'get',
			]);
			const injector = Injector.create({
				providers: [provide(HttpClient).useValue(httpMock)],
			});
			const service = runInInjectionContext(
				injector,
				() => new AuthorService(),
			);
			httpMock.get.and.returnValue(of(responseMock));

			// Act
			let response: Response<Author> | undefined;
			service
				.get(slugMock)
				.subscribe((value) => (response = value))
				.unsubscribe();

			// Assert
			expect(response).toEqual(responseMock);
		}));

		it(`should call ${HttpClient.prototype.get.name} method on ${HttpClient.name} once with correct value when slug and options are provided`, fakeAsync(() => {
			// Arrange
			const slugMock = 'slug';
			const httpMock = jasmine.createSpyObj<HttpClient>(HttpClient.name, [
				'get',
			]);
			const injector = Injector.create({
				providers: [provide(HttpClient).useValue(httpMock)],
			});
			const service = runInInjectionContext(
				injector,
				() => new AuthorService(),
			);
			httpMock.get.and.returnValue(of(undefined));

			// Act
			service
				.get(slugMock, { include: 'recent_posts' })
				.subscribe()
				.unsubscribe();

			// Assert
			expect(httpMock.get).toHaveBeenCalledOnceWith(`/authors/${slugMock}/`, {
				params: new HttpParams({
					fromObject: { include: 'recent_posts' },
					encoder,
				}),
				context: new HttpContext().set(requestMarker, void 0),
			});
		}));

		it(`should emit correct value when slug and options are provided`, fakeAsync(() => {
			// Arrange
			const slugMock = 'slug';
			const responseMock: Response<ReadonlyArray<Author & RecentPosts>> = {
				data: [],
			};
			const httpMock = jasmine.createSpyObj<HttpClient>(HttpClient.name, [
				'get',
			]);
			const injector = Injector.create({
				providers: [provide(HttpClient).useValue(httpMock)],
			});
			const service = runInInjectionContext(
				injector,
				() => new AuthorService(),
			);
			httpMock.get.and.returnValue(of(responseMock));

			// Act
			let response: Response<AuthorsWithRecentPosts> | undefined;
			service
				.get(slugMock, { include: 'recent_posts' })
				.subscribe((value) => (response = value))
				.unsubscribe();

			// Assert
			expect(response).toEqual(responseMock);
		}));
	});
});

function createAuthorMock(): Author {
	return {
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
	};
}
