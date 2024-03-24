import { PageService } from './page.service';
import { Injector, runInInjectionContext } from '@angular/core';
import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import {
  HTTP_PARAMETER_CODEC as encoder,
  PaginationMeta,
  REQUEST_MARKER,
  WrappedData,
  WrappedMeta,
} from '../../../shared';
import { NEVER, of } from 'rxjs';
import { PageParams, PageSearchParams, Pages, PagesParams } from '../models';
import { Params } from '@angular/router';

describe(PageService.name, () => {
  describe(PageService.prototype.get.name, () => {
    it(`should call ${HttpClient.prototype.get.name} method on ${HttpClient.name} once with correct value when only the type is supplied`, () => {
      // Arrange
      const typeMock = 'type mock';
      const httpMock = jasmine.createSpyObj<HttpClient>(HttpClient.name, [
        'get',
      ]);
      const injector = Injector.create({
        providers: [{ provide: HttpClient, useValue: httpMock }],
      });
      const service = runInInjectionContext(injector, () => new PageService());
      httpMock.get.and.returnValue(NEVER);

      // Act
      service.get(typeMock).subscribe().unsubscribe();

      // Assert
      expect(httpMock.get).toHaveBeenCalledOnceWith(`/pages/${typeMock}/`, {
        params: new HttpParams({ fromObject: {}, encoder }),
        context: new HttpContext().set(REQUEST_MARKER, void 0),
      });
    });

    it(`should call ${HttpClient.prototype.get.name} method on ${HttpClient.name} once with correct value when the type and params are supplied`, () => {
      // Arrange
      const typeMock = 'type mock';
      const paramsMock: PagesParams = { levels: 1, page: 5 };
      const httpMock = jasmine.createSpyObj<HttpClient>(HttpClient.name, [
        'get',
      ]);
      const injector = Injector.create({
        providers: [{ provide: HttpClient, useValue: httpMock }],
      });
      const service = runInInjectionContext(injector, () => new PageService());
      httpMock.get.and.returnValue(NEVER);

      // Act
      service.get(typeMock, paramsMock).subscribe().unsubscribe();

      // Assert
      expect(httpMock.get).toHaveBeenCalledOnceWith(`/pages/${typeMock}/`, {
        params: new HttpParams({ fromObject: paramsMock as Params, encoder }),
        context: new HttpContext().set(REQUEST_MARKER, void 0),
      });
    });

    it(`should call ${HttpClient.prototype.get.name} method on ${HttpClient.name} once with correct value when the type and slug are supplied`, () => {
      // Arrange
      const typeMock = 'type mock';
      const slugMock = 'slug mock';
      const httpMock = jasmine.createSpyObj<HttpClient>(HttpClient.name, [
        'get',
      ]);
      const injector = Injector.create({
        providers: [{ provide: HttpClient, useValue: httpMock }],
      });
      const service = runInInjectionContext(injector, () => new PageService());
      httpMock.get.and.returnValue(NEVER);

      // Act
      service.get(typeMock, slugMock).subscribe().unsubscribe();

      // Assert
      expect(httpMock.get).toHaveBeenCalledOnceWith(
        `/pages/${typeMock}/${slugMock}/`,
        {
          params: new HttpParams({ fromObject: {}, encoder }),
          context: new HttpContext().set(REQUEST_MARKER, void 0),
        }
      );
    });

    it(`should call ${HttpClient.prototype.get.name} method on ${HttpClient.name} once with correct value when the type, slug, and params are supplied`, () => {
      // Arrange
      const typeMock = 'type mock';
      const slugMock = 'slug mock';
      const paramsMock: PageParams = { levels: 1 };
      const httpMock = jasmine.createSpyObj<HttpClient>(HttpClient.name, [
        'get',
      ]);
      const injector = Injector.create({
        providers: [{ provide: HttpClient, useValue: httpMock }],
      });
      const service = runInInjectionContext(injector, () => new PageService());
      httpMock.get.and.returnValue(NEVER);

      // Act
      service.get(typeMock, slugMock, paramsMock).subscribe().unsubscribe();

      // Assert
      expect(httpMock.get).toHaveBeenCalledOnceWith(
        `/pages/${typeMock}/${slugMock}/`,
        {
          params: new HttpParams({ fromObject: paramsMock, encoder }),
          context: new HttpContext().set(REQUEST_MARKER, void 0),
        }
      );
    });
  });

  describe(PageService.prototype.search.name, () => {
    it(`should call ${HttpClient.prototype.get.name} method on ${HttpClient.name} once with correct value when the query arg is supplied and return correct value`, () => {
      // Arrange
      const pagesMock: Pages = [
        {
          name: 'Page 1',
          slug: 'page-1',
          page_type: 'type1',
          published: new Date().toISOString(),
          updated: new Date().toISOString(),
          fields: {},
        },
        {
          name: 'Page 2',
          slug: 'page-2',
          page_type: 'type2',
          published: new Date().toISOString(),
          updated: new Date().toISOString(),
          fields: {},
        },
      ];
      const expected = {
        data: pagesMock,
        meta: { next_page: 1, previous_page: 1, count: 100 },
      } as const;
      const queryMock = 'query mock';
      const httpMock = jasmine.createSpyObj<HttpClient>(HttpClient.name, [
        'get',
      ]);
      const injector = Injector.create({
        providers: [{ provide: HttpClient, useValue: httpMock }],
      });
      const service = runInInjectionContext(injector, () => new PageService());
      httpMock.get.and.returnValue(of(expected));

      // Act
      let actual: WrappedData<Pages> & WrappedMeta<PaginationMeta>;
      service
        .search(queryMock)
        .subscribe((data) => (actual = data))
        .unsubscribe();

      // Assert
      expect(httpMock.get).toHaveBeenCalledOnceWith(`/pages/search/`, {
        params: new HttpParams({ fromObject: { query: queryMock }, encoder }),
        context: new HttpContext().set(REQUEST_MARKER, void 0),
      });
      expect(actual!).toEqual(expected);
    });

    it(`should call ${HttpClient.prototype.get.name} method on ${HttpClient.name} once with correct value when the query and params args are supplied and return correct value`, () => {
      // Arrange
      const pagesMock: Pages = [
        {
          name: 'Page 1',
          slug: 'page-1',
          page_type: 'type1',
          published: new Date().toISOString(),
          updated: new Date().toISOString(),
          fields: {},
        },
        {
          name: 'Page 2',
          slug: 'page-2',
          page_type: 'type2',
          published: new Date().toISOString(),
          updated: new Date().toISOString(),
          fields: {},
        },
      ];
      const paramsMock: PageSearchParams = {
        levels: 1,
        page: 5,
        locale: 'en',
        page_size: 50,
        page_type: 'type1',
      };
      const expected = {
        data: pagesMock,
        meta: { next_page: 1, previous_page: 1, count: 100 },
      } as const;
      const queryMock = 'query mock';
      const httpMock = jasmine.createSpyObj<HttpClient>(HttpClient.name, [
        'get',
      ]);
      const injector = Injector.create({
        providers: [{ provide: HttpClient, useValue: httpMock }],
      });
      const service = runInInjectionContext(injector, () => new PageService());
      httpMock.get.and.returnValue(of(expected));

      // Act
      let actual: WrappedData<Pages> & WrappedMeta<PaginationMeta>;
      service
        .search(queryMock, paramsMock)
        .subscribe((data) => (actual = data))
        .unsubscribe();

      // Assert
      expect(httpMock.get).toHaveBeenCalledOnceWith(`/pages/search/`, {
        params: new HttpParams({
          fromObject: { ...paramsMock, query: queryMock },
          encoder,
        }),
        context: new HttpContext().set(REQUEST_MARKER, void 0),
      });
      expect(actual!).toEqual(expected);
    });
  });
});
