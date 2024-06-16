import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Injector, runInInjectionContext } from '@angular/core';
import { requestMarker } from '../constants';
import { Content, ContentOptions, PaginatedResponse } from '../types';
import { fakeAsync } from '@angular/core/testing';
import { httpParameterCodec as encoder } from '@shared/http-client-interop';
import { ContentService } from './content.service';
import { provide } from '@shared/dependency-injection-interop';
import { autoMocker, observableReader } from '@shared/testing';

describe(ContentService.name, () => {
	describe(ContentService.prototype.get.name, () => {
		it(`should call get method on ${HttpClient.name} once with correct value when type is provided`, fakeAsync(() => {
			// Arrange
			const typeMock = chance.string();
			const httpMock = autoMocker.mock(HttpClient);
			const injector = Injector.create({
				providers: [provide(HttpClient).useValue(httpMock)],
			});
			const service = runInInjectionContext(
				injector,
				() => new ContentService(),
			);
			autoMocker.withReturnObservable(httpMock.get, undefined);

			// Act
			observableReader.readNextSynchronously(service.get(typeMock));

			// Assert
			expect(httpMock.get).toHaveBeenCalledOnceWith('/content/', {
				params: new HttpParams({ fromObject: { keys: typeMock }, encoder }),
				context: new HttpContext().set(requestMarker, void 0),
			});
		}));

		it(`should emit correct value when type is provided`, fakeAsync(() => {
			// Arrange
			const typeMock = chance.string();
			const expected: PaginatedResponse<Content> = {
				data: {},
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
				() => new ContentService(),
			);
			autoMocker.withReturnObservable(httpMock.get, expected);

			// Act
			const actual = observableReader.readNextSynchronously(
				service.get(typeMock),
			);

			// Assert
			expect(actual).toEqual(expected);
		}));

		it(`should call get method on ${HttpClient.name} once with correct value when type and options are provided`, fakeAsync(() => {
			// Arrange
			const optionsMock: ContentOptions<Readonly<{ text: string }>> = {
				levels: chance.integer(),
				page: chance.integer(),
			};
			const typeMock = chance.string();
			const httpMock = autoMocker.mock(HttpClient);
			const injector = Injector.create({
				providers: [provide(HttpClient).useValue(httpMock)],
			});
			const service = runInInjectionContext(
				injector,
				() => new ContentService(),
			);
			autoMocker.withReturnObservable(httpMock.get, undefined);

			// Act
			observableReader.readNextSynchronously(
				service.get<Readonly<{ text: string }>>(typeMock, optionsMock),
			);

			// Assert
			expect(httpMock.get).toHaveBeenCalledOnceWith('/content/', {
				params: new HttpParams({
					fromObject: { ...optionsMock, keys: typeMock },
					encoder,
				}),
				context: new HttpContext().set(requestMarker, void 0),
			});
		}));

		it(`should emit correct value when type and options are provided`, fakeAsync(() => {
			// Arrange
			const optionsMock: ContentOptions<Readonly<{ text: string }>> = {
				levels: chance.integer(),
				page: chance.integer(),
			};
			const typeMock = chance.string();
			const expected: PaginatedResponse<Content<Readonly<{ text: string }>>> = {
				data: {},
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
				() => new ContentService(),
			);
			autoMocker.withReturnObservable(httpMock.get, expected);

			// Act
			const actual = observableReader.readNextSynchronously(
				service.get<Readonly<{ text: string }>>(typeMock, optionsMock),
			);

			// Assert
			expect(actual).toEqual(expected);
		}));
	});
});
