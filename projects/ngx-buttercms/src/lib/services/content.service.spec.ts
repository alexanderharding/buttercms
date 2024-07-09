import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Injector, runInInjectionContext } from '@angular/core';
import { requestMarker, httpParameterCodec as encoder } from '../constants';
import { Content, ContentOptions, PaginatedResponse } from '../types';
import { fakeAsync } from '@angular/core/testing';
import { ContentService } from './content.service';
import { of } from 'rxjs';
import { provide } from 'ngx-dependency-injection-interop';

describe(ContentService.name, () => {
	describe(ContentService.prototype.get.name, () => {
		it(`should call ${HttpClient.prototype.get.name} method on ${HttpClient.name} once with correct value when type is provided`, fakeAsync(() => {
			// Arrange
			const typeMock = 'type';
			const httpMock = jasmine.createSpyObj<HttpClient>(HttpClient.name, [
				'get',
			]);
			const injector = Injector.create({
				providers: [provide(HttpClient).useValue(httpMock)],
			});
			const service = runInInjectionContext(
				injector,
				() => new ContentService(),
			);
			httpMock.get.and.returnValue(of(undefined));

			// Act
			service.get(typeMock);

			// Assert
			expect(httpMock.get).toHaveBeenCalledOnceWith('/content/', {
				params: new HttpParams({ fromObject: { keys: typeMock }, encoder }),
				context: new HttpContext().set(requestMarker, void 0),
			});
		}));

		it(`should emit correct value when type is provided`, fakeAsync(() => {
			// Arrange
			const typeMock = 'type';
			const responseMock: PaginatedResponse<Content> = {
				data: {},
				meta: { count: 20, next_page: 3, previous_page: 1 },
			};
			const httpMock = jasmine.createSpyObj<HttpClient>(HttpClient.name, [
				'get',
			]);
			const injector = Injector.create({
				providers: [provide(HttpClient).useValue(httpMock)],
			});
			const service = runInInjectionContext(
				injector,
				() => new ContentService(),
			);
			httpMock.get.and.returnValue(of(responseMock));

			// Act
			let response: PaginatedResponse<Content> | undefined;
			service
				.get(typeMock)
				.subscribe((value) => (response = value))
				.unsubscribe();

			// Assert
			expect(response).toEqual(responseMock);
		}));

		it(`should call ${HttpClient.prototype.get.name} method on ${HttpClient.name} once with correct value when type and options are provided`, fakeAsync(() => {
			// Arrange
			const optionsMock: ContentOptions<Readonly<{ text: string }>> = {
				levels: 10,
				page: 2,
			};
			const typeMock = 'type';
			const httpMock = jasmine.createSpyObj<HttpClient>(HttpClient.name, [
				'get',
			]);
			const injector = Injector.create({
				providers: [provide(HttpClient).useValue(httpMock)],
			});
			const service = runInInjectionContext(
				injector,
				() => new ContentService(),
			);
			httpMock.get.and.returnValue(of(undefined));

			// Act
			service
				.get<Readonly<{ text: string }>>(typeMock, optionsMock)
				.subscribe()
				.unsubscribe();

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
				levels: 10,
				page: 2,
			};
			const typeMock = 'type';
			const responseMock: PaginatedResponse<
				Content<Readonly<{ text: string }>>
			> = {
				data: {},
				meta: { count: 20, next_page: 3, previous_page: 1 },
			};
			const httpMock = jasmine.createSpyObj<HttpClient>(HttpClient.name, [
				'get',
			]);
			const injector = Injector.create({
				providers: [provide(HttpClient).useValue(httpMock)],
			});
			const service = runInInjectionContext(
				injector,
				() => new ContentService(),
			);
			httpMock.get.and.returnValue(of(responseMock));

			// Ac
			let response: PaginatedResponse<Content> | undefined;
			service
				.get<Readonly<{ text: string }>>(typeMock, optionsMock)
				.subscribe((value) => (response = value))
				.unsubscribe();

			// Assert
			expect(response).toEqual(responseMock);
		}));
	});
});
