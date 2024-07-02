import { fakeAsync } from '@angular/core/testing';
import { PageService } from './page.service';
import { Injector, runInInjectionContext } from '@angular/core';
import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { requestMarker } from '../constants';
import { httpParameterCodec as encoder } from '../constants';
import {
	Page,
	PageOptions,
	PageSearchOptions,
	Pages,
	PagesOptions,
	PaginatedResponse,
} from '../types';
import { of } from 'rxjs';

describe(PageService.name, () => {
	describe(PageService.prototype.get.name, () => {
		it('should call get method on HttpClient once with correct value when only the type is supplied', fakeAsync(() => {
			// Arrange
			const typeMock = 'type';
			const httpMock = jasmine.createSpyObj<HttpClient>(HttpClient.name, [
				'get',
			]);
			const injector = Injector.create({
				providers: [{ provide: HttpClient, useValue: httpMock }],
			});
			const service = runInInjectionContext(injector, () => new PageService());
			httpMock.get.and.returnValue(of(undefined));

			// Act
			service.get(typeMock);

			// Assert
			expect(httpMock.get).toHaveBeenCalledOnceWith(`/pages/${typeMock}/`, {
				params: new HttpParams({ fromObject: {}, encoder }),
				context: new HttpContext().set(requestMarker, void 0),
			});
		}));

		it('should call get method on HttpClient once with correct value when the type and options are supplied', fakeAsync(() => {
			// Arrange
			const typeMock = 'type';
			const optionsMock: PagesOptions<Readonly<{ text: string }>> = {
				levels: 10,
				page: 2,
			};
			const httpMock = jasmine.createSpyObj<HttpClient>(HttpClient.name, [
				'get',
			]);
			const injector = Injector.create({
				providers: [{ provide: HttpClient, useValue: httpMock }],
			});
			const service = runInInjectionContext(injector, () => new PageService());
			httpMock.get.and.returnValue(of(undefined));

			// Act
			service
				.get<Readonly<{ text: string }>>(typeMock, optionsMock)
				.subscribe()
				.unsubscribe();

			// Assert
			expect(httpMock.get).toHaveBeenCalledOnceWith(`/pages/${typeMock}/`, {
				params: new HttpParams({ fromObject: optionsMock, encoder }),
				context: new HttpContext().set(requestMarker, void 0),
			});
		}));

		it('should call get method on HttpClient once with correct value when the type and slug are supplied', fakeAsync(() => {
			// Arrange
			const typeMock = 'type';
			const slugMock = 'slug';
			const httpMock = jasmine.createSpyObj<HttpClient>(HttpClient.name, [
				'get',
			]);
			const injector = Injector.create({
				providers: [{ provide: HttpClient, useValue: httpMock }],
			});
			const service = runInInjectionContext(injector, () => new PageService());
			httpMock.get.and.returnValue(of(undefined));

			// Act
			service.get(typeMock, slugMock);

			// Assert
			expect(httpMock.get).toHaveBeenCalledOnceWith(
				`/pages/${typeMock}/${slugMock}/`,
				{
					params: new HttpParams({ fromObject: {}, encoder }),
					context: new HttpContext().set(requestMarker, void 0),
				},
			);
		}));

		it('should call get method on HttpClient once with correct value when the type, slug, and options are supplied', fakeAsync(() => {
			// Arrange
			const typeMock = 'type';
			const slugMock = 'slug';
			const optionsMock: PageOptions = {
				levels: 10,
			};
			const httpMock = jasmine.createSpyObj<HttpClient>(HttpClient.name, [
				'get',
			]);
			const injector = Injector.create({
				providers: [{ provide: HttpClient, useValue: httpMock }],
			});
			const service = runInInjectionContext(injector, () => new PageService());
			httpMock.get.and.returnValue(of(undefined));

			// Act
			service.get(typeMock, slugMock, optionsMock);

			// Assert
			expect(httpMock.get).toHaveBeenCalledOnceWith(
				`/pages/${typeMock}/${slugMock}/`,
				{
					params: new HttpParams({ fromObject: optionsMock, encoder }),
					context: new HttpContext().set(requestMarker, void 0),
				},
			);
		}));
	});

	describe(PageService.prototype.search.name, () => {
		it('should call get method on HttpClient once with correct value when the query arg is supplied and return correct value', fakeAsync(() => {
			// Arrange
			const pagesMock: Pages = Array.from({ length: 5 }, createPageMock);
			const responseMock: PaginatedResponse<Pages> = {
				data: pagesMock,
				meta: { count: 20, next_page: 3, previous_page: 1 },
			};
			const queryMock = 'query';
			const httpMock = jasmine.createSpyObj<HttpClient>(HttpClient.name, [
				'get',
			]);
			const injector = Injector.create({
				providers: [{ provide: HttpClient, useValue: httpMock }],
			});
			const service = runInInjectionContext(injector, () => new PageService());
			httpMock.get.and.returnValue(of(responseMock));

			// Act
			let response: PaginatedResponse<Pages> | undefined;
			service
				.search(queryMock)
				.subscribe((value) => (response = value))
				.unsubscribe();

			// Assert
			expect(httpMock.get).toHaveBeenCalledOnceWith(`/pages/search/`, {
				params: new HttpParams({ fromObject: { query: queryMock }, encoder }),
				context: new HttpContext().set(requestMarker, void 0),
			});
			expect(response).toEqual(responseMock);
		}));

		it('should call get method on HttpClient once with correct value when the query and options args are supplied and return correct value', fakeAsync(() => {
			// Arrange
			const pagesMock: Pages = Array.from({ length: 5 }, createPageMock);
			const optionsMock: PageSearchOptions = {
				levels: 10,
				page: 2,
			};
			const responseMock: PaginatedResponse<Pages> = {
				data: pagesMock,
				meta: { count: 20, next_page: 3, previous_page: 1 },
			};
			const queryMock = 'query';
			const httpMock = jasmine.createSpyObj<HttpClient>(HttpClient.name, [
				'get',
			]);
			const injector = Injector.create({
				providers: [{ provide: HttpClient, useValue: httpMock }],
			});
			const service = runInInjectionContext(injector, () => new PageService());
			httpMock.get.and.returnValue(of(responseMock));

			// Act
			let response: PaginatedResponse<Pages> | undefined;
			service
				.search(queryMock, optionsMock)
				.subscribe((value) => (response = value))
				.unsubscribe();

			// Assert
			expect(httpMock.get).toHaveBeenCalledOnceWith(`/pages/search/`, {
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

function createPageMock(): Page {
	return {
		fields: {},
		name: 'name',
		slug: 'slug',
		page_type: 'page_type',
		published: new Date().toISOString(),
		updated: new Date().toISOString(),
	};
}
