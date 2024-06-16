import { AuthorService } from './author.service';
import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Injector, runInInjectionContext } from '@angular/core';
import { requestMarker } from '../constants';
import { Author, PaginatedResponse, RecentPosts } from '../types';
import { fakeAsync } from '@angular/core/testing';
import { httpParameterCodec as encoder } from '@shared/http-client-interop';
import { provide } from '@shared/dependency-injection-interop';
import { autoMocker, observableReader } from '@shared/testing';
import {
	AuthorBuilder,
	ResponseBuilder,
	AuthorsBuilder,
} from '../test-builders';

describe(AuthorService.name, () => {
	describe(AuthorService.prototype.get.name, () => {
		it(`should call get method on ${HttpClient.name} once with correct value when no arguments are provided`, fakeAsync(() => {
			// Arrange
			const httpMock = autoMocker.mock(HttpClient);
			const injector = Injector.create({
				providers: [provide(HttpClient).useValue(httpMock)],
			});
			const service = runInInjectionContext(
				injector,
				() => new AuthorService(),
			);
			autoMocker.withReturnObservable(httpMock.get, undefined);

			// Act
			observableReader.readNextSynchronously(service.get());

			// Assert
			expect(httpMock.get).toHaveBeenCalledOnceWith('/authors/', {
				params: new HttpParams({ fromObject: {}, encoder }),
				context: new HttpContext().set(requestMarker, void 0),
			});
		}));

		it(`should emit correct value when no arguments are provided`, fakeAsync(() => {
			// Arrange
			const expected = new ResponseBuilder(AuthorsBuilder).build();
			const httpMock = autoMocker.mock(HttpClient);
			const injector = Injector.create({
				providers: [provide(HttpClient).useValue(httpMock)],
			});
			const service = runInInjectionContext(
				injector,
				() => new AuthorService(),
			);
			autoMocker.withReturnObservable(httpMock.get, expected);

			// Act
			const actual = observableReader.readNextSynchronously(service.get());

			// Assert
			expect(actual).toEqual(expected);
		}));

		it(`should call get method on ${HttpClient.name} once with correct value when options are provided`, fakeAsync(() => {
			// Arrange
			const httpMock = autoMocker.mock(HttpClient);
			const injector = Injector.create({
				providers: [provide(HttpClient).useValue(httpMock)],
			});
			const service = runInInjectionContext(
				injector,
				() => new AuthorService(),
			);
			autoMocker.withReturnObservable(httpMock.get, undefined);

			// Act
			observableReader.readNextSynchronously(
				service.get({ include: 'recent_posts' }),
			);

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
			const expected: PaginatedResponse<ReadonlyArray<Author & RecentPosts>> = {
				data: [],
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
			const service = runInInjectionContext(
				injector,
				() => new AuthorService(),
			);
			autoMocker.withReturnObservable(httpMock.get, expected);

			// Act
			const actual = observableReader.readNextSynchronously(
				service.get({ include: 'recent_posts' }),
			);

			// Assert
			expect(actual).toEqual(expected);
		}));

		it(`should call get method on ${HttpClient.name} once with correct value when slug is provided`, fakeAsync(() => {
			// Arrange
			const slugMock = chance.string();
			const httpMock = autoMocker.mock(HttpClient);
			const injector = Injector.create({
				providers: [provide(HttpClient).useValue(httpMock)],
			});
			const service = runInInjectionContext(
				injector,
				() => new AuthorService(),
			);
			autoMocker.withReturnObservable(httpMock.get, undefined);

			// Act
			observableReader.readNextSynchronously(service.get(slugMock));

			// Assert
			expect(httpMock.get).toHaveBeenCalledOnceWith(`/authors/${slugMock}/`, {
				params: new HttpParams({ fromObject: {}, encoder }),
				context: new HttpContext().set(requestMarker, void 0),
			});
		}));

		it(`should emit correct value when slug is provided`, fakeAsync(() => {
			// Arrange
			const slugMock = chance.string();
			const expected = new ResponseBuilder(AuthorBuilder).build();
			const httpMock = autoMocker.mock(HttpClient);
			const injector = Injector.create({
				providers: [provide(HttpClient).useValue(httpMock)],
			});
			const service = runInInjectionContext(
				injector,
				() => new AuthorService(),
			);
			autoMocker.withReturnObservable(httpMock.get, expected);

			// Act
			const actual = observableReader.readNextSynchronously(
				service.get(slugMock),
			);

			// Assert
			expect(actual).toEqual(expected);
		}));

		it(`should call get method on ${HttpClient.name} once with correct value when slug and options are provided`, fakeAsync(() => {
			// Arrange
			const slugMock = chance.string();
			const httpMock = autoMocker.mock(HttpClient);
			const injector = Injector.create({
				providers: [provide(HttpClient).useValue(httpMock)],
			});
			const service = runInInjectionContext(
				injector,
				() => new AuthorService(),
			);
			autoMocker.withReturnObservable(httpMock.get, undefined);

			// Act
			observableReader.readNextSynchronously(
				service.get(slugMock, { include: 'recent_posts' }),
			);

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
			const slugMock = chance.string();
			const expected: PaginatedResponse<ReadonlyArray<Author & RecentPosts>> = {
				data: [],
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
			const service = runInInjectionContext(
				injector,
				() => new AuthorService(),
			);
			autoMocker.withReturnObservable(httpMock.get, expected);

			// Act
			const actual = observableReader.readNextSynchronously(
				service.get(slugMock, { include: 'recent_posts' }),
			);

			// Assert
			expect(actual).toEqual(expected);
		}));
	});
});
