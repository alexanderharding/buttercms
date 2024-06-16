import { fakeAsync } from '@angular/core/testing';
import { PageService } from './page.service';
import { Injector, runInInjectionContext } from '@angular/core';
import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { requestMarker } from '../constants';
import { httpParameterCodec as encoder } from '@shared/http-client-interop';
import {
	Page,
	PageOptions,
	PageSearchOptions,
	Pages,
	PagesOptions,
	PaginatedResponse,
} from '../types';
import { provide } from '@shared/dependency-injection-interop';
import { autoMocker, observableReader } from '@shared/testing';

describe(PageService.name, () => {
	describe(PageService.prototype.get.name, () => {
		it('should call get method on HttpClient once with correct value when only the type is supplied', fakeAsync(() => {
			// Arrange
			const typeMock = chance.string();
			const httpMock = autoMocker.mock(HttpClient);
			const injector = Injector.create({
				providers: [provide(HttpClient).useValue(httpMock)],
			});
			const service = runInInjectionContext(injector, () => new PageService());
			autoMocker.withReturnObservable(httpMock.get, undefined);

			// Act
			observableReader.readNextSynchronously(service.get(typeMock));

			// Assert
			expect(httpMock.get).toHaveBeenCalledOnceWith(`/pages/${typeMock}/`, {
				params: new HttpParams({ fromObject: {}, encoder }),
				context: new HttpContext().set(requestMarker, void 0),
			});
		}));

		it('should call get method on HttpClient once with correct value when the type and options are supplied', fakeAsync(() => {
			// Arrange
			const typeMock = chance.string();
			const optionsMock: PagesOptions<Readonly<{ text: string }>> = {
				levels: chance.integer(),
				page: chance.integer(),
			};
			const httpMock = autoMocker.mock(HttpClient);
			const injector = Injector.create({
				providers: [provide(HttpClient).useValue(httpMock)],
			});
			const service = runInInjectionContext(injector, () => new PageService());
			autoMocker.withReturnObservable(httpMock.get, undefined);

			// Act
			observableReader.readNextSynchronously(
				service.get<Readonly<{ text: string }>>(typeMock, optionsMock),
			);

			// Assert
			expect(httpMock.get).toHaveBeenCalledOnceWith(`/pages/${typeMock}/`, {
				params: new HttpParams({ fromObject: optionsMock, encoder }),
				context: new HttpContext().set(requestMarker, void 0),
			});
		}));

		it('should call get method on HttpClient once with correct value when the type and slug are supplied', fakeAsync(() => {
			// Arrange
			const typeMock = chance.string();
			const slugMock = chance.string();
			const httpMock = autoMocker.mock(HttpClient);
			const injector = Injector.create({
				providers: [provide(HttpClient).useValue(httpMock)],
			});
			const service = runInInjectionContext(injector, () => new PageService());
			autoMocker.withReturnObservable(httpMock.get, undefined);

			// Act
			observableReader.readNextSynchronously(service.get(typeMock, slugMock));

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
			const typeMock = chance.string();
			const slugMock = chance.string();
			const optionsMock: PageOptions = {
				levels: chance.integer(),
			};
			const httpMock = autoMocker.mock(HttpClient);
			const injector = Injector.create({
				providers: [provide(HttpClient).useValue(httpMock)],
			});
			const service = runInInjectionContext(injector, () => new PageService());
			autoMocker.withReturnObservable(httpMock.get, undefined);

			// Act
			observableReader.readNextSynchronously(
				service.get(typeMock, slugMock, optionsMock),
			);

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
			const expected: PaginatedResponse<Pages> = {
				data: pagesMock,
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
			const service = runInInjectionContext(injector, () => new PageService());
			autoMocker.withReturnObservable(httpMock.get, expected);

			// Act
			const actual = observableReader.readNextSynchronously(
				service.search(queryMock),
			);

			// Assert
			expect(httpMock.get).toHaveBeenCalledOnceWith(`/pages/search/`, {
				params: new HttpParams({ fromObject: { query: queryMock }, encoder }),
				context: new HttpContext().set(requestMarker, void 0),
			});
			expect(actual).toEqual(expected);
		}));

		it('should call get method on HttpClient once with correct value when the query and options args are supplied and return correct value', fakeAsync(() => {
			// Arrange
			const pagesMock: Pages = Array.from({ length: 5 }, createPageMock);
			const optionsMock: PageSearchOptions = {
				levels: chance.integer(),
				page: chance.integer(),
			};
			const expected: PaginatedResponse<Pages> = {
				data: pagesMock,
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
			const service = runInInjectionContext(injector, () => new PageService());
			autoMocker.withReturnObservable(httpMock.get, expected);

			// Act
			const actual = observableReader.readNextSynchronously(
				service.search(queryMock, optionsMock),
			);

			// Assert
			expect(httpMock.get).toHaveBeenCalledOnceWith(`/pages/search/`, {
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

function createPageMock(): Page {
	return {
		fields: {},
		name: chance.string(),
		slug: chance.string(),
		page_type: chance.string(),
		published: chance.date().toISOString(),
		updated: chance.date().toISOString(),
	};
}
