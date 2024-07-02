import {
	HttpContext,
	HttpEvent,
	HttpHandlerFn,
	HttpRequest,
	HttpResponse,
} from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Injector, runInInjectionContext } from '@angular/core';
import { fakeAsync } from '@angular/core/testing';
import { responseCacheInterceptor } from './response-cache-interceptor';
import { responseCache } from '../injection-tokens';
import { ResponseCache } from '../types';

describe(responseCacheInterceptor.name, () => {
	it('should call next once with correct value when requestMarker does not exist', fakeAsync(() => {
		// Arrange
		const httpContextMock = jasmine.createSpyObj<HttpContext>(
			HttpContext.name,
			{ has: false },
		);
		const requestMock = jasmine.createSpyObj<HttpRequest<unknown>>(
			HttpRequest.name,
			[],
			{ context: httpContextMock },
		);
		const responseMock = jasmine.createSpyObj<HttpResponse<unknown>>(
			HttpResponse.name,
			['clone'],
		);
		const nextMock = jasmine
			.createSpy<HttpHandlerFn>('HttpHandlerFn')
			.and.returnValue(of(responseMock));

		// Act
		responseCacheInterceptor(requestMock, nextMock);

		// Assert
		expect(nextMock).toHaveBeenCalledOnceWith(requestMock);
	}));

	it('should not cache response when requestMarker does not exist', fakeAsync(() => {
		// Arrange
		const httpContextMock = jasmine.createSpyObj<HttpContext>(
			HttpContext.name,
			{ has: false },
		);
		const requestMock = jasmine.createSpyObj<HttpRequest<unknown>>(
			HttpRequest.name,
			[],
			{ context: httpContextMock },
		);
		const responseMock = jasmine.createSpyObj<HttpResponse<unknown>>(
			HttpResponse.name,
			['clone'],
		);
		const nextMock = jasmine
			.createSpy<HttpHandlerFn>('HttpHandlerFn')
			.and.returnValue(of(responseMock));

		// Act
		let response: HttpEvent<unknown> | undefined;
		responseCacheInterceptor(requestMock, nextMock)
			.subscribe((value) => (response = value))
			.unsubscribe();

		// Assert
		expect(response).toEqual(responseMock);
	}));

	it('should call next once with correct value when requestMarker does exist', fakeAsync(() => {
		// Arrange
		const cachedResponseMock = jasmine.createSpyObj<ResponseCache>(
			'ResponseCache',
			['get', 'set', 'has'],
		);
		const httpContextMock = jasmine.createSpyObj<HttpContext>(
			HttpContext.name,
			{ has: true },
		);
		const requestMock = jasmine.createSpyObj<HttpRequest<unknown>>(
			HttpRequest.name,
			[],
			{ context: httpContextMock },
		);
		const responseMock = jasmine.createSpyObj<HttpResponse<unknown>>(
			HttpResponse.name,
			['clone'],
		);
		const nextMock = jasmine
			.createSpy<HttpHandlerFn>('HttpHandlerFn')
			.and.returnValue(of(responseMock));
		const injector = Injector.create({
			providers: [{ provide: responseCache, useValue: cachedResponseMock }],
		});
		cachedResponseMock.get.and.returnValue(of(responseMock));

		// Act
		runInInjectionContext(injector, () =>
			responseCacheInterceptor(requestMock, nextMock),
		)
			.subscribe()
			.unsubscribe();

		// Assert
		expect(nextMock).toHaveBeenCalledOnceWith(requestMock);
	}));

	it('should set cache when requestMarker does exist and is not currently cached', fakeAsync(() => {
		// Arrange
		const cachedResponseMock = jasmine.createSpyObj<HttpResponse<unknown>>(
			HttpResponse.name,
			['clone'],
		);
		const urlWithParamsMock = 'https://example.com';
		const cacheMock = jasmine.createSpyObj<ResponseCache>('ResponseCache', [
			'get',
			'set',
			'has',
		]);
		const httpContextMock = jasmine.createSpyObj<HttpContext>(
			HttpContext.name,
			{ has: true },
		);
		const requestMock = jasmine.createSpyObj<HttpRequest<unknown>>(
			HttpRequest.name,
			[],
			{ context: httpContextMock, urlWithParams: urlWithParamsMock },
		);
		const responseMock = jasmine.createSpyObj<HttpResponse<unknown>>(
			HttpResponse.name,
			['clone'],
		);
		const nextMock = jasmine
			.createSpy<HttpHandlerFn>('HttpHandlerFn')
			.and.returnValue(of(responseMock));
		const injector = Injector.create({
			providers: [{ provide: responseCache, useValue: cacheMock }],
		});
		cacheMock.has.and.returnValue(false);
		cacheMock.get.and.returnValue(of(cachedResponseMock));

		// Act
		let response: HttpEvent<unknown> | undefined;
		runInInjectionContext(injector, () =>
			responseCacheInterceptor(requestMock, nextMock),
		)
			.subscribe((value) => (response = value))
			.unsubscribe();

		// Assert
		expect(response).toEqual(cachedResponseMock);
		expect(cacheMock.has).toHaveBeenCalledOnceWith(urlWithParamsMock);
		expect(cacheMock.has).toHaveBeenCalledBefore(cacheMock.get);
		expect(cacheMock.has).toHaveBeenCalledBefore(cacheMock.set);
		expect(cacheMock.set).toHaveBeenCalledBefore(cacheMock.get);
		expect(cacheMock.set).toHaveBeenCalledOnceWith(
			urlWithParamsMock,
			jasmine.any(Observable),
		);
		expect(cacheMock.get).toHaveBeenCalledOnceWith(urlWithParamsMock);
	}));

	it('should not set cache response when requestMarker does exist and is currently cached', fakeAsync(() => {
		// Arrange
		const cachedResponseMock = jasmine.createSpyObj<HttpResponse<unknown>>(
			HttpResponse.name,
			['clone'],
		);
		const urlWithParamsMock = 'https://example.com';
		const cacheMock = jasmine.createSpyObj<ResponseCache>('ResponseCache', [
			'get',
			'set',
			'has',
		]);
		const httpContextMock = jasmine.createSpyObj<HttpContext>(
			HttpContext.name,
			{ has: true },
		);
		const requestMock = jasmine.createSpyObj<HttpRequest<unknown>>(
			HttpRequest.name,
			[],
			{ context: httpContextMock, urlWithParams: urlWithParamsMock },
		);
		const responseMock = jasmine.createSpyObj<HttpResponse<unknown>>(
			HttpResponse.name,
			['clone'],
		);
		const nextMock = jasmine
			.createSpy<HttpHandlerFn>('HttpHandlerFn')
			.and.returnValue(of(responseMock));
		const injector = Injector.create({
			providers: [{ provide: responseCache, useValue: cacheMock }],
		});
		cacheMock.get.and.returnValue(of(cachedResponseMock));
		cacheMock.has.and.returnValue(true);

		// Act
		let response: HttpEvent<unknown> | undefined;
		runInInjectionContext(injector, () =>
			responseCacheInterceptor(requestMock, nextMock),
		)
			.subscribe((value) => (response = value))
			.unsubscribe();

		// Assert
		expect(response).toEqual(cachedResponseMock);
		expect(cacheMock.has).toHaveBeenCalledOnceWith(urlWithParamsMock);
		expect(cacheMock.has).toHaveBeenCalledBefore(cacheMock.get);
		expect(cacheMock.set).not.toHaveBeenCalledOnceWith(
			urlWithParamsMock,
			jasmine.any(Observable),
		);
		expect(cacheMock.get).toHaveBeenCalledOnceWith(urlWithParamsMock);
	}));
});
